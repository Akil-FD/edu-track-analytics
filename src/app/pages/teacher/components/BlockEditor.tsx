import { Box, GripVertical, Image, Trash2, Type, Video } from "lucide-react";
import { ContentBlock, ContentBlockType } from "../../../api/teacher";


export const BLOCK_ICONS: Record<ContentBlockType, React.ElementType> = {
    text: Type, image: Image, video: Video, '3d': Box,
};

export const BLOCK_LABELS: Record<ContentBlockType, string> = {
    text: 'Text', image: 'Image', video: 'Video', '3d': '3D Object',
};


export default function BlockEditor({
    block,
    onChange,
    onDelete,
    index,
}: {
    block: ContentBlock;
    onChange: (b: ContentBlock) => void;
    onDelete: () => void;
    index: number;
}) {
    const Icon = BLOCK_ICONS[block.type];

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden group">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                {/* <GripVertical size={16} className="text-slate-300" /> */}
                <div className="flex items-center gap-2 flex-1">
                    <Icon size={15} className="text-slate-500" />
                    <span className="text-xs text-slate-500 font-medium">{BLOCK_LABELS[block.type]} Block {index + 1}</span>
                </div>
                <button
                    type="button"
                    onClick={onDelete}
                    className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="p-4">
                {block.type === 'text' && (
                    <textarea
                        value={block.content}
                        onChange={e => onChange({ ...block, content: e.target.value })}
                        placeholder="Enter text content..."
                        rows={5}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-indigo-400 resize-y"
                    />
                )}
                {block.type === 'image' && (
                    <div className="space-y-3">
                        <input
                            type="url"
                            value={block.fileUrl}
                            onChange={e => onChange({ ...block, fileUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-indigo-400"
                        />
                        {block.fileUrl && (
                            <div className="rounded-lg overflow-hidden border border-slate-200 max-h-48">
                                <img
                                    src={block.fileUrl}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>
                )}
                {block.type === 'video' && (
                    <div className="space-y-3">
                        <input
                            type="url"
                            value={block.fileUrl}
                            onChange={e => onChange({ ...block, fileUrl: e.target.value })}
                            placeholder="YouTube URL or video link..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-indigo-400"
                        />
                        {block.fileUrl && (
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
                    </div>
                )}
                {block.type === '3d' && (
                    <div className="space-y-3">
                        <input
                            type="url"
                            value={block.content}
                            onChange={e => onChange({ ...block, content: e.target.value })}
                            placeholder="Sketchfab embed URL..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-indigo-400"
                        />

                        {block.content && (
                            <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video">
                                <iframe
                                    src={block.content}
                                    className="w-full h-full"
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}