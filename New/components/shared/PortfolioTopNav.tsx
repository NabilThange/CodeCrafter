"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const LINKS = [
  { href: "/portfolio/dashboard", label: "Dashboard" },
  { href: "/portfolio/build", label: "Portfolio" },
  { href: "/portfolio/transactions", label: "History" },
  { href: "/vane", label: "🔍 Vane" },
  { href: "/monitor", label: "🌍 Monitor" },
];

export default function PortfolioTopNav() {
  const pathname = usePathname();
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  useEffect(() => {
    const saved = document.cookie.split(";").find(c => c.trim().startsWith("displayCcy="));
    if (saved) setCurrency(saved.split("=")[1].trim() as "USD" | "INR");
  }, []);

  function toggleCurrency() {
    const next = currency === "USD" ? "INR" : "USD";
    setCurrency(next);
    document.cookie = `displayCcy=${next}; path=/; max-age=31536000`;
    window.dispatchEvent(new CustomEvent("ccyChange", { detail: next }));
  }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 60,
      background: "rgba(13,17,23,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 28px",
      gap: 32,
    }}>
      {/* Wordmark */}
      <Link href="/portfolio/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "linear-gradient(135deg, #f9c846, #f5a623)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(249,200,70,0.35)",
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0d0a00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: 18, color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>Kuberaa</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              textDecoration: "none", padding: "6px 14px", borderRadius: 8,
              fontSize: 14, fontWeight: active ? 600 : 400,
              color: active ? "var(--text-gold)" : "var(--text-secondary)",
              background: active ? "rgba(249,200,70,0.08)" : "transparent",
              transition: "all 0.15s ease",
            }}>{label}</Link>
          );
        })}
      </div>

      {/* Right: currency + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={toggleCurrency} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--bg-elevated)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "6px 14px", cursor: "pointer",
          fontSize: 13, fontWeight: 600,
          color: "var(--text-gold)", transition: "all 0.15s ease",
        }}>
          <span>{currency === "USD" ? "$ USD" : "₹ INR"}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
        </button>

        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #f9c846, #f5a623)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 13, color: "#0d0a00", cursor: "pointer",
          boxShadow: "0 2px 8px rgba(249,200,70,0.3)",
        }}>K</div>
      </div>
    </nav>
  );
}
