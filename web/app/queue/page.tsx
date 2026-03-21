"use client";

import { useEffect, useState, useCallback } from "react";
import TaskCard from "../components/TaskCard";
import Toast from "../components/Toast";
import type { ToastType } from "../components/Toast";

type StatusFilter = "all" | "processing" | "completed" | "failed";

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

const filterTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "processing", label: "処理中" },
  { value: "completed", label: "完了" },
  { value: "failed", label: "失敗" },
];

export default function QueuePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter !== "all") {
        params.set("status", filter);
      }
      const res = await fetch(`/api/tasks?${params}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.tasks ?? []);
    } catch {
      // サイレント
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchTasks();
    const timer = setInterval(fetchTasks, 5000);
    return () => clearInterval(timer);
  }, [fetchTasks]);

  const handleCancel = async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setToast({ message: "タスクをキャンセルしました", type: "info" });
      } else if (res.status === 401) {
        window.location.href = "/login";
      } else {
        setToast({ message: "キャンセルに失敗しました", type: "error" });
      }
    } catch {
      setToast({ message: "キャンセルに失敗しました", type: "error" });
    }
  };

  // pending タスクも filter=all の場合は表示
  const displayedTasks =
    filter === "all"
      ? tasks
      : tasks.filter((t) => t.status === filter);

  return (
    <main className="page-content px-4 pt-6 max-w-xl mx-auto">
      <h1 className="mb-4 text-xl font-bold">キュー状況</h1>

      {/* フィルタータブ */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-blue-600 text-white"
                : "bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:border-blue-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タスクリスト */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">
          読み込み中...
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-12 text-center text-sm text-gray-500">
          タスクがありません
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayedTasks.map((task) => (
            <TaskCard
              key={task.id}
              {...task}
              onCancel={task.status === "pending" ? handleCancel : undefined}
            />
          ))}
        </div>
      )}

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
