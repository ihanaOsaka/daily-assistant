"use client";

import { useEffect, useState, useCallback } from "react";
import TaskCard from "./components/TaskCard";
import Toast from "./components/Toast";
import type { ToastType } from "./components/Toast";

interface ServerStatus {
  ok: boolean;
  last_polled_at?: string;
  message?: string;
}

interface Task {
  id: number;
  command: string;
  status: string;
  category?: string;
  priority?: string;
  result?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

interface ToastState {
  message: string;
  type: ToastType;
}

const quickActions = [
  {
    label: "朝のルーティン",
    command: "/morning",
    icon: "🌅",
    category: "一般",
  },
  {
    label: "今日の予定",
    command: "今日の予定を確認して",
    icon: "📅",
    category: "予定",
  },
  {
    label: "タスク一覧",
    command: "未完了タスクを一覧して",
    icon: "✅",
    category: "タスク",
  },
  {
    label: "メール確認",
    command: "重要な未読メールを確認して",
    icon: "📧",
    category: "メール",
  },
];

function getStatusColor(
  status: ServerStatus | null,
  error: boolean
): { dot: string; label: string; text: string } {
  if (error) {
    return {
      dot: "bg-red-500",
      label: "サーバーエラー",
      text: "text-red-400",
    };
  }
  if (!status) {
    return { dot: "bg-gray-500", label: "確認中...", text: "text-gray-400" };
  }
  if (!status.ok) {
    return {
      dot: "bg-red-500",
      label: "サーバーエラー",
      text: "text-red-400",
    };
  }
  if (status.last_polled_at) {
    const diff =
      (Date.now() - new Date(status.last_polled_at).getTime()) / 1000;
    if (diff <= 60) {
      return { dot: "bg-green-500", label: "正常稼働中", text: "text-green-400" };
    }
    return {
      dot: "bg-yellow-500",
      label: "ポーラー停止中",
      text: "text-yellow-400",
    };
  }
  return {
    dot: "bg-yellow-500",
    label: "接続待機中",
    text: "text-yellow-400",
  };
}

export default function DashboardPage() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      if (!res.ok) {
        setStatusError(true);
        return;
      }
      const data = await res.json();
      setServerStatus(data);
      setStatusError(false);
    } catch {
      setStatusError(true);
    }
  }, []);

  const fetchRecentTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks?status=completed&limit=3");
      if (!res.ok) return;
      const data = await res.json();
      setRecentTasks(Array.isArray(data) ? data : data.tasks ?? []);
    } catch {
      // サイレント
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchRecentTasks();
    const timer = setInterval(() => {
      fetchStatus();
      fetchRecentTasks();
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchStatus, fetchRecentTasks]);

  const handleQuickAction = async (action: (typeof quickActions)[0]) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: action.command,
          category: action.category,
          priority: "normal",
        }),
      });
      if (res.ok) {
        setToast({ message: `「${action.label}」をキューに追加しました`, type: "success" });
      } else if (res.status === 401) {
        window.location.href = "/login";
      } else {
        setToast({ message: "送信に失敗しました", type: "error" });
      }
    } catch {
      setToast({ message: "送信に失敗しました", type: "error" });
    }
  };

  const statusInfo = getStatusColor(serverStatus, statusError);

  return (
    <main className="page-content px-4 pt-6 max-w-xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Daily Assistant</h1>
        {/* 接続状態インジケーター */}
        <div className="flex items-center gap-2">
          <span className={`relative flex h-2.5 w-2.5`}>
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${statusInfo.dot}`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusInfo.dot}`}
            />
          </span>
          <span className={`text-xs ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* クイックアクション */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">
          クイックアクション
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action)}
              className="flex flex-col items-start gap-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 text-left transition-colors active:bg-[#222] hover:border-blue-800 hover:bg-[#1e1e2e]"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium text-[#e5e5e5]">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 直近の完了タスク */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">
          直近の完了タスク
        </h2>
        {recentTasks.length === 0 ? (
          <p className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4 text-sm text-gray-500 text-center">
            完了タスクがありません
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </div>
        )}
      </section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
