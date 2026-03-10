import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { TrendingUp, Eye, Clock, Users } from 'lucide-react';
import { Article } from '../../types';
import { AnalyticsResponse, teacherService } from '../../api/teacher';
import { useApi } from '../../hooks/useApi';
import { formatTime } from '../../utils/helpers';

ChartJS.register(
  ArcElement, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler
);

export default function TeacherAnalytics() {
  const { authUser } = useAuth();
  const articlesApi = useApi(teacherService.getArticles);
  const analyticsApi = useApi(teacherService.getAnalytics);

  const [articles, setArticles] = useState<Article[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  const myArticles = useMemo(() => articles.filter(a => a.createdBy._id === authUser?.id), [articles, authUser]);

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

  // Line chart: Daily Engagement (last 7 days)
  const lineData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const labels = days.map(d => d.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
    const viewsData = days.map(day => {
      const dayStr = day.toDateString();
      return (analytics?.dailyEngagement ?? []).filter(a => {
        if (!a.date) return false;
        return new Date(a.date).toDateString() === dayStr;
      }).reduce((sum, a) => sum + a.views, 0);
    });

    const timeData = days.map(day => {
      const dayStr = day.toDateString();

      return Math.round(
        (analytics?.dailyEngagement ?? [])
          .filter(a => {
            if (!a.date) return false;
            return new Date(a.date).toDateString() === dayStr;
          })
          .reduce((sum, a) => sum + a.totalDuration, 0) / 60
      );
    });

    return {
      labels,
      datasets: [
        {
          label: 'Views',
          data: viewsData,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#6366f1',
          pointRadius: 4,
        },
        {
          label: 'Time (min)',
          data: timeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#10b981',
          pointRadius: 4,
        },
      ],
    };
  }, [analytics]);

  // Student-wise table
  const studentStats = useMemo(() => {
    const list =
      analytics?.studentWiseEngagement?.map(
        ({ name, totalRead, totalViews, totalDuration }) => ({
          name,
          articlesRead: totalRead,
          totalViews,
          totalTime: totalDuration
        })
      ) ?? [];

    return list.sort((a, b) => b.totalViews - a.totalViews);
  }, [analytics]);

  const totalViews = analytics?.viewsPerArticle.reduce((s, a) => s + a.totalViews, 0) ?? 0;
  const totalTime = analytics?.viewsPerArticle.reduce((s, a) => s + a.totalDuration, 0) ?? 0;
  const uniqueStudents = analytics?.kpis.totalStudentsRead ?? 0;
  const avgViews = myArticles.length > 0 ? (totalViews / myArticles.length).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-slate-800">Analytics Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Engagement overview across all your articles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'indigo', bg: 'bg-indigo-50', tc: 'text-indigo-600' },
          { label: 'Unique Students', value: uniqueStudents, icon: Users, color: 'sky', bg: 'bg-sky-50', tc: 'text-sky-600' },
          { label: 'Total Time (min)', value: Math.round(totalTime / 60), icon: Clock, color: 'emerald', bg: 'bg-emerald-50', tc: 'text-emerald-600' },
          { label: 'Avg Views/Article', value: avgViews, icon: TrendingUp, color: 'violet', bg: 'bg-violet-50', tc: 'text-violet-600' },
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

      {/* Line Chart - Daily Engagement */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-slate-700 mb-1">Daily Engagement Trends</h2>
        <p className="text-slate-400 text-sm mb-5">Views and reading time over the last 7 days</p>
        <div style={{ height: 280 }}>
          <Line
            data={lineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: { legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } } },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } }, beginAtZero: true },
              },
            }}
          />
        </div>
      </div>

      {/* Student Engagement Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-slate-700 mb-5">Student-wise Engagement</h2>
        {studentStats.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No student data yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-slate-500 font-medium py-2 pr-4">Student</th>
                  <th className="text-left text-slate-500 font-medium py-2 pr-4">Articles Read</th>
                  <th className="text-left text-slate-500 font-medium py-2 pr-4">Total Views</th>
                  <th className="text-left text-slate-500 font-medium py-2 pr-4">Time Spent</th>
                  <th className="text-left text-slate-500 font-medium py-2">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {studentStats.map((s, i) => {
                  const progress = myArticles.length > 0 ? Math.round((s.articlesRead / myArticles.length) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                            {s.name.charAt(0)}
                          </div>
                          <span className="text-slate-800">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{s.articlesRead} / {myArticles.length}</td>
                      <td className="py-3 pr-4 text-slate-600">{s.totalViews}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatTime(s.totalTime)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-24">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{progress}%</span>
                        </div>
                      </td>
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
