// Sends a "your report is ready" SMS. No SMS provider is wired up yet —
// set SMS_API_KEY (and whatever else the chosen provider needs, e.g.
// Solapi/Aligo/NHN Cloud) and fill in the fetch call below. Until then
// this just logs so the checkout/report flow never breaks on it.
export async function sendReportReadySms(
  phone: string,
  reportUrl: string,
): Promise<void> {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) {
    console.warn(
      `[notify] SMS_API_KEY가 설정되지 않아 SMS를 보내지 않았습니다. (to: ${phone}, url: ${reportUrl})`,
    );
    return;
  }

  // TODO: 실제 SMS 발송 API 연동. 예:
  // await fetch("https://api.solapi.com/messages/v4/send", {
  //   method: "POST",
  //   headers: { Authorization: `...`, "Content-Type": "application/json" },
  //   body: JSON.stringify({ to: phone, text: `FACEMOOD 상세 리포트가 준비됐어요: ${reportUrl}` }),
  // });
}
