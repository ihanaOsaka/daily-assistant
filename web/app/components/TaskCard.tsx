'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';

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

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}秒前`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}日前`;
}

function renderResult(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

export default function TaskCard({
  task,
  onCancel,
}: {
  task: Task;
  onCancel?: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasContent = task.result || task.error;

  return (
    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => hasContent && setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-200 truncate">{task.command}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <StatusBadge status={task.status} />
            <span className="text-xs text-zinc-500">{relativeTime(task.created_at)}</span>
            {task.category && task.category !== 'general' && (
              <span className="text-xs text-zinc-500">#{task.category}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          {task.status === 'pending' && onCancel && (
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(task.id); }}
              className="text-zinc-500 hover:text-red-400 p-1"
              title="キャンセル"
            >
              ✕
            </button>
          )}
          {hasContent && (
            <span className="text-zinc-500 text-xs">{expanded ? '▲' : '▼'}</span>
          )}
        </div>
      </div>
      {expanded && hasContent && (
        <div className="mt-3 pt-3 border-t border-zinc-700">
          {task.result && (
            <div
              className="text-sm text-zinc-300 whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: renderResult(task.result) }}
            />
          )}
          {task.error && (
            <div className="text-sm text-red-400 whitespace-pre-wrap break-words">
              {task.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
