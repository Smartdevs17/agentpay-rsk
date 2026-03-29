"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
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

  if (toasts.length === 0) return null;

  return (
    <div
      style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99999, pointerEvents: "none" }}
      className="flex flex-col gap-3"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{ pointerEvents: "auto" }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl shadow-black/40 animate-slide-up min-w-[280px] max-w-[400px] ${borders[t.type]}`}
          // Inline bg so it doesn't depend on Tailwind class for rsk-card
          // which may not resolve in all contexts
          role="alert"
        >
          <div className="absolute inset-0 rounded-xl bg-[#161616] opacity-95 -z-10" />
          {icons[t.type]}
          <p className="text-sm text-white flex-1">{t.message}</p>
          <button onClick={() => onDismiss(t.id)} className="text-white/30 hover:text-white/60 transition-colors shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Find or create portal container directly on body
    let el = document.getElementById("toast-portal");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-portal";
      document.body.appendChild(el);
    }
    portalRef.current = el;
    setMounted(true);
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted && portalRef.current && createPortal(
        <ToastContainer toasts={toasts} onDismiss={dismiss} />,
        portalRef.current
      )}
    </ToastContext.Provider>
  );
}
