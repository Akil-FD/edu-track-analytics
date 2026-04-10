import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Plus, Box, Save,
  Eye, EyeOff
} from 'lucide-react';
import { ArticleCategory, ArticleData, ContentBlock, ContentBlockType, teacherService } from '../../api/teacher';
import { useApi } from '../../hooks/useApi';
import BlockEditor, { BLOCK_ICONS, BLOCK_LABELS } from './components/BlockEditor';


export default function ArticleForm() {
  const articleApi = useApi(teacherService.getArticle);
  const updateArticleApi = useApi(teacherService.updateArticle);
  const createArticleApi = useApi(teacherService.createArticle);
  const [article, setArticle] = useState<ArticleData>();

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArticleCategory>(ArticleCategory.SCIENCE);
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { _id: 'initial', type: ContentBlockType.TEXT, content: '' },
  ]);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      if (article) {
        setTitle(article.title);
        setCategory(article.category as ArticleCategory);
        setBlocks(article.contentBlocks);
      }
    }
  }, [id, article]);

  useEffect(() => {
    const fetchInitialData = () => {
      if (id)
        articleApi.request(id).then((data) => {
          setArticle(data?.article);
        });
    }
    fetchInitialData();
  }, []);

  const addBlock = (type: ContentBlockType) => {
    setBlocks(prev => [...prev, { _id: Date.now().toString(), type, content: '' }]);
  };

  const updateBlock = (index: number, updated: ContentBlock) => {
    setBlocks(prev => prev.map((b, i) => i === index ? updated : b));
  };

  const removeBlock = (index: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (blocks.length === 0) errs.blocks = 'Add at least one content block';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const updatedBlocks = blocks.map(({ _id, ...rest }) => rest);
    if (isEdit && id) {
      await updateArticleApi.request(id, {
        title, category, contentBlocks: updatedBlocks,
      });
    } else {
      await createArticleApi.request({
        title, category, contentBlocks: updatedBlocks,
      });
      navigate('/teacher/articles');
    }
  };

  function getSketchfabEmbed(url: string) {
    if (!url) return null;

    // extract model id (32 characters)
    const match = url.match(/[a-f0-9]{32}/i);
    if (!match) return null;

    const modelId = match[0];

    return `https://sketchfab.com/models/${modelId}/embed?ui_controls=0&ui_infos=0&ui_hint=0`;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-slate-800">{isEdit ? 'Edit Article' : 'Create Article'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Fill in the details below</p>
        </div>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
        >
          {preview ? <EyeOff size={16} /> : <Eye size={16} />}
          {preview ? 'Edit' : 'Preview'}
        </button>
        <button
          onClick={handleSave}
          disabled={updateArticleApi.loading || createArticleApi.loading}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors disabled:opacity-60"
        >
          {updateArticleApi.loading || createArticleApi.loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isEdit ? 'Update' : 'Publish'}
        </button>
      </div>

      {!preview ? (
        <div className="space-y-5">
          {/* Title & Category */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <div>
              <label className="block text-slate-700 text-sm mb-2">Article Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
                placeholder="Enter a descriptive title..."
                className={`w-full px-4 py-3 rounded-lg border text-slate-800 focus:outline-none transition-colors ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-indigo-400'
                  }`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-slate-700 text-sm mb-2">Category *</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(ArticleCategory).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${category === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Blocks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-700">Content Blocks</h2>
              {errors.blocks && <p className="text-red-500 text-xs">{errors.blocks}</p>}
            </div>
            <div className="space-y-3">
              {blocks.map((block, i) => (
                <BlockEditor
                  key={block._id}
                  block={block}
                  index={i}
                  onChange={b => updateBlock(i, b)}
                  onDelete={() => removeBlock(i)}
                />
              ))}
            </div>
            {/* Add Block Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              {(['text', 'image', 'video', '3d'] as ContentBlockType[]).map(type => {
                const Icon = BLOCK_ICONS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 text-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    <Plus size={14} />
                    <Icon size={14} />
                    {BLOCK_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm mb-3">{category}</span>
            <h1 className="text-slate-900 text-3xl mb-2">{title || 'Untitled Article'}</h1>
          </div>
          <div className="space-y-6 prose max-w-none">
            {blocks.map(block => (
              <div key={block._id}>
                {block.type === 'text' && (
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{block.content}</p>
                )}
                {block.type === 'image' && block.fileUrl && (
                  <img src={block.fileUrl} alt="" className="rounded-xl w-full object-cover max-h-80" />
                )}
                {block.type === 'video' && block.fileUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 flex items-center justify-center">
                    {block.fileUrl.includes('youtube.com') || block.fileUrl.includes('youtu.be') ? (
                      <iframe
                        src={block.fileUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video src={block.fileUrl} controls className="w-full h-full" />
                    )}
                  </div>
                )}
                {block.type === "3d" && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">

                    {getSketchfabEmbed(block.content) ? (
                      <iframe
                        src={getSketchfabEmbed(block.content)!}
                        className="w-full aspect-video"
                        allow="autoplay; xr-spatial-tracking"
                        loading="lazy"
                      />
                    ) : (
                      <div className="p-10 text-center text-slate-500">
                        Invalid or unsupported 3D model link
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
