"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-rsk-green shrink-0" />,
    error: <XCircle className="h-4 w-4 text-rsk-red shrink-0" />,
    info: <Info className="h-4 w-4 text-rsk-orange shrink-0" />,
  };

  const borders = {
    success: "border-rsk-green/20",
    error: "border-rsk-red/20",
    info: "border-rsk-orange/20",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-rsk-card/95 backdrop-blur-lg border ${borders[t.type]} shadow-2xl shadow-black/40 animate-slide-up min-w-[280px] max-w-[400px]`}
          >
            {icons[t.type]}
            <p className="text-sm text-white flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-white/30 hover:text-white/60 transition-colors shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
