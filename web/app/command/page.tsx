"use client";

import { useState } from "react";
import Toast from "../components/Toast";
import type { ToastType } from "../components/Toast";

const categories = [
  { value: "一般", label: "一般" },
  { value: "予定", label: "予定" },
  { value: "タスク", label: "タスク" },
  { value: "メール", label: "メール" },
  { value: "調査", label: "調査" },
  { value: "開発", label: "開発" },
];

const priorities = [
  { value: "normal", label: "通常" },
  { value: "high", label: "高" },
  { value: "urgent", label: "緊急" },
];

const templates = [
  { label: "今日の予定を確認", command: "今日の予定を確認して", category: "予定" },
  { label: "未完了タスクを一覧", command: "未完了タスクを一覧して", category: "タスク" },
  { label: "夕方の振り返り", command: "/evening", category: "一般" },
];

interface ToastState {
  message: string;
  type: ToastType;
}

export default function CommandPage() {
  const [command, setCommand] = useState("");
  const [category, setCategory] = useState("一般");
  const [priority, setPriority] = useState("normal");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleSubmit = async () => {
    if (!command.trim()) {
      setToast({ message: "指示を入力してください", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: command.trim(),
          category,
          priority,
        }),
      });
      if (res.ok) {
        setCommand("");
        setCategory("一般");
        setPriority("normal");
        setToast({ message: "キューに追加しました", type: "success" });
      } else if (res.status === 401) {
        window.location.href = "/login";
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({
          message: data.detail ?? "送信に失敗しました",
          type: "error",
        });
      }
    } catch {
      setToast({ message: "送信に失敗しました", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTemplate = (tmpl: (typeof templates)[0]) => {
    setCommand(tmpl.command);
    setCategory(tmpl.category);
  };

  return (
    <main className="page-content px-4 pt-6 max-w-xl mx-auto">
      <h1 className="mb-6 text-xl font-bold">指示入力</h1>

      {/* テキストエリア */}
      <div className="mb-4">
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="指示を入力..."
          rows={5}
          className="w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-[#e5e5e5] placeholder-gray-600 focus:border-blue-700 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* カテゴリ・優先度 */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs text-gray-400">カテゴリ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#e5e5e5] focus:border-blue-700 focus:outline-none appearance-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-gray-400">優先度</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#e5e5e5] focus:border-blue-700 focus:outline-none appearance-none cursor-pointer"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !command.trim()}
        className="mb-6 w-full rounded-xl bg-blue-600 py-4 text-base font-semibold text-white transition-colors active:bg-blue-700 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "送信中..." : "送信"}
      </button>

      {/* テンプレート */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">
          テンプレート
        </h2>
        <div className="flex flex-col gap-2">
          {templates.map((tmpl) => (
            <button
              key={tmpl.label}
              onClick={() => handleTemplate(tmpl)}
              className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-left transition-colors active:bg-[#222] hover:border-blue-800"
            >
              <span className="text-[#e5e5e5]">{tmpl.label}</span>
              <span className="text-gray-500 text-xs">{tmpl.category}</span>
            </button>
          ))}
        </div>
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
