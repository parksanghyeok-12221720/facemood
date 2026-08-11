"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Lets the admin hand out a free one-time redemption code for support
// cases — a customer forgot their report password, or a report errored
// out mid-generation/delivery — without needing a real payment or an
// existing bundle purchase. The code is redeemed through the same "코드가
// 있으신가요?" box already on /checkout and /match/checkout.
export default function FreeCodeIssuer() {
  const router = useRouter();
  const [product, setProduct] = useState<"facemood" | "match">("facemood");
  const [tier, setTier] = useState<"basic" | "premium">("premium");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleIssue() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    setIssuedCode(null);
    setCopied(false);

    try {
      const response = await fetch("/api/admin/free-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, tier, note }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "코드 발급에 실패했습니다.");
      }
      setIssuedCode(data.code);
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "코드 발급 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!issuedCode) return;
    try {
      await navigator.clipboard.writeText(issuedCode);
      setCopied(true);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the
      // code is still shown on screen, so this isn't fatal.
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-white">무료 코드 발급</p>
      <p className="mt-1 text-xs text-gray-500">
        비밀번호 분실, 리포트 생성 오류 등 문의 대응용 — 결제 없이 리포트를
        받을 수 있는 일회용 코드를 발급해요.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setProduct("facemood")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            product === "facemood"
              ? "bg-violet-500 text-white"
              : "bg-white/5 text-gray-400"
          }`}
        >
          FACEMOOD
        </button>
        <button
          type="button"
          onClick={() => setProduct("match")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            product === "match" ? "bg-violet-500 text-white" : "bg-white/5 text-gray-400"
          }`}
        >
          FACEMOOD Match
        </button>
      </div>

      {product === "facemood" && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTier("basic")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tier === "basic" ? "bg-white text-black" : "bg-white/5 text-gray-400"
            }`}
          >
            Basic
          </button>
          <button
            type="button"
            onClick={() => setTier("premium")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tier === "premium" ? "bg-white text-black" : "bg-white/5 text-gray-400"
            }`}
          >
            Premium
          </button>
        </div>
      )}

      <input
        type="text"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="메모 (예: 010-1234-5678 비번 분실)"
        disabled={isSubmitting}
        className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-400"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleIssue}
        disabled={isSubmitting}
        className="mt-3 w-full rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
      >
        {isSubmitting ? "발급 중..." : "코드 발급"}
      </button>

      {issuedCode && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3">
          <span className="font-mono text-sm font-semibold tracking-wider text-white">
            {issuedCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
          >
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      )}
    </div>
  );
}
