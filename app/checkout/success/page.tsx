"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/app/components/Container";

const PENDING_PASSWORD_KEY = "facemood_pending_password";
const PENDING_PHONE_KEY = "facemood_pending_phone";

type ConfirmState =
  | { status: "confirming" }
  | { status: "error"; message: string };

export default function CheckoutSuccessPage() {
  const [state, setState] = useState<ConfirmState>({ status: "confirming" });
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let cancelled = false;

    async function run() {
      await Promise.resolve();

      const params = new URLSearchParams(window.location.search);
      const paymentKey = params.get("paymentKey");
      const orderId = params.get("orderId");
      const amount = params.get("amount");
      const password = sessionStorage.getItem(PENDING_PASSWORD_KEY);
      const phone = sessionStorage.getItem(PENDING_PHONE_KEY);

      if (!paymentKey || !orderId || !amount || !password) {
        if (!cancelled) {
          setState({
            status: "error",
            message: "결제 정보를 확인할 수 없습니다. 다시 시도해주세요.",
          });
        }
        return;
      }

      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            password,
            phone,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "결제 승인에 실패했습니다.");
        }

        sessionStorage.removeItem(PENDING_PASSWORD_KEY);
        sessionStorage.removeItem(PENDING_PHONE_KEY);
        if (!cancelled) {
          window.location.href = `/report?id=${orderId}`;
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "결제 승인 중 오류가 발생했습니다.",
          });
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
        <p className="text-sm font-semibold text-black">{state.message}</p>
        <Link
          href="/checkout"
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          다시 시도하기
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <Container className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-500" />
        <p className="mt-5 text-sm font-semibold text-black">
          결제를 확인하고 있어요...
        </p>
      </Container>
    </main>
  );
}
