export const REPORT_PRICE_KRW = 34900;
export const REPORT_ORDER_NAME = "FACEMOOD 상세 리포트";

export type TossConfirmResult =
  | { ok: true; payment: Record<string, unknown> }
  | { ok: false; status: number; message: string };

// Server-only: confirms a payment with Toss using the secret key. Must be
// called within 10 minutes of the client-side requestPayment call.
export async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<TossConfirmResult> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, status: 500, message: "결제 설정이 누락되었습니다." };
  }

  const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;

  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? "결제 승인에 실패했습니다.",
    };
  }

  return { ok: true, payment: data };
}
