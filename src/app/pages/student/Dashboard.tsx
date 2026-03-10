import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, Highlighter, TrendingUp, ArrowRight } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useApi } from '../../hooks/useApi';
import { ArticlesListResponse, HighlightData, StudentAnalyticsData, studentService } from '../../api/student';
import { useToast } from '../../context/ToastContext';
import { CATEGORY_COLORS, ROUTES } from '../../utils/constants';
import { formatTime } from '../../utils/helpers';
import ReadingHistory from './components/ReadingHistory';
import HighlightsList from './components/HighlightsList';


ChartJS.register(ArcElement, Tooltip, Legend);


export default function StudentDashboard() {
  const { authUser } = useAuth();
  const articlesApi = useApi(studentService.getArticles);
  const analyticsApi = useApi(studentService.getAnalytics);
  const highlightsApi = useApi(studentService.getHighlights);
  const deleteHighlightApi = useApi(studentService.deleteHighlight);

  const [articles, setArticles] = useState<ArticlesListResponse | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalyticsData | null>(null);
  const [highlights, setHighlights] = useState<HighlightData[]>([]);
  const [activeTab, setActiveTab] = useState<'highlights' | 'history'>('history');
  const [page, setPage] = useState(1);
  const { success: successToast, error: errorToast } = useToast();

  const stats = useMemo(() => {
    const totalRead = analytics?.stats?.totalArticlesRead ?? 0;
    const totalTime = analytics?.stats?.totalReadingTime ?? 0;
    const totalHighlights = highlights.length;

    // Time per category
    const catTime: Record<string, number> = {};

    (analytics?.timePerCategory ?? []).forEach(category => {
      catTime[category._id] = category.totalDuration;
    });

    return { totalRead, totalTime, totalHighlights, catTime };
  }, [analytics, highlights]);

  useEffect(() => {
    const fetchInitialData = () => {
      getHighlights();
      getAnalytics();
      getArticles();
    }
    fetchInitialData();
  }, []);


  const getArticles = () => {
    articlesApi.request({
      page: page ? String(page) : '1',
      limit: '6'
    }).then((data) => {
      setArticles(data);
    });
  };

  const getAnalytics = () => {
    analyticsApi.request({
      page: page ? String(page) : '1',
      limit: '6'
    }).then((data) => {
      setAnalytics(data);
    });
  };

  const getHighlights = () => {
    highlightsApi.request().then((data) => {
      setHighlights(data?.highlights ?? []);
    });
  };

  const deleteHighlight = (id: string) => {
    deleteHighlightApi.request(id)
      .then((res: { success: boolean; message?: string } | null) => {
        if (res?.success) {
          successToast(
            res.message ?? "Highlights have been removed from this article."
          );
          getArticles();
        }
      })
      .catch(() =>
        errorToast('Something went wrong. Please try again.')
      );
  };

  // Pie chart - Time per category
  const pieData = useMemo(() => {
    const cats = Object.keys(stats.catTime);
    return {
      labels: cats,
      datasets: [{
        data: cats.map(c => Math.round(stats.catTime[c] / 60)),
        backgroundColor: cats.map(c => CATEGORY_COLORS[c] || CATEGORY_COLORS.Other),
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };
  }, [stats.catTime]);

  // Recent reads
  const recentReads = useMemo(() => {
    return analytics?.readArticles ? [...analytics?.readArticles]
      .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime())
      .map(an => ({
        ...an,
        article: articles?.articles.find(a => a._id === an?.articleId?._id),
        highlightCount: highlights.filter(h => h.articleId._id === an.articleId?._id).length,
      }))
      .filter(r => r.articleId) : [];
  }, [analytics, articles, highlights]);
  console.log(recentReads);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-slate-800">Welcome back, {authUser?.name?.split(' ')[0]}! 📚</h1>
        <p className="text-slate-500 text-sm mt-1">Keep up the great reading!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Articles Read', value: stats.totalRead, icon: BookOpen, bg: 'bg-sky-50', tc: 'text-sky-600' },
          { label: 'Time Spent', value: formatTime(stats.totalTime), icon: Clock, bg: 'bg-violet-50', tc: 'text-violet-600' },
          { label: 'Highlights', value: stats.totalHighlights, icon: Highlighter, bg: 'bg-amber-50', tc: 'text-amber-600' },
          { label: 'Categories', value: Object.keys(stats.catTime).length, icon: TrendingUp, bg: 'bg-emerald-50', tc: 'text-emerald-600' },
        ].map(({ label, value, icon: Icon, bg, tc }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={tc} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-slate-500 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Pie Chart + Recent Reads */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-slate-700 mb-1">Reading Time by Category</h2>
          <p className="text-slate-400 text-sm mb-5">Minutes spent per subject</p>
          {Object.keys(stats.catTime).length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <Pie
                  data={pieData}
                  options={{
                    responsive: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
              <div className="space-y-2.5 flex-1">
                {Object.entries(stats.catTime)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, sec]) => (
                    <div key={cat} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] || '#64748b' }} />
                      <span className="text-slate-600 flex-1">{cat}</span>
                      <span className="text-slate-800 font-medium">{Math.round(sec / 60)}m</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Start reading to see your stats!</p>
              <Link to={ROUTES.STUDENT.ARTICLES} className="mt-2 inline-block text-sky-600 text-sm hover:underline">
                Browse Articles →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-slate-700 mb-5">Continue Reading</h2>
          {recentReads.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No articles read yet</p>
              <Link to={ROUTES.STUDENT.ARTICLES} className="mt-2 inline-block text-sky-600 text-sm hover:underline">
                Browse Articles →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReads.slice(0, 4).map((r, index) => (
                <Link
                  key={r?.articleId?._id ?? index}
                  to={`${ROUTES.STUDENT.ARTICLES}/${r.articleId._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (CATEGORY_COLORS[r.articleId!.category] || '#64748b') + '20' }}
                  >
                    <BookOpen size={16} style={{ color: CATEGORY_COLORS[r.articleId!.category] || '#64748b' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm truncate">{r.articleId!.title}</p>
                    <p className="text-slate-400 text-xs">{formatTime(r.duration)} · {r.highlightCount} highlights</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-sky-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(['history', 'highlights'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab === 'highlights' ? `Highlights (${highlights.length})` : `History (${recentReads?.length})`}
          </button>
        ))}
      </div>

      {/* Reading History Table */}
      {activeTab === 'history' && articles && (
        <ReadingHistory
          articles={articles?.articles}
          highlights={highlights}
          analytics={analytics}
          page={page}
          totalItems={analytics?.pagination.total}
          totalPages={analytics?.pagination.pages}
          onPageChange={setPage}
        />
      )}

      {activeTab === 'highlights' && (
        <HighlightsList
          articles={articles?.articles ?? []}
          highlights={highlights}
          deleteHighlight={deleteHighlight}
        />
      )}

    </div>
  );
}
