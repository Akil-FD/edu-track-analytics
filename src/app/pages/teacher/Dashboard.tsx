import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, ArrowRight, PlusCircle } from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Article } from '../../types';
import { useApi } from '../../hooks/useApi';
import { AnalyticsResponse, teacherService } from '../../api/teacher';
import { CATEGORY_COLORS, ROUTES } from '../../utils/constants';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


export default function TeacherDashboard() {
  const { authUser } = useAuth();
  const articlesApi = useApi(teacherService.getArticles);
  const analyticsApi = useApi(teacherService.getAnalytics);

  const [articles, setArticles] = useState<Article[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    const fetchInitialData = () => {
      getAnalytics();
      getArticles();
    }
    fetchInitialData();
  }, []);


  const getArticles = () => {
    articlesApi.request().then((data) => {
      const articles = (data?.articles || []).map((article: any) => ({
        _id: article._id || article.id,
        title: article.title,
        category: article.category,
        contentBlocks: article.contentBlocks,
        createdBy: article.createdBy,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      }));
      setArticles(articles);
    });
  };

  const getAnalytics = () => {
    analyticsApi.request().then((data) => {
      setAnalytics(data);
    });
  };

  const stats = useMemo(() => {
    const uniqueStudents = analytics?.kpis.totalStudentsRead || 0;

    // Category distribution
    const catMap: Record<string, number> = {};
    articles.forEach(art => {
      catMap[art.category] = (catMap[art.category] || 0) + 1;
    });

    const top3 = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { totalArticles: articles.length, uniqueStudents, catMap, top3 };
  }, [articles, analytics]);


  const pieData = useMemo(() => {
    const cats = Object.keys(stats.catMap);
    return {
      labels: cats,
      datasets: [{
        data: cats.map(c => stats.catMap[c]),
        backgroundColor: cats.map(c => CATEGORY_COLORS[c] || CATEGORY_COLORS.Other),
        borderWidth: 0,
      }],
    };
  }, [stats.catMap]);

  // Bar chart - Articles Views
  const barData = useMemo(() => {
    const sorted = analytics?.viewsPerArticle
      .map(art => ({ title: art.title.length > 20 ? art.title.slice(0, 20) + '…' : art.title, views: art.totalViews || 0 }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);
    return {
      labels: sorted?.map(s => s.title),
      datasets: [{
        label: 'Total Views',
        data: sorted?.map(s => s.views),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 6,
      }],
    };
  }, [articles, analytics]);

  const recentArticles = useMemo(() =>
    [...articles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [articles]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800">Good day, {authUser?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's your teaching overview</p>
        </div>
        <Link
          to={ROUTES.TEACHER.ARTICLE_NEW}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors"
        >
          <PlusCircle size={16} />
          New Article
        </Link>
      </div>


      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Articles Created', value: stats.totalArticles, icon: BookOpen, color: 'indigo', bg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
          { label: 'Students Read', value: stats.uniqueStudents, icon: Users, color: 'sky', bg: 'bg-sky-50', iconColor: 'text-sky-600' },
        ].map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={iconColor} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-slate-500 text-sm">{label}</div>
          </div>
        ))}

        {stats.top3.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-slate-700 mb-4">Top 3 Categories</h2>
            <div className="grid grid-cols-3 gap-4">
              {stats.top3.map(([cat, count], i) => (
                <div key={cat} className="text-center p-4 rounded-xl bg-slate-50">
                  <div className="text-2xl mb-1">{['🥇', '🥈', '🥉'][i]}</div>
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{ color: CATEGORY_COLORS[cat] || '#64748b' }}
                  >
                    {cat}
                  </div>
                  <div className="text-slate-500 text-xs">{count} article{count !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-slate-700 mb-4">Articles vs Views</h2>
          <div style={{ height: 260 }}>
            {articles.length > 0 ? (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                    y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data yet</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-slate-700 mb-4">Category Distribution</h2>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {articles.length > 0 ? (
                <Pie
                  data={pieData}
                  options={{
                    responsive: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </div>
            <div className="space-y-2 flex-1">
              {Object.entries(stats.catMap).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] || '#64748b' }} />
                  <span className="text-slate-600 flex-1">{cat}</span>
                  <span className="text-slate-800 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-700">Recent Articles</h2>
          <Link to={ROUTES.TEACHER.ARTICLES} className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recentArticles.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No articles yet. Create your first one!</p>
            <Link to={ROUTES.TEACHER.ARTICLE_NEW} className="mt-3 inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline">
              <PlusCircle size={14} /> Create Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-slate-500 font-medium py-2 pr-4">Title</th>
                  <th className="text-left text-slate-500 font-medium py-2 pr-4">Category</th>
                  <th className="text-left text-slate-500 font-medium py-2 pr-4">Views</th>
                  <th className="text-left text-slate-500 font-medium py-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentArticles.map(art => {
                  const artViews = analytics?.viewsPerArticle.filter(a => a._id === art._id).reduce((s, a) => s + a.totalViews, 0);
                  return (
                    <tr key={art._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 text-slate-800 font-medium">{art.title}</td>
                      <td className="py-3 pr-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[art.category] || '#64748b' }}
                        >
                          {art.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{artViews}</td>
                      <td className="py-3 text-slate-500">{new Date(art.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}