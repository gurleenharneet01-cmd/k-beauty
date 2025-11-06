'use client';
import Script from "next/script";

export default function Home() {
  return (
    <main style={{ textAlign: "center", padding: "50px" }}>
      <h1>K-Beauty Test Page</h1>
      <p>If ads load, a message will appear below 👇</p>

      <Script
        src="https://static.adtomatik.com/aclib.js"
        strategy="beforeInteractive"
        onLoad={() => console.log("✅ Adcash SDK loaded")}
        onError={(e) => console.error("❌ Adcash SDK failed:", e)}
      />

      <Script id="adcash-script" strategy="afterInteractive">
        {`
          if (typeof aclib !== 'undefined') {
            console.log("✅ aclib detected, running auto tag...");
            aclib.runAutoTag({ zoneId: '6nheekwkd6' });
          } else {
            console.error("❌ aclib not detected yet");
          }
        `}
      </Script>
    </main>
  );
}

