"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const typeConfig: Record<ToastType, { className: string; icon: string }> = {
  success: {
    className: "bg-green-900 border-green-700 text-green-200",
    icon: "✓",
  },
  error: {
    className: "bg-red-900 border-red-700 text-red-200",
    icon: "✕",
  },
  info: {
    className: "bg-blue-900 border-blue-700 text-blue-200",
    icon: "ℹ",
  },
};

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 3000,
}: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = typeConfig[type];

  return (
    <div
      className={`fixed bottom-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${config.className} ${exiting ? "toast-exit" : "toast-enter"}`}
      style={{ minWidth: "200px", maxWidth: "calc(100vw - 32px)" }}
    >
      <span className="font-bold">{config.icon}</span>
      <span>{message}</span>
    </div>
  );
}
