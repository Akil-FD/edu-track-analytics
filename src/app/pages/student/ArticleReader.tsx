

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Clock, Eye, Highlighter, StickyNote,
  Trash2, Edit2, Check, X, Box, BookOpen,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { ArticleData, HighlightData, StudentAnalyticsData, studentService, UpdateDurationRequest } from '../../api/student';
// import { formatTime } from '../../utils/helpers';
import { CATEGORY_COLORS, ROUTES } from '../../utils/constants';


function formatTime(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

type TextSegment =
  | { type: "text"; content: string }
  | { type: "mark"; content: string; highlight: HighlightData };

function buildSegments(content: string, highlights: HighlightData[]): TextSegment[] {
  if (!highlights.length) return [{ type: "text", content }];

  const ranges = highlights
    .map(h => {
      const start = content.indexOf(h.text);
      if (start === -1) return null;

      return {
        start,
        end: start + h.text.length,
        highlight: h
      };
    })
    .filter(Boolean) as { start: number; end: number; highlight: HighlightData }[];

  ranges.sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const r of ranges) {
    if (r.start > cursor) {
      segments.push({
        type: "text",
        content: content.slice(cursor, r.start)
      });
    }

    segments.push({
      type: "mark",
      content: content.slice(r.start, r.end),
      highlight: r.highlight
    });

    cursor = r.end;
  }

  if (cursor < content.length) {
    segments.push({
      type: "text",
      content: content.slice(cursor)
    });
  }

  return segments;
}

const HighlightedText = React.memo(function HighlightedText({
  content,
  highlights,
  activeId,
  onMarkClick
}: {
  content: string
  highlights: HighlightData[]
  activeId: string | null
  onMarkClick: (h: HighlightData) => void
}) {

  const segments = useMemo(
    () => buildSegments(content, highlights),
    [content, highlights]
  );

  return (
    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">

      {segments.map((seg, i) => {

        if (seg.type === "text") {
          return <span key={i}>{seg.content}</span>;
        }

        const h = seg.highlight;

        const isActive = activeId === h._id;

        return (
          <mark
            key={i}
            data-highlight-id={h._id}
            onClick={(e) => {
              e.stopPropagation();
              onMarkClick(h);
            }}
            className={`cursor-pointer rounded px-0.5 transition
              ${isActive
                ? "bg-amber-400 ring-2 ring-amber-500"
                : "bg-amber-200 hover:bg-amber-300"
              }`}
          >
            {seg.content}
          </mark>
        );
      })}

    </p>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ArticleReader() {
  const { id } = useParams<{ id: string }>();
  const { authUser } = useAuth();
  const articleApi = useApi(studentService.getArticle);
  const analyticsApi = useApi(studentService.getAnalytics);
  const highlightsApi = useApi(studentService.getHighlightsByArticle);
  const deleteHighlightApi = useApi(studentService.deleteHighlight);
  const createHighlightApi = useApi(studentService.createHighlight);
  const logTrackingApi = useApi(studentService.logTracking);

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalyticsData | null>(null);
  const [highlights, setHighlights] = useState<HighlightData[]>([]);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const teacher = article ? article.createdBy : null;
  const myAnalytics = analytics?.readArticles.find(a => a.articleId._id === id && a.studentId === authUser?.id);
  const myHighlights = highlights;

  const startTimeRef = useRef<number>(Date.now());
  const durationRef = useRef<number>(myAnalytics?.duration || 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(myAnalytics?.duration || 0);

  const [noteModal, setNoteModal] = useState<{ text: string; note: string } | null>(null);

  const [showHighlights, setShowHighlights] = useState(false);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);


  // ── Reading-time effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (!article || !authUser) return;

    startTimeRef.current = Date.now();
    durationRef.current = myAnalytics?.duration || 0;

    setElapsed(durationRef.current);

    timerRef.current = setInterval(() => {
      const additional = Math.round((Date.now() - startTimeRef.current) / 1000);
      setElapsed(durationRef.current + additional);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [article, authUser]);

  useEffect(() => {
    return () => {
      const additional = Math.round((Date.now() - startTimeRef.current) / 1000);

      if (id) {
        logTrackingApi.request({
          articleId: id,
          duration: additional
        });
      }
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = () => {
      getHighlights();
      getAnalytics();
      getArticles();
    }

    fetchInitialData();
  }, []);


  const getArticles = () => {
    if (id)
      articleApi.request(id).then((data) => {
        setArticle(data?.article ?? null);
      });
  };

  const getAnalytics = () => {
    analyticsApi.request().then((data) => {
      setAnalytics(data);
    });
  };

  const getHighlights = () => {
    if (id)
      highlightsApi.request(id).then((data) => {
        setHighlights(data?.highlights ?? []);
      });
  }

  const deleteHighlights = (deleteId: string) => {
    if (id)
      deleteHighlightApi.request(deleteId)
        .then((res: { success: boolean; message?: string } | null) => {
          if (res?.success) {
            success(res.message ?? "Highlights have been removed from this article.");
            getHighlights();
          }
        }).catch(() =>
          error('Something went wrong. Please try again.')
        );
  }

  // ── Text selection ─────────────────────────────────────────────────────────
  const handleMouseUp = useCallback(() => {

    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();

    if (text.length < 3) {
      selection.removeAllRanges();
      return;
    }

    const range = selection.getRangeAt(0);

    if (!contentRef.current?.contains(range.commonAncestorContainer)) {
      selection.removeAllRanges();
      return;
    }

    setNoteModal({
      text,
      note: ""
    });

    selection.removeAllRanges();

  }, []);


  const saveHighlight = useCallback(async () => {

    if (!noteModal || !article) return;

    try {

      const res = await createHighlightApi.request({
        articleId: article._id,
        text: noteModal.text,
        note: noteModal.note
      });

      const newHighlight = res?.highlight;

      if (!newHighlight) return;

      setHighlights(prev => [...prev, newHighlight]);

      setActiveHighlightId(newHighlight._id);

      setShowHighlights(true);

      setNoteModal(null);

      success("Highlight saved");

    } catch {
      error("Failed to save highlight");
    }

  }, [noteModal, article]);

  const handleDeleteHighlight = (hId: string) => {
    deleteHighlights(hId);
    if (activeHighlightId === hId) setActiveHighlightId(null);
  };

  const handleMarkClick = useCallback((h: HighlightData) => {
    setActiveHighlightId(h._id);
    setShowHighlights(true);
    // Scroll to the sidebar card
    setTimeout(() => {
      document.getElementById(`hl-card-${h._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }, []);

  // ── Click highlight in sidebar → scroll to it in article ──────────────────
  const scrollToMark = (hId: string) => {
    setActiveHighlightId(hId);
    const el = contentRef.current?.querySelector(`[data-highlight-id="${hId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <BookOpen size={40} className="mb-3 opacity-40" />
        <p>Article not found</p>
        <Link to={ROUTES.STUDENT.ARTICLES} className="mt-3 text-sky-600 hover:underline text-sm">Back to articles</Link>
      </div>
    );
  }

  const totalViews = analytics?.readArticles.filter(a => a.articleId._id === article._id).reduce((s, a) => s + a.views, 0) ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6" onClick={() => { setActiveHighlightId(null); }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <Link to={ROUTES.STUDENT.ARTICLES} className="text-sky-600 hover:underline text-xs">← Back to Articles</Link>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm flex-shrink-0">
          <Clock size={14} />
          <span>{formatTime(elapsed)}</span>
        </div>
        {/* Highlights toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowHighlights(v => !v); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${showHighlights ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          <Highlighter size={15} />
          <span>{myHighlights.length}</span>
        </button>
      </div>

      {/* ── Content + Sidebar ────────────────────────────────────────────── */}
      <div className="flex gap-6 items-start">

        {/* Article */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Article header */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[article.category] || '#64748b' }}
                >
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-slate-400 text-sm">
                  <Eye size={14} /> {totalViews} views
                </span>
              </div>
              <h1 className="text-slate-900 text-3xl mb-4">{article.title}</h1>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                  {teacher?.name.charAt(0) || '?'}
                </div>
                <span>{teacher?.name || 'Unknown'}</span>
                <span>·</span>
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Content blocks */}
            <div
              ref={contentRef}
              className="p-8 space-y-6 select-text"
              onMouseUp={(e) => { e.stopPropagation(); handleMouseUp(); }}
            >
              {article.contentBlocks.map(block => (
                <div key={block._id}>
                  {block.type === 'text' && (
                    <HighlightedText
                      content={block.content}
                      highlights={myHighlights}
                      activeId={activeHighlightId}
                      onMarkClick={handleMarkClick}
                    />
                  )}
                  {block.type === 'image' && block.content && (
                    <div className="rounded-xl overflow-hidden border border-slate-100">
                      <img src={block.content} alt="" className="w-full object-cover max-h-80" />
                    </div>
                  )}
                  {block.type === 'video' && block.content && (
                    <div className="rounded-xl overflow-hidden border border-slate-100 aspect-video bg-slate-900">
                      {block.content.includes('youtube') || block.content.includes('youtu.be') ? (
                        <iframe
                          src={block.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video src={block.content} controls className="w-full h-full" />
                      )}
                    </div>
                  )}
                  {block.type === '3d' && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">

                      {/* {block.content ? ( */}
                      <iframe
                        src={`https://sketchfab.com/models/cabee2413a94430899182f568fff6ae1/embed`}
                        // src={`${block.content}`}
                        className="w-full aspect-video"
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        allowFullScreen
                      />
                      {/* ) : (
                        <div className="p-10 flex flex-col items-center text-center bg-gradient-to-br from-indigo-50 to-violet-50">
                          <Box
                            size={48}
                            className="text-indigo-400 mb-4 animate-spin"
                            style={{ animationDuration: "8s" }}
                          />
                          <p className="text-slate-600">3D Object</p>
                          <p className="text-slate-400 text-sm mt-1">
                            Add a 3D model URL to preview
                          </p>
                        </div>
                      )} */}

                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hint bar */}
          <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <Highlighter size={15} className="text-amber-500 flex-shrink-0" />
            <span>Select any text in the article to highlight it and attach a note.</span>
            {myHighlights.length > 0 && (
              <span className="ml-auto text-amber-600 font-medium whitespace-nowrap">
                {myHighlights.length} highlight{myHighlights.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* ── Highlights Sidebar ──────────────────────────────────────────── */}
        {showHighlights && (
          <div className="w-72 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm sticky top-4">
              {/* Sidebar header */}
              <div className="px-4 py-3 border-b border-amber-100 flex items-center justify-between">
                <h3 className="text-amber-800 flex items-center gap-2">
                  <Highlighter size={15} />
                  <span>My Highlights</span>
                  {myHighlights.length > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                      {myHighlights.length}
                    </span>
                  )}
                </h3>
                <button onClick={() => setShowHighlights(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={15} />
                </button>
              </div>

              {/* Highlight cards */}
              <div className="p-3 space-y-2 max-h-[65vh] overflow-y-auto">
                {myHighlights.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <StickyNote size={28} className="mx-auto mb-2 opacity-40" />
                    <p>No highlights yet.</p>
                    <p className="text-xs mt-1 text-slate-300">Select text to get started</p>
                  </div>
                ) : (
                  myHighlights.map(h => (
                    <div
                      id={`hl-card-${h._id}`}
                      key={h._id}
                      onClick={() => scrollToMark(h._id)}
                      className={`rounded-xl p-3 cursor-pointer transition-all border ${activeHighlightId === h._id
                        ? 'bg-amber-100 border-amber-400 shadow-sm'
                        : 'bg-amber-50 border-amber-100 hover:border-amber-300'
                        }`}
                    >
                      {/* Highlight text preview */}
                      <p className="text-slate-700 text-sm italic mb-2 line-clamp-3">
                        <span className="not-italic text-amber-500 mr-1">▌</span>"{h.text}"
                      </p>

                      {/* Edit note form */}

                      <>
                        {/* Note display */}
                        {h.note && (
                          <div className="flex items-start gap-1.5 bg-white rounded-lg px-2 py-1.5 border border-amber-100 mb-2">
                            <StickyNote size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-slate-600 text-xs leading-snug">{h.note}</p>
                          </div>
                        )}
                        {/* Footer */}
                        <div className="flex items-center justify-between mt-1" onClick={e => e.stopPropagation()}>
                          <span className="text-amber-500 text-xs">{new Date(h.createdAt).toLocaleDateString()}</span>
                          <div className="flex gap-0.5">
                            <button
                              onClick={() => handleDeleteHighlight(h._id)}
                              title="Remove highlight"
                              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Note / Highlight modal ───────────────────────────────────────── */}
      {noteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setNoteModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Highlighter size={18} className="text-amber-500" />
              <h3 className="text-slate-800">Add Highlight</h3>
            </div>

            {/* Selected text preview */}
            <div className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-200">
              <p className="text-slate-700 text-sm italic leading-relaxed">
                "{noteModal.text.slice(0, 140)}{noteModal.text.length > 140 ? '…' : ''}"
              </p>
            </div>

            {/* Note textarea */}
            <div className="mb-5">
              <label className="block text-slate-600 text-sm mb-2">Note <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea
                value={noteModal.note}
                onChange={e => setNoteModal({ ...noteModal, note: e.target.value })}
                placeholder="Add your thoughts or questions..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm resize-none focus:outline-none focus:border-amber-400 transition-colors"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveHighlight}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Highlighter size={14} />
                Save Highlight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
