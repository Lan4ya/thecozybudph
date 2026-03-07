import { cn } from "@/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, Info, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type?: ToastType;
};

type ToastContextValue = {
  addToast: (msg: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      setToasts((prev) => {
        const sameMessageCount = prev.filter(
          (t) => t.message === message,
        ).length;
        if (sameMessageCount >= 3) return prev; // skip duplicates
        const id = crypto.randomUUID();
        const newToasts = [...prev, { id, message, type }];
        setTimeout(() => removeToast(id), 4000);
        return newToasts;
      });
    },
    [removeToast],
  );

  // Icons per type
  const toastIcons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-999 flex flex-col gap-3 items-end">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={cn(
                "flex items-start gap-3 max-w-xs lg:max-w-sm rounded-lg shadow-lg border-l-4 px-4 py-3 font-medium text-sm md:text-base",
                t.type === "success" &&
                  "bg-green-50 text-green-800 border-green-500",
                t.type === "error" && "bg-red-50 text-red-800 border-red-500",
                t.type === "info" && "bg-blue-50 text-blue-800 border-blue-500",
              )}
            >
              <div className="mt-[2px]">{toastIcons[t.type || "info"]}</div>
              <p className="flex-1">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
