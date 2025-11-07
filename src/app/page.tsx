'use client';

import React from 'react';
import Script from 'next/script';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">💖 Welcome to K-Beauty Finder 💖</h1>
      <p className="mb-4">
        Find your perfect skin tone and discover products that suit you best.
      </p>

      <h2 className="text-xl font-semibold mb-2">🌿 Our Favorite K-Beauty Products</h2>
      <ul className="list-disc text-left mb-6">
        <li>K-Beauty</li>
        <li>Korean Skincare</li>
      </ul>

      <div className="border-t border-gray-300 w-full my-6"></div>
      <p className="text-pink-600 font-medium">Your Adcash zone will show ads below 👇</p>
      <div id="adcash-zone" className="my-4" />

      <footer className="text-sm text-gray-500 mt-8">
        © 2025 K-Beauty Finder. Powered by Adcash 💕
      </footer>

      {/* ✅ Adcash Script */}
      <Script
        id="aclib"
        src="//acscdn.com/script/aclib.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log("✅ Adcash script loaded successfully");
          if (typeof aclib !== "undefined") {
            console.log("✅ aclib detected, running auto tag...");
            aclib.runAutoTag({ zoneId: "6nheekwkd6" }); // your zone ID
          } else {
            console.error("❌ aclib not detected after load");
          }
        }}
        onError={(e) => console.error("❌ Failed to load Adcash script:", e)}
      />
    </main>
  );
}
