"use client";

import React, { useState } from "react";
import StatusBadge from "./StatusBadge";

interface TaskCardProps {
  id: number;
  command: string;
  status: string;
  category?: string;
  priority?: string;
  result?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
  onCancel?: (id: number) => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
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

function renderMarkdown(text: string): React.ReactElement {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

const priorityLabel: Record<string, string> = {
  normal: "通常",
  high: "高",
  urgent: "緊急",
};

const priorityColor: Record<string, string> = {
  normal: "text-gray-400",
  high: "text-yellow-400",
  urgent: "text-red-400",
};

export default function TaskCard({
  id,
  command,
  status,
  category,
  priority = "normal",
  result,
  error,
  created_at,
  onCancel,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasDetail = result || error;

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
      {/* ヘッダー行 */}
      <div
        className={`flex items-start gap-3 p-3 ${hasDetail ? "cursor-pointer" : ""}`}
        onClick={() => hasDetail && setExpanded((v) => !v)}
      >
        {/* キャンセルボタン（pending のみ） */}
        {status === "pending" && onCancel && (
          <button
            className="mt-0.5 flex-shrink-0 rounded-full p-1 text-gray-500 hover:bg-red-900/40 hover:text-red-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(id);
            }}
            aria-label="キャンセル"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* メインコンテンツ */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#e5e5e5] truncate">{command}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            {category && (
              <span className="text-xs text-gray-500">{category}</span>
            )}
            {priority && priority !== "normal" && (
              <span
                className={`text-xs font-medium ${priorityColor[priority] ?? "text-gray-400"}`}
              >
                {priorityLabel[priority] ?? priority}
              </span>
            )}
            <span className="text-xs text-gray-600 ml-auto">
              {formatRelativeTime(created_at)}
            </span>
          </div>
        </div>

        {/* 展開アイコン */}
        {hasDetail && (
          <span
            className={`flex-shrink-0 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        )}
      </div>

      {/* 展開エリア */}
      {expanded && hasDetail && (
        <div className="border-t border-[#2a2a2a] p-3">
          {error ? (
            <div className="rounded bg-red-900/20 p-3 text-sm text-red-300">
              <p className="mb-1 font-medium">エラー:</p>
              <p className="whitespace-pre-wrap break-words">{error}</p>
            </div>
          ) : (
            result && (
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {renderMarkdown(result)}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
