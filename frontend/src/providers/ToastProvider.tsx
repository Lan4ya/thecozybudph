import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useContext, useState, useCallback } from "react";

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
      // Prevent more than 3 of the same message
      setToasts((prev) => {
        const sameMessageCount = prev.filter(
          (t) => t.message === message,
        ).length;
        if (sameMessageCount >= 3) return prev; // skip adding
        const id = crypto.randomUUID();
        const newToasts = [...prev, { id, message, type }];
        setTimeout(() => removeToast(id), 3000);
        return newToasts;
      });
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className={`
                rounded-lg px-4 py-3 shadow-lg text-white font-medium
                ${t.type === "success" ? "bg-green-600" : ""}
                ${t.type === "error" ? "bg-red-600" : ""}
                ${t.type === "info" ? "bg-blue-600" : ""}
              `}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
