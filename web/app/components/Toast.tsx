'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const typeColors = {
  success: 'bg-green-800 border-green-600',
  error: 'bg-red-800 border-red-600',
  info: 'bg-blue-800 border-blue-600',
};

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed bottom-20 left-4 right-4 z-50 ${exiting ? 'animate-toast-exit' : 'animate-toast-enter'}`}>
      <div className={`p-3 rounded-lg border text-sm text-center ${typeColors[type]}`}>
        {message}
      </div>
    </div>
  );
}
