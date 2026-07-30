import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Google tag (gtag.js) — renders nothing if the measurement ID isn't
// configured. Loaded with next/script instead of a raw <script> in <head>
// (Next.js manages placement/ordering either way).
export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
