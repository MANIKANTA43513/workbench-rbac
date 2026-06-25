"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastStore, type Toast } from "@/store";
import { cn } from "@/lib/utils";

const VARIANTS: Record<Toast["type"], { icon: React.ReactNode; border: string; bg: string }> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />,
    border: "border-emerald-200",
    bg:     "bg-emerald-50/80",
  },
  error: {
    icon: <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />,
    border: "border-red-200",
    bg:     "bg-red-50/80",
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />,
    border: "border-blue-200",
    bg:     "bg-blue-50/80",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const v = VARIANTS[toast.type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 rounded-xl border backdrop-blur-sm bg-background/90 p-4 shadow-lg shadow-black/5 animate-fade-in",
        v.border
      )}
      role="alert"
    >
      {v.icon}
      <p className="flex-1 text-sm leading-snug text-foreground">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
