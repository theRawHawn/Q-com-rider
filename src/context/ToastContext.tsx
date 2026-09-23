import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Sleek Floating Top Dynamic Toast Notification - Never Blocks Navigation or Action Buttons */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1.5 w-full max-w-xs px-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-2 border transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-neutral-900/95 text-emerald-300 border-emerald-500/30 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-neutral-900/95 text-rose-300 border-rose-500/30 shadow-rose-950/20'
                : toast.type === 'warning'
                ? 'bg-neutral-900/95 text-amber-300 border-amber-500/30 shadow-amber-950/20'
                : 'bg-neutral-900/95 text-sky-200 border-sky-500/30 shadow-black/20'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
            <span className="truncate max-w-[240px]">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

