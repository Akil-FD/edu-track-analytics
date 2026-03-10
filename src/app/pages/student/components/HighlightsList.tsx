import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Trash2, StickyNote, ChevronDown, Highlighter, ArrowRight } from 'lucide-react';
import { ArticleData, HighlightData, } from '../../../api/student';
import { CATEGORY_COLORS, ROUTES } from '../../../utils/constants';



interface HighlightsListProps {
  articles: ArticleData[];
  highlights: HighlightData[];
  // analytics: StudentAnalyticsData | null;
  deleteHighlight: (id: string) => void;
}

export default function HighlightsList({ articles, highlights, deleteHighlight }: HighlightsListProps) {
  const [openArticles, setOpenArticles] = useState<Record<string, boolean>>({});

  const toggleArticle = (id: string) => {
    setOpenArticles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const highlightsByArticle = useMemo(() => {
    const map: Record<string, { article: ArticleData; highlights: HighlightData[] }> = {};
    highlights.forEach(h => {
      const art = articles.find(a => a._id === h.articleId._id);
      if (!art) return;
      if (!map[h.articleId._id]) map[h.articleId._id] = { article: art, highlights: [] };
      map[h.articleId._id].highlights.push(h);
    });
    return Object.values(map);
  }, [highlights, articles]);

  return (
    <div className="space-y-5">
      {highlightsByArticle.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Highlighter size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 mb-2">No highlights yet</p>
          <p className="text-slate-400 text-sm">Select text while reading an article to highlight it</p>
          <Link to={ROUTES.STUDENT.ARTICLES} className="mt-3 inline-flex items-center gap-1 text-sky-600 text-sm hover:underline">
            Browse Articles <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        highlightsByArticle.map(({ article, highlights: hs }) => (
          <div
            key={article._id}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div
              onClick={() => toggleArticle(article._id)}
              className="px-5 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: CATEGORY_COLORS[article.category] || "#64748b"
              }}
            >
              <div>
                <Link
                  to={`${ROUTES.STUDENT.ARTICLES}/${article._id}`}
                  className="text-slate-800 hover:text-sky-700 transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  {article.title}
                </Link>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs text-white"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[article.category] || "#64748b"
                    }}
                  >
                    {article.category}
                  </span>

                  <span className="text-slate-400 text-xs">
                    {hs.length} highlight{hs.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <ChevronDown
                size={16}
                className={`transition-transform ${openArticles[article._id] ? "rotate-180" : ""
                  }`}
              />
            </div>

            {/* Highlights */}
            {openArticles[article._id] && (
              <div className="divide-y divide-slate-50">
                {hs.map(h => (
                  <div key={h._id} className="px-5 py-4 flex gap-4">
                    <div className="w-1 rounded-full bg-amber-400 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-sm italic mb-2">
                        "{h.text}"
                      </p>

                      {h.note && (
                        <div className="flex items-start gap-2 bg-slate-50 rounded-lg px-3 py-2">
                          <StickyNote
                            size={13}
                            className="text-amber-500 flex-shrink-0 mt-0.5"
                          />
                          <p className="text-slate-600 text-xs">{h.note}</p>
                        </div>
                      )}

                      <p className="text-slate-400 text-xs mt-2">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteHighlight(h._id);
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

