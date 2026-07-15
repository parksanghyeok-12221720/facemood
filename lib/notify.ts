// Sends a "your report is ready" SMS via Aligo (알리고).
// Requires ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER in .env.local.
//
// Aligo restricts the API key to pre-registered caller IPs — if this
// starts failing with result_code -101 ("인증오류입니다.-IP"), the
// server's public IP needs to be added in the Aligo dashboard.
export async function sendReportReadySms(
  phone: string,
  reportUrl: string,
): Promise<void> {
  const apiKey = process.env.ALIGO_API_KEY;
  const userId = process.env.ALIGO_USER_ID;
  const sender = process.env.ALIGO_SENDER;

  if (!apiKey || !userId || !sender) {
    console.warn(
      `[notify] ALIGO_API_KEY/ALIGO_USER_ID/ALIGO_SENDER가 설정되지 않아 SMS를 보내지 않았습니다. (to: ${phone}, url: ${reportUrl})`,
    );
    return;
  }

  const receiver = phone.replace(/\D/g, "");
  if (!receiver) {
    console.warn(`[notify] 연락처 형식이 올바르지 않아 SMS를 보내지 않았습니다. (raw: ${phone})`);
    return;
  }

  const body = new URLSearchParams({
    key: apiKey,
    user_id: userId,
    sender: sender.replace(/\D/g, ""),
    receiver,
    msg: `[FACEMOOD] 상세 리포트가 완성됐어요!\n지금 확인해보세요: ${reportUrl}`,
    title: "FACEMOOD 리포트 완성",
  });

  try {
    const response = await fetch("https://apis.aligo.in/send/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await response.json();

    if (String(data.result_code) !== "1") {
      console.error("[notify] 알리고 SMS 발송 실패", data);
    }
  } catch (error) {
    console.error("[notify] 알리고 SMS 발송 중 오류", error);
  }
}
