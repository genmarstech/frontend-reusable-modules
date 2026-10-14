"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import clsx from "clsx";

interface Toast {
  id: number;
  kind: "success" | "error";
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: Toast["kind"], message: string) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, kind, message }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={clsx(
              "flex items-start gap-2 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm max-w-sm",
              "bg-bg-raised text-text",
              toast.kind === "success" ? "border-success/30" : "border-danger/30",
            )}
          >
            {toast.kind === "success" ? (
              <CheckCircle2 className="size-5 shrink-0 text-success" />
            ) : (
              <XCircle className="size-5 shrink-0 text-danger" />
            )}
            <p className="text-sm leading-snug">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-auto text-text-muted hover:text-text"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
