import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { PlusCircle, Search, Edit2, Trash2, BookOpen, Filter } from 'lucide-react';
import { FilterCategory } from '../../types';
import { ArticleCategory, AnalyticsResponse, teacherService, ArticlesListResponse } from '../../api/teacher';
import { useApi } from '../../hooks/useApi';
import { debounce } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import DataPagination from '../../components/ui/DataPagination';
import { CATEGORY_COLORS, ROUTES } from '../../utils/constants';


export default function TeacherArticles() {
  const PAGE_SIZE = 5;

  const articlesApi = useApi(teacherService.getArticles);
  const analyticsApi = useApi(teacherService.getAnalytics);
  const deleteArticleApi = useApi(teacherService.deleteArticle);

  const [articles, setArticles] = useState<ArticlesListResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCat, setFilterCat] = useState<FilterCategory>('All');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { success: successToast, error: errorToast } = useToast();

  const filtered = useMemo(() => articles, [articles]);

  const totalPages = filtered ? filtered.pagination.pages : 0;
  const safePage = Math.min(page, totalPages);


  useEffect(() => {
    const fetchInitialData = () => {
      getAnalytics();
      getArticles();
    }
    fetchInitialData();
  }, [page, debouncedSearch, filterCat]);


  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
    }, 500),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
  };


  const getArticles = () => {
    articlesApi.request({
      category: filterCat !== 'All' ? filterCat : undefined,
      search: debouncedSearch || undefined,
      page: page ? String(page) : '1'
    }).then((data) => {
      setArticles(data);
    });
  };

  const getAnalytics = () => {
    analyticsApi.request({
      category: filterCat !== 'All' ? filterCat : undefined,
      search: debouncedSearch || undefined,
      page: page ? String(page) : '1'
    }).then((data) => {
      setAnalytics(data);
    });
  };

  const deleteArticles = (id: string) => {
    deleteArticleApi.request(id)
      .then((res: { success: boolean; message?: string } | null) => {
        if (res?.success) {
          successToast(
            res.message ?? "The article and its analytics have been removed."
          );
          getArticles();
        }
      })
      .catch(() =>
        errorToast('Something went wrong. Please try again.')
      );
  }

  const handleDelete = (id: string) => {
    deleteArticles(id);
    setConfirmDelete(null);
  };

  const usedCategories: FilterCategory[] = [
    'All',
    ...(Array.from(new Set(articles?.articles.map(a => a.category))) as ArticleCategory[]),
  ];

  const getViews = (id: string) => {
    return analytics?.viewsPerArticle.find((analytic) => analytic._id === id)?.totalViews || 0
  };
  const getStudents = (id: string) => {
    return analytics?.viewsPerArticle.find((analytic) => analytic._id === id)?.uniqueStudents || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800">My Articles</h1>
          <p className="text-slate-500 text-sm mt-1">{articles?.articles.length} article{articles?.articles.length !== 1 ? 's' : ''} created</p>
        </div>
        <Link
          to={ROUTES.TEACHER.ARTICLE_NEW}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors"
        >
          <PlusCircle size={16} />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter size={16} className="text-slate-400 flex-shrink-0" />
          {usedCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterCat === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      {filtered?.articles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No articles found</p>
          {articles?.articles.length === 0 && (
            <Link to={ROUTES.TEACHER.ARTICLE_NEW} className="mt-3 inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline">
              <PlusCircle size={14} /> Create your first article
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {articles?.articles?.map(art => (
            <div
              key={art._id}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[art.category] || '#64748b' }}
                    >
                      {art.category}
                    </span>
                    <span className="text-slate-400 text-xs">{art.contentBlocks.length} block{art.contentBlocks.length !== 1 ? 's' : ''}</span>
                  </div>
                  <h3 className="text-slate-800 truncate">{art.title}</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Created {new Date(art.createdAt).toLocaleDateString()}
                    {art.updatedAt !== art.createdAt && ` · Updated ${new Date(art.updatedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 text-sm text-slate-500">
                  <div className="text-center hidden sm:block">
                    <div className="font-semibold text-slate-800">{getViews(art._id)}</div>
                    <div className="text-xs text-slate-400">views</div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="font-semibold text-slate-800">{getStudents(art._id)}</div>
                    <div className="text-xs text-slate-400">students</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/teacher/articles/${art._id}/edit`)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(art._id)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <DataPagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={filtered?.pagination.total ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemLabel="articles"
      />

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-slate-800 mb-2">Delete Article</h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this article? This action cannot be undone and will remove all associated analytics data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
