"use client";

import { useState } from "react";
import Container from "@/app/components/Container";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting || !username || !password) return;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 py-16">
      <Container maxWidth="max-w-xs">
        <p className="text-center text-sm font-semibold tracking-[0.3em] text-gray-500">
          FACEMOOD ADMIN
        </p>
        <h1 className="mt-4 text-center text-lg font-semibold text-white">
          관리자 로그인
        </h1>

        <form
          className="mt-8 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="아이디"
            autoComplete="username"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-400"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-400"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !username || !password}
            className="mt-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-40"
          >
            {isSubmitting ? "확인 중..." : "로그인"}
          </button>
        </form>
      </Container>
    </main>
  );
}
