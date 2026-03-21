'use client';

import { useEffect, useState, useCallback } from 'react';
import TaskCard from './components/TaskCard';
import Toast from './components/Toast';

interface StatusData {
  ok: boolean;
  pending_count: number;
  processing_count: number;
}

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

const quickActions = [
  { label: '☀️ 朝のルーティン', command: '/morning を実行して', category: 'general' },
  { label: '📅 今日の予定', command: '今日の予定を確認して', category: 'calendar' },
  { label: '✅ タスク一覧', command: '未完了タスクを一覧して', category: 'tasks' },
  { label: '📧 メール確認', command: '重要な未読メールを確認して', category: 'mail' },
];

export default function Dashboard() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        setStatus(await res.json());
        setStatusError(false);
      } else {
        setStatusError(true);
      }
    } catch {
      setStatusError(true);
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks?status=completed&limit=3');
      if (res.ok) {
        setRecentTasks(await res.json());
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchRecent();
    const interval = setInterval(() => {
      fetchStatus();
      fetchRecent();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchRecent]);

  const sendQuickAction = async (command: string, category: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, category }),
      });
      if (res.ok) {
        setToast({ message: '指示を送信しました', type: 'success' });
        fetchRecent();
      } else {
        setToast({ message: '送信に失敗しました', type: 'error' });
      }
    } catch {
      setToast({ message: 'ネットワークエラー', type: 'error' });
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Daily Assistant</h1>

      {/* 接続状態 */}
      <div className="flex items-center gap-2 mb-6 p-3 bg-zinc-800 rounded-lg">
        <span className={`w-3 h-3 rounded-full ${
          statusError ? 'bg-red-500' : status?.ok ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
        <span className="text-sm text-zinc-300">
          {statusError ? 'サーバーに接続できません' :
           status?.ok ? `接続中 — 待機: ${status.pending_count} / 実行中: ${status.processing_count}` :
           '確認中...'}
        </span>
      </div>

      {/* クイックアクション */}
      <h2 className="text-sm font-medium text-zinc-400 mb-3">クイックアクション</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => sendQuickAction(action.command, action.category)}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-left transition-colors border border-zinc-700"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* 直近の結果 */}
      <h2 className="text-sm font-medium text-zinc-400 mb-3">最近の結果</h2>
      <div className="space-y-3">
        {recentTasks.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-4">まだ結果がありません</p>
        ) : (
          recentTasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
