import { cn } from "@/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, Info, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type AddToastFn = {
  (type: ToastType): void;
  (msg: string, type?: ToastType): void;
};

type ToastContextValue = {
  addToast: AddToastFn;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

const DEFAULT_ERROR_MSG = "Something went wrong. Please try again.";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (msgOrType: string, type?: ToastType) => {
      const isTypeOnly =
        !type && ["success", "error", "info"].includes(msgOrType);

      const finalType: ToastType = isTypeOnly
        ? (msgOrType as ToastType)
        : (type ?? "info");
      let message = isTypeOnly ? "" : msgOrType;

      if (finalType === "error" && !message) {
        message = DEFAULT_ERROR_MSG;
      }

      setToasts((prev) => {
        const sameMessageCount = prev.filter(
          (t) => t.message === message,
        ).length;
        if (sameMessageCount >= 3) return prev;

        const id = crypto.randomUUID();
        const newToasts = [...prev, { id, message, type: finalType }];
        setTimeout(() => removeToast(id), 7000);
        return newToasts;
      });
    },
    [removeToast],
  ) as AddToastFn;

  const toastIcons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      <div className="fixed bottom-22 right-6 z-999 flex flex-col gap-3 items-end">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: 50,
                height: 0,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0,
                borderTopWidth: 0,
                borderBottomWidth: 0,
              }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={() => removeToast(t.id)}
              className={cn(
                "flex items-center min-h-14 gap-3 max-w-xs lg:max-w-md rounded-lg shadow-lg border-l-4 px-4 py-3 font-medium text-sm md:text-base cursor-pointer select-none hover:opacity-90 overflow-hidden",
                t.type === "success" &&
                  "bg-green-50 text-green-800 border-green-500",
                t.type === "error" && "bg-red-50 text-red-800 border-red-500",
                t.type === "info" && "bg-blue-50 text-blue-800 border-blue-500",
              )}
            >
              <div className="mt-0.5 shrink-0">{toastIcons[t.type]}</div>
              <p className="flex-1">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
