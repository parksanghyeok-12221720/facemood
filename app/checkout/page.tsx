"use client";

import Container from "@/app/components/Container";

const includedItems: { text: string; accent?: boolean }[] = [
  { text: "현재 이미지 무드 분석" },
  { text: "추구미 유형 정리" },
  { text: "헤어 추천" },
  { text: "메이크업 방향" },
  { text: "패션 실루엣" },
  { text: "피해야 할 스타일" },
  { text: "사진 포즈 추천" },
  { text: "사진상 컬러 무드 분석", accent: true },
  { text: "추천 컬러 팔레트", accent: true },
  { text: "헤어 컬러 방향", accent: true },
  { text: "메이크업 색조 추천", accent: true },
  { text: "패션 색감 추천", accent: true },
  { text: "피하면 좋은 컬러감", accent: true },
  { text: "베이스 메이크업 방향", accent: true },
  { text: "눈썹 스타일", accent: true },
  { text: "아이메이크업 강도", accent: true },
  { text: "블러셔 위치와 색감", accent: true },
  { text: "립 컬러 추천", accent: true },
  { text: "피하면 좋은 메이크업 방향", accent: true },
];

/**
 * Placeholder checkout handler. Swap the body of this function for the
 * real Toss Payments flow (open the payment widget, wait for approval),
 * then keep the `/report` redirect as the final step on success.
 */
async function startCheckout() {
  // TODO: integrate Toss Payments here.
  window.location.href = "/report";
}

export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-white py-16 text-black">
      <Container>
        <h1 className="text-xl font-bold text-black">상세 리포트</h1>

        <div className="mt-8 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm shadow-violet-100/60">
          <p className="text-xs tracking-[0.2em] text-violet-500">런칭가</p>
          <p className="mt-2 text-3xl font-bold text-black">9,900원</p>

          <div className="mt-8 border-t border-violet-100 pt-6">
            <p className="text-xs tracking-[0.2em] text-violet-500">
              포함 내용
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {includedItems.map((item) => (
                <li
                  key={item.text}
                  className={`flex items-center gap-3 text-sm ${
                    item.accent ? "text-violet-700" : "text-gray-600"
                  }`}
                >
                  <span
                    className={`h-1 w-1 shrink-0 rounded-full ${
                      item.accent ? "bg-violet-400" : "bg-gray-400"
                    }`}
                  />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <button
            onClick={startCheckout}
            className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white"
          >
            9,900원으로 상세 리포트 보기
          </button>
          <p className="mt-3 text-center text-xs text-gray-400">
            결제 기능은 추후 연결 예정입니다. 지금은 클릭 시 바로 리포트로
            이동합니다.
          </p>
        </div>
      </Container>
    </main>
  );
}
