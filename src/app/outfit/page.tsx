"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [color, setColor] = useState("");
  const [result, setResult] = useState("");

  const handleTest = () => {
    if (color === "pink") {
      setResult("💖 Soft & Cute — Try glossy lips and pastel accessories!");
    } else if (color === "black") {
      setResult("🖤 Chic & Bold — Red lipstick and silver jewelry look stunning!");
    } else if (color === "white") {
      setResult("🤍 Elegant & Fresh — Go for nude tones and gold accents!");
    } else if (color === "blue") {
      setResult("💙 Calm & Cool — Use peach blush and pearl accessories!");
    } else {
      setResult("✨ Choose any color to get your K-Beauty outfit match!");
    }
  };

  // Load Adcash script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://example.adcash.com/ads-zone.js"; // 🔁 replace with your real Adcash zone script URL
    script.async = true;
    document.getElementById("ad-zone")?.appendChild(script);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-4">💖 K-Beauty Outfit Color Planner 💖</h1>
      <p className="mb-4 text-center">Find the best makeup & accessories for your outfit!</p>

      <input
        type="text"
        placeholder="Enter your dress color..."
        value={color}
        onChange={(e) => setColor(e.target.value.toLowerCase())}
        className="border border-pink-300 rounded-xl p-2 text-center focus:outline-none focus:ring-2 focus:ring-pink-400"
      />

      <button
        onClick={handleTest}
        className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-full"
      >
        Show Suggestion
      </button>

      {result && (
        <p className="mt-6 text-lg bg-white rounded-xl shadow-md p-4">{result}</p>
      )}

      <div id="ad-zone" className="mt-8 text-center">
        <p>👇 Ads will load below 👇</p>
      </div>

      <footer className="mt-10 text-sm text-gray-500">
        © 2025 K-Beauty Finder. All rights reserved.
      </footer>
    </main>
  );
}
