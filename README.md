'use client';
import Script from "next/script";

export default function Home() {
  return (
    <main style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to My Website</h1>
      <p>Your Adcash ad zone is active below 👇</p>

      {/* Load the Adcash SDK first */}
      <Script
        src="https://static.adtomatik.com/aclib.js"
        strategy="beforeInteractive"
      />

      {/* Run your Adcash tag */}
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


