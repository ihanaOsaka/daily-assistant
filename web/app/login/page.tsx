"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else if (res.status === 401) {
        setError("パスワードが正しくありません");
      } else {
        setError("ログインに失敗しました");
      }
    } catch {
      setError("サーバーに接続できません");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* ロゴ / タイトル */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🤖</div>
          <h1 className="text-2xl font-bold text-[#e5e5e5]">Daily Assistant</h1>
          <p className="mt-1 text-sm text-gray-500">パスワードでログイン</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-gray-400">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="パスワードを入力"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-[#e5e5e5] placeholder-gray-600 focus:border-blue-700 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 py-4 text-base font-semibold text-white transition-colors active:bg-blue-700 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}
