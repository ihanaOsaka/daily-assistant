'use client';

import { useEffect, useState, useCallback } from 'react';
import TaskCard from '../components/TaskCard';

interface Task {
  id: number;
  status: string;
  command: string;
  category: string | null;
  priority: number | null;
  result: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

const filters = [
  { value: '', label: '全て' },
  { value: 'pending', label: '待機中' },
  { value: 'processing', label: '実行中' },
  { value: 'completed', label: '完了' },
  { value: 'failed', label: '失敗' },
];

export default function QueuePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const url = filter ? `/api/tasks?status=${filter}` : '/api/tasks';
      const res = await fetch(url);
      if (res.ok) {
        setTasks(await res.json());
      }
    } catch { /* ignore */ }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleCancel = async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTasks();
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">キュー</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-8">タスクがありません</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onCancel={handleCancel} />
          ))
        )}
      </div>
    </div>
  );
}
