import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import DataPagination from '../../../components/ui/DataPagination';
import { ArticleData, HighlightData, StudentAnalyticsData } from '../../../api/student';
import { CATEGORY_COLORS, ROUTES } from '../../../utils/constants';
import { formatTime } from '../../../utils/helpers';

interface ReadingHistoryProps {
    articles: ArticleData[];
    highlights: HighlightData[];
    analytics: StudentAnalyticsData | null;
    totalPages?: number;
    totalItems?: number;
    page?: number;
    onPageChange?: (page: number) => void;
}

export default function ReadingHistory({ page = 1, totalPages = 0, totalItems = 0, articles, highlights, analytics, onPageChange }: ReadingHistoryProps) {
    const safePage = Math.min(page, totalPages);

    const recentReads = analytics?.readArticles ? [...analytics?.readArticles]
        .map(an => ({
            ...an,
            article: articles.find(a => a._id === an?.articleId?._id),
            highlightCount: highlights.filter(h => h.articleId._id === an.articleId?._id).length,
        }))
        .filter(r => r.article) : [];

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-slate-700">Reading History</h2>
                <Link to={ROUTES.STUDENT.ARTICLES} className="text-sky-600 hover:text-sky-700 text-sm flex items-center gap-1">
                    Browse more <ArrowRight size={14} />
                </Link>
            </div>
            {recentReads.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No reading history yet</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left text-slate-500 font-medium py-2 pr-4">Article</th>
                                <th className="text-left text-slate-500 font-medium py-2 pr-4">Category</th>
                                <th className="text-left text-slate-500 font-medium py-2 pr-4">Views</th>
                                <th className="text-left text-slate-500 font-medium py-2 pr-4">Time Spent</th>
                                <th className="text-left text-slate-500 font-medium py-2 pr-4">Highlights</th>
                                <th className="text-left text-slate-500 font-medium py-2">Last Read</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentReads.map(r => (
                                <tr key={r.articleId._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3 pr-4">
                                        <Link to={`${ROUTES.STUDENT.ARTICLES}/${r.articleId._id}`} className="text-sky-700 hover:underline truncate max-w-xs block">
                                            {r.article!.title}
                                        </Link>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                            style={{ backgroundColor: CATEGORY_COLORS[r.article!.category] || '#64748b' }}
                                        >
                                            {r.article!.category}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-slate-600">{r.views}</td>
                                    <td className="py-3 pr-4 text-slate-600">{formatTime(r.duration)}</td>
                                    <td className="py-3 pr-4 text-slate-600">{r.highlightCount}</td>
                                    <td className="py-3 text-slate-500">{new Date(r.lastRead).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className='mt-5'>
                <DataPagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={totalItems ?? 0}
                    pageSize={recentReads.length}
                    onPageChange={(page: number) => onPageChange?.(page)}
                    itemLabel="articles"
                />
            </div>
        </div>
    );
}

