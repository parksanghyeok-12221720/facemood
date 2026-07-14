"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import Container from "@/app/components/Container";

function subscribeToNothing() {
  return () => {};
}

function getFailMessageSnapshot() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const text = params.get("message");
  if (!text) return "결제가 취소되었거나 실패했습니다.";
  return `${text}${code ? ` (${code})` : ""}`;
}

function getServerFailMessageSnapshot() {
  return "결제가 취소되었거나 실패했습니다.";
}

export default function CheckoutFailPage() {
  const message = useSyncExternalStore(
    subscribeToNothing,
    getFailMessageSnapshot,
    getServerFailMessageSnapshot,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <Container className="flex flex-col items-center">
        <p className="text-sm font-semibold text-black">결제에 실패했어요</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          {message}
        </p>
        <Link
          href="/checkout"
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          다시 시도하기
        </Link>
      </Container>
    </main>
  );
}
