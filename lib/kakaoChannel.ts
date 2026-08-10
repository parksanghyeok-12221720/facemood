// FACEMOOD's Kakao Channel — https://pf.kakao.com/_fxaxbfX. Adding it as a
// friend via the Kakao.Channel.addChannel() JS SDK popup knocks this much
// off the checkout price. No server-side proof the user actually finished
// the add-friend flow inside Kakao's popup (would need full Kakao OAuth
// login for that) — this is a soft, self-reported discount, same trust
// level as a coupon code.
export const KAKAO_CHANNEL_PUBLIC_ID = "_fxaxbfX";
export const KAKAO_CHANNEL_DISCOUNT_KRW = 5000;

// Shared across /detail, /checkout, and /match/checkout via localStorage
// (not sessionStorage — this needs to survive from an early page like
// /detail all the way to whichever checkout page the user eventually
// lands on) so adding the channel once, anywhere on the site, carries the
// discount forward instead of asking again at checkout.
export const KAKAO_DISCOUNT_APPLIED_KEY = "facemood_kakao_discount_applied";
