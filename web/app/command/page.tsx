'use client';

import { useState } from 'react';
import Toast from '../components/Toast';

const categories = [
  { value: 'general', label: '一般' },
  { value: 'calendar', label: '予定' },
  { value: 'tasks', label: 'タスク' },
  { value: 'mail', label: 'メール' },
  { value: 'research', label: '調査' },
  { value: 'dev', label: '開発' },
];

const templates = [
  { label: '📅 今日の予定を確認', command: '今日の予定を確認して', category: 'calendar' },
  { label: '✅ 未完了タスクを一覧', command: '未完了タスクを一覧して', category: 'tasks' },
  { label: '🌙 夕方の振り返り', command: '/evening を実行して', category: 'general' },
];

export default function CommandPage() {
  const [command, setCommand] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState(0);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const submit = async () => {
    if (!command.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command.trim(), category, priority }),
      });
      if (res.ok) {
        setToast({ message: '指示を送信しました', type: 'success' });
        setCommand('');
      } else {
        setToast({ message: '送信に失敗しました', type: 'error' });
      }
    } catch {
      setToast({ message: 'ネットワークエラー', type: 'error' });
    }
    setSending(false);
  };

  const useTemplate = (t: typeof templates[0]) => {
    setCommand(t.command);
    setCategory(t.category);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">指示を送信</h1>

      <textarea
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="指示を入力..."
        rows={4}
        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:border-blue-500"
      />

      <div className="flex gap-3 mt-3">
        <div className="flex-1">
          <label className="text-xs text-zinc-500 mb-1 block">カテゴリ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-zinc-500 mb-1 block">優先度</label>
          <select
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value))}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200"
          >
            <option value={0}>通常</option>
            <option value={1}>高</option>
            <option value={2}>緊急</option>
          </select>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!command.trim() || sending}
        className="w-full mt-4 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-sm font-medium transition-colors"
      >
        {sending ? '送信中...' : '送信'}
      </button>

      <h2 className="text-sm font-medium text-zinc-400 mt-6 mb-3">テンプレート</h2>
      <div className="space-y-2">
        {templates.map((t) => (
          <button
            key={t.label}
            onClick={() => useTemplate(t)}
            className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-left transition-colors border border-zinc-700"
          >
            {t.label}
          </button>
        ))}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
