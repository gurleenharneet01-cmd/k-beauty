
'use client';

import Script from "next/script";

export default function Home() {
  return (
    <main style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to My Website</h1>
      <p>Your Adcash ad zone is active below 👇</p>

      {/* ✅ Adcash script */}
      <Script id="adcash-script" strategy="afterInteractive">
        {`
          aclib.runAutoTag({
            zoneId: '6nheekwkd6',
          });
        `}
      </Script>
    </main>
  );
}
