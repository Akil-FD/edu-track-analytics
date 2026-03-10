import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search, BookOpen, Eye, Clock, Filter } from 'lucide-react';
import { ArticlesListResponse, StudentAnalyticsData, studentService } from '../../api/student';
import { useApi } from '../../hooks/useApi';
import { debounce } from '../../utils/helpers';
import { ArticleCategory } from '../../api/teacher';
import DataPagination from '../../components/ui/DataPagination';
import { CATEGORY_COLORS, ROUTES } from '../../utils/constants';
import { formatTime } from '../../utils/helpers';

export default function StudentArticleList() {
  const PAGE_SIZE = 5;

  const articlesApi = useApi(studentService.getArticles);
  const analyticsApi = useApi(studentService.getAnalytics);

  const [articles, setArticles] = useState<ArticlesListResponse | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalyticsData | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [page, setPage] = useState(1);

  const categories = [
    'All',
    ...(Array.from(new Set(articles?.articles.map(a => a.category))) as ArticleCategory[]),
  ];

  const filtered = useMemo(() => articles, [articles]);

  const totalPages = filtered ? filtered.pagination.pages : 0;
  const safePage = Math.min(page, totalPages);

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

  useEffect(() => {
    const fetchInitialData = () => {
      getAnalytics();
      getArticles();
    }
    fetchInitialData();
  }, [page, debouncedSearch, filterCat]);


  const getArticles = () => {
    articlesApi.request({
      category: filterCat !== 'All' ? filterCat : undefined,
      search: debouncedSearch || undefined,
      page: page ? String(page) : '1',
      limit: '6'
    }).then((data) => {
      setArticles(data);
    });
  };

  const getAnalytics = () => {
    analyticsApi.request({
      category: filterCat !== 'All' ? filterCat : undefined,
      search: debouncedSearch || undefined,
      page: page ? String(page) : '1',
      limit: '6'
    }).then((data) => {
      setAnalytics(data);
    });
  };

  const myProgress = useMemo(() => {
    const map: Record<string, { views: number; duration: number }> = {};
    analytics?.readArticles.forEach(a => {
      map[a.articleId?._id] = { views: a.views, duration: a.duration };
    });
    return map;
  }, [analytics]);

  const getArticleViews = (id: string) =>
    analytics?.readArticles.filter(a => a.articleId?._id === id).reduce((s, a) => s + a.views, 0) ?? 0;

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-slate-800">Browse Articles</h1>
        <p className="text-slate-500 text-sm mt-1">{articles?.articles.length} articles available across {categories.length - 1} categories</p>
      </div>


      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={15} className="text-slate-400 flex-shrink-0" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCat === cat
              ? 'bg-sky-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered?.articles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No articles found matching your search</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered?.articles.map(art => {
              const progress = myProgress[art._id];
              const teacher = art.createdBy.name;
              const totalViews = getArticleViews(art._id);

              return (
                <Link
                  key={art._id}
                  to={`${ROUTES.STUDENT.ARTICLES}/${art._id}`}
                  className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-sky-200 transition-all group"
                >

                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[art.category] || '#64748b' }}
                    >
                      {art.category}
                    </span>
                    {progress && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Read ✓
                      </span>
                    )}
                  </div>


                  <h3 className="text-slate-800 mb-2 group-hover:text-sky-700 transition-colors line-clamp-2">
                    {art.title}
                  </h3>


                  {art.contentBlocks.find(b => b.type === 'text') && (
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                      {art.contentBlocks.find(b => b.type === 'text')?.content}
                    </p>
                  )}


                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {totalViews} views
                    </span>
                    {progress && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(progress.duration)}
                      </span>
                    )}
                    <span className="ml-auto">{art.contentBlocks.length} blocks</span>
                  </div>


                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                      {teacher.charAt(0) || '?'}
                    </div>
                    <span className="text-slate-400 text-xs">{teacher || 'Unknown'}</span>
                    <span className="ml-auto text-slate-300 text-xs">{new Date(art.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <DataPagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filtered?.pagination.total ?? 0}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="articles"
          />
        </div>
      )}
    </div>
  );
}
