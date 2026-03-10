import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';


export type ToastVariant = 'success' | 'error' | 'warning';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    icon: React.ElementType;
    iconClass: string;
    borderClass: string;
    progressClass: string;
    titleClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    borderClass: 'border-l-emerald-500',
    progressClass: 'bg-emerald-500',
    titleClass: 'text-slate-800',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-red-500',
    borderClass: 'border-l-red-500',
    progressClass: 'bg-red-500',
    titleClass: 'text-slate-800',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    borderClass: 'border-l-amber-500',
    progressClass: 'bg-amber-500',
    titleClass: 'text-slate-800',
  },
};

// ─── Single Toast ─────────────────────────────────────────────────────────────

export default function Toast({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const duration = item.duration ?? 4000;
  const cfg = VARIANT_CONFIG[item.variant];
  const Icon = cfg.icon;

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);
  const paused = useRef(false);
  const elapsed = useRef(0);

  // Slide-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Countdown progress bar
  useEffect(() => {
    const tick = () => {
      if (!paused.current) {
        elapsed.current = Date.now() - startRef.current;
        const pct = Math.max(0, 100 - (elapsed.current / duration) * 100);
        setProgress(pct);
        if (pct <= 0) {
          handleClose();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss(item.id), 300);
  }, [item.id, onDismiss]);

  const handleMouseEnter = () => {
    paused.current = true;
  };

  const handleMouseLeave = () => {
    // Restart the clock from where we left off
    startRef.current = Date.now() - elapsed.current;
    paused.current = false;
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'opacity 300ms ease, transform 300ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
      }}
      className={`relative w-80 bg-white rounded-xl shadow-lg border border-slate-100 border-l-4 overflow-hidden ${cfg.borderClass}`}
    >
      
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <Icon size={20} className={`flex-shrink-0 mt-0.5 ${cfg.iconClass}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${cfg.titleClass}`}>
            {item.title}
          </p>
          {item.description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

     
      <div className="h-0.5 bg-slate-100">
        <div
          className={`h-full transition-none ${cfg.progressClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}




