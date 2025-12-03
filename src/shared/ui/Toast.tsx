"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react";
import { Toast as ToastType } from "@/src/shared/lib/toast";
import { toastService } from "@/src/shared/lib/toast";

interface ToastItemProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (toast.duration && toast.duration > 0 && toast.type !== "loading") {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, toast.type, onRemove]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onRemove(toast.id);
      toast.onClose?.();
    }, 300);
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className={`${iconClass} text-green-500`} />;
      case "error":
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case "info":
        return <Info className={`${iconClass} text-teal-500`} />;
      case "loading":
        return <Loader2 className={`${iconClass} text-teal-500 animate-spin`} />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-500/10 border-green-500/20";
      case "error":
        return "bg-red-500/10 border-red-500/20";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "info":
        return "bg-teal-500/10 border-teal-500/20";
      case "loading":
        return "bg-teal-500/10 border-teal-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  if (!isVisible) return null;

  const handleClick = (e: React.MouseEvent) => {
    // Если клик был на кнопку закрытия, не обрабатываем
    if ((e.target as HTMLElement).closest('button[aria-label="Закрыть"]')) {
      return;
    }
    
    // Если есть action, выполняем его при клике на уведомление
    if (toast.action) {
      toast.action.onClick();
      handleClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={toast.action ? handleClick : undefined}
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md
        min-w-[320px] max-w-[420px] shadow-lg
        ${getBgColor()}
        ${toast.action ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground mb-1">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-foreground-secondary leading-relaxed">{toast.message}</p>
        )}
        {toast.action && (
          <div className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            {toast.action.label} →
          </div>
        )}
      </div>

      {/* Close Button */}
      {toast.type !== "loading" && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-white/5 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4 text-foreground-secondary" />
        </button>
      )}
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe((options) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: ToastType = {
        id,
        type: options.type || "info",
        title: options.title,
        message: options.message,
        duration: options.duration ?? 5000,
        action: options.action,
        onClose: options.onClose,
      };

      setToasts((prev) => [...prev, toast]);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
}

