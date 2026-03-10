import { createContext, useCallback, useContext, useState } from "react";
import Toast, { ToastItem } from "../hooks/useToast";


interface ToastContextValue {
  toast: (opts: Omit<ToastItem, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}


const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}


export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { ...opts, id }]);
  }, []);

  const success = useCallback(
    (title: string, description?: string) => toast({ variant: 'success', title, description }),
    [toast],
  );

  const error = useCallback(
    (title: string, description?: string) => toast({ variant: 'error', title, description }),
    [toast],
  );

  const warning = useCallback(
    (title: string, description?: string) => toast({ variant: 'warning', title, description }),
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}


function ToastContainer({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end"
    >
      {toasts.map(item => (
        <Toast key={item.id} item={item} onDismiss={dismiss} />
      ))}
    </div>
  );
}