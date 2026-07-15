// Lets the team run the real Toss payment flow end-to-end without paying
// full price — entering this exact phone number at checkout charges 1원
// instead of the normal price. No server secrets here, so this is safe
// to import from client components too.
export const TEST_PHONE_NUMBER = "01058389701";
export const TEST_AMOUNT_KRW = 1;

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isTestPhone(phone: string): boolean {
  return normalizePhone(phone) === TEST_PHONE_NUMBER;
}
