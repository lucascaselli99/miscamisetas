"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";

type ToastType = "success" | "error";

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

interface ToastContextValue {
  showSuccess: (text: string) => void;
  showError: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, text: string) => {
      const id = ++idCounter;
      setToasts((current) => [...current, { id, type, text }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const value: ToastContextValue = {
    showSuccess: (text) => push("success", text),
    showError: (text) => push("error", text),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-4 safe-top">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-card-hover",
              toast.type === "success" ? "bg-ink-900" : "bg-favorite-500"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-400" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-white" />
            )}
            <span className="flex-1">{toast.text}</span>
            <button onClick={() => remove(toast.id)} aria-label="Cerrar">
              <X className="h-4 w-4 opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return context;
}
