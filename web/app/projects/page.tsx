"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "../components/Toast";
import type { ToastType } from "../components/Toast";

interface Project {
  id: number;
  title: string;
  category: string;
  status: string;
  next_action?: string;
  notes?: string;
  repo_path?: string;
  google_task_id?: string;
  sort_order?: number;
  updated_at: string;
  created_at: string;
}

interface ToastState {
  message: string;
  type: ToastType;
}

type ProjectStatus = "urgent" | "active" | "waiting" | "talking" | "paused" | "completed";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  urgent: { label: "🔥急務", className: "bg-red-900/60 text-red-300 border border-red-700/50" },
  active: { label: "🔧進行", className: "bg-blue-900/60 text-blue-300 border border-blue-700/50" },
  waiting: { label: "⏳待ち", className: "bg-orange-900/60 text-orange-300 border border-orange-700/50" },
  talking: { label: "💬調整", className: "bg-purple-900/60 text-purple-300 border border-purple-700/50" },
  paused: { label: "⏸停止", className: "bg-gray-700/60 text-gray-400 border border-gray-600/50" },
  completed: { label: "✅完了", className: "bg-green-900/60 text-green-300 border border-green-700/50" },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  marketing: { label: "マーケティング", icon: "📣" },
  production: { label: "生産マネジメント", icon: "🏭" },
  operation: { label: "医院運営", icon: "🏥" },
};

const STATUS_ORDER: ProjectStatus[] = ["urgent", "active", "waiting", "talking", "paused", "completed"];

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as ProjectStatus] ?? {
    label: status,
    className: "bg-gray-700 text-gray-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function ProjectCard({
  project,
  onStatusChange,
}: {
  project: Project;
  onStatusChange: (id: number, status: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [changing, setChanging] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === project.status) return;
    setChanging(true);
    try {
      await onStatusChange(project.id, newStatus);
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="project-card rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
      {/* カードヘッダー */}
      <div
        className="flex items-start gap-3 p-3 cursor-pointer active:bg-[#222] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm font-medium text-[#e5e5e5] leading-snug">{project.title}</p>
          {project.next_action && (
            <p className="mt-1 text-xs text-gray-400 line-clamp-1">
              <span className="text-gray-600">次: </span>
              {project.next_action}
            </p>
          )}
        </div>
        <span
          className={`flex-shrink-0 text-gray-500 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`}
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
      </div>

      {/* 展開エリア */}
      {expanded && (
        <div className="border-t border-[#2a2a2a] p-3 space-y-3">
          {/* 詳細情報 */}
          {project.next_action && (
            <div>
              <p className="text-xs text-gray-500 mb-1">次のアクション</p>
              <p className="text-sm text-gray-300">{project.next_action}</p>
            </div>
          )}
          {project.notes && (
            <div>
              <p className="text-xs text-gray-500 mb-1">メモ</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{project.notes}</p>
            </div>
          )}
          {project.repo_path && (
            <div>
              <p className="text-xs text-gray-500 mb-1">リポジトリ</p>
              <code className="text-xs text-blue-400 bg-blue-950/30 px-2 py-1 rounded font-mono">
                {project.repo_path}
              </code>
            </div>
          )}

          {/* ステータス変更ボタン群 */}
          <div>
            <p className="text-xs text-gray-500 mb-2">ステータス変更</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const isActive = project.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={changing || isActive}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? `${cfg.className} opacity-100 ring-2 ring-offset-1 ring-offset-[#1a1a1a] ring-current`
                        : "bg-[#2a2a2a] text-gray-400 border border-[#333] hover:border-gray-500 disabled:opacity-50"
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setProjectList(Array.isArray(data) ? data : []);
    } catch {
      // サイレント
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        setToast({ message: "更新に失敗しました", type: "error" });
        return;
      }
      const updated = await res.json();
      setProjectList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      setToast({ message: "ステータスを更新しました", type: "success" });
    } catch {
      setToast({ message: "更新に失敗しました", type: "error" });
    }
  };

  // カテゴリフィルタリング
  const categories = Object.keys(CATEGORY_CONFIG);

  // カテゴリ別グループ（常にall分を保持）
  const grouped: Record<string, Project[]> = {};
  for (const cat of categories) {
    grouped[cat] = projectList.filter((p) => p.category === cat);
  }

  const displayCategories = activeCategory === "all" ? categories : [activeCategory];

  const totalCount = projectList.length;
  const urgentCount = projectList.filter((p) => p.status === "urgent").length;

  return (
    <main className="page-content px-4 pt-6 max-w-xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">プロジェクト</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {totalCount}件
            {urgentCount > 0 && (
              <span className="ml-2 text-red-400">🔥 急務 {urgentCount}件</span>
            )}
          </p>
        </div>
      </div>

      {/* カテゴリフィルタータブ */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:border-blue-800"
          }`}
        >
          すべて
        </button>
        {categories.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:border-blue-800"
              }`}
            >
              {cfg.icon} {cfg.label}
            </button>
          );
        })}
      </div>

      {/* プロジェクト一覧 */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">読み込み中...</div>
      ) : totalCount === 0 ? (
        <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-12 text-center text-sm text-gray-500">
          プロジェクトがありません
        </div>
      ) : (
        <div className="space-y-6">
          {displayCategories.map((cat) => {
            const items = grouped[cat] ?? [];
            if (items.length === 0) return null;
            const cfg = CATEGORY_CONFIG[cat] ?? { label: cat, icon: "📁" };
            return (
              <section key={cat}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                  <span className="ml-auto text-xs font-normal text-gray-600 normal-case">
                    {items.length}件
                  </span>
                </h2>
                <div className="flex flex-col gap-2">
                  {items.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </section>
            );
          })}
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
