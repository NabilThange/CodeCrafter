"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-base)", flexDirection: "column", gap: 0, padding: 32,
    }}>
      {/* Animated icon */}
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, marginBottom: 28,
        animation: "pulse-gold 2s infinite",
      }}>⚠</div>

      <h1 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 28, fontWeight: 800, marginBottom: 10,
        color: "var(--text-primary)",
      }}>Something went wrong</h1>

      <p style={{
        color: "var(--text-secondary)", fontSize: 15, textAlign: "center",
        lineHeight: 1.7, maxWidth: 480, marginBottom: 8,
      }}>
        An unexpected error occurred. Your portfolio data is safe — this is a display issue only.
      </p>

      {error.message && (
        <div style={{
          margin: "16px 0 28px",
          padding: "10px 18px",
          background: "rgba(239,68,68,0.07)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 10, fontSize: 13,
          color: "var(--red)", fontFamily: "monospace",
          maxWidth: 520, wordBreak: "break-all",
        }}>
          {error.message}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <button className="btn-primary" onClick={reset}>
          ↺ Try again
        </button>
        <Link href="/dashboard" className="btn-ghost">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
