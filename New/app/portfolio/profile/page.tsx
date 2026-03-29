"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  id: string;
  fullName: string;
  location: string;
  age: number;
  experienceLevel: string;
  goal: string;
  goalDescription?: string;
  timeHorizon: string;
  capitalUSD: number;
  riskScore: number;
  riskProfile: string;
  esgOnly: boolean;
  excludedSectors: string[];
  excludedAssets: string[];
  rebalanceThreshold: number;
  currencyPreference: string;
  createdAt: string;
}

function RiskBadge({ profile }: { profile: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    CONSERVATIVE: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
    BALANCED:     { bg: "rgba(249,200,70,0.12)", color: "#f9c846" },
    AGGRESSIVE:   { bg: "rgba(34,197,94,0.12)",  color: "#22c55e" },
  };
  const c = colors[profile] ?? colors.BALANCED;
  return (
    <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
      background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
      {profile.charAt(0) + profile.slice(1).toLowerCase()}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

const horizonLabels: Record<string, string> = {
  LT2: "Less than 2 years", "2TO5": "2 – 5 years", "5TO10": "5 – 10 years", GT10: "More than 10 years",
};
const goalLabels: Record<string, string> = {
  GROW: "Grow wealth over time", INCOME: "Generate regular income",
  SPECIFIC: "Save for a specific goal", PRESERVE: "Preserve capital",
};
const expLabels: Record<string, string> = {
  BEGINNER: "Complete beginner", SOME: "Some experience", ACTIVE: "Actively investing",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [threshold, setThreshold] = useState(5);
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch("/api/kuberaa/profile")
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); }
        else {
          setProfile(d);
          setThreshold(Math.round((d.rebalanceThreshold ?? 0.05) * 100));
          setCurrency(d.currencyPreference ?? "USD");
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load profile"); setLoading(false); });
  }, []);

  async function savePreferences() {
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch("/api/kuberaa/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rebalanceThreshold: threshold / 100, currencyPreference: currency }),
      });
      if (!res.ok) throw new Error("Failed");
      setSaveMsg("Preferences saved ✓");
    } catch { setSaveMsg("Save failed"); }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 32 }}>
          <div className="skeleton" style={{ height: 36, width: 240, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 20, width: 360 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ marginBottom: 8 }}>No Profile Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{error || "Complete onboarding to create your investor profile."}</p>
        <Link href="/kuberaa/onboarding" className="btn-primary">Start Onboarding →</Link>
      </div>
    );
  }

  const scoreColor = profile.riskScore <= 35 ? "#3b82f6" : profile.riskScore <= 65 ? "#f9c846" : "#22c55e";

  return (
    <div className="fade-in" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>
            Investor Profile
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Your financial blueprint — created {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <Link href="/kuberaa/onboarding" className="btn-ghost">Edit Profile ✏️</Link>
      </div>

      {/* Risk Score Hero */}
      <div className="card" style={{ marginBottom: 24, background: `linear-gradient(135deg, ${scoreColor}10, var(--bg-card))`, borderColor: `${scoreColor}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: `conic-gradient(${scoreColor} ${profile.riskScore * 3.6}deg, var(--bg-elevated) 0deg)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 24px ${scoreColor}30`,
            }}>
              <div style={{ width: 76, height: 76, borderRadius: "50%", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: scoreColor, lineHeight: 1 }}>{profile.riskScore}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>/ 100</div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Risk Score</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h2 style={{ fontSize: 28, color: scoreColor }}>{profile.riskProfile.charAt(0) + profile.riskProfile.slice(1).toLowerCase()} Investor</h2>
              <RiskBadge profile={profile.riskProfile} />
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 14 }}>
              {profile.riskProfile === "CONSERVATIVE" && "Your portfolio will prioritize capital preservation with a bond-heavy allocation. Steady, safe, and predictable."}
              {profile.riskProfile === "BALANCED" && "Your portfolio balances growth and safety. A diversified mix of equities and bonds with moderate alternative exposure."}
              {profile.riskProfile === "AGGRESSIVE" && "Your portfolio maximizes long-term growth with heavy equity exposure. Higher volatility, higher expected returns."}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Personal */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--text-gold)" }}>👤 Personal Information</h3>
          <InfoRow label="Full Name"   value={profile.fullName} />
          <InfoRow label="Location"    value={profile.location} />
          <InfoRow label="Age"         value={`${profile.age} years`} />
          <InfoRow label="Experience"  value={expLabels[profile.experienceLevel] ?? profile.experienceLevel} />
        </div>

        {/* Goals */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--text-gold)" }}>🎯 Investment Goals</h3>
          <InfoRow label="Primary Goal"   value={goalLabels[profile.goal] ?? profile.goal} />
          <InfoRow label="Time Horizon"   value={horizonLabels[profile.timeHorizon] ?? profile.timeHorizon} />
          <InfoRow label="Starting Capital" value={`$${profile.capitalUSD.toLocaleString()} USD`} />
          <InfoRow label="ESG Only"        value={profile.esgOnly ? "✅ Yes" : "No"} />
        </div>

        {/* Exclusions */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--text-gold)" }}>🚫 Exclusions</h3>
          <div style={{ marginBottom: 12 }}>
            <div className="label">Excluded Sectors</div>
            {profile.excludedSectors.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.excludedSectors.map(s => (
                  <span key={s} className="badge badge-red">{s}</span>
                ))}
              </div>
            ) : <span style={{ color: "var(--text-muted)", fontSize: 14 }}>None</span>}
          </div>
          <div>
            <div className="label">Excluded Asset Classes</div>
            {profile.excludedAssets.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.excludedAssets.map(a => (
                  <span key={a} className="badge badge-red">{a}</span>
                ))}
              </div>
            ) : <span style={{ color: "var(--text-muted)", fontSize: 14 }}>None</span>}
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--text-gold)" }}>⚙️ Preferences</h3>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Rebalancing Threshold: <strong style={{ color: "var(--text-gold)" }}>{threshold}%</strong></label>
            <input type="range" min={2} max={10} step={1} value={threshold}
              onChange={e => setThreshold(parseInt(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              <span>2% (frequent)</span><span>10% (infrequent)</span>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Display Currency</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["USD", "INR"].map(c => (
                <button key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14,
                    border: currency === c ? "1px solid var(--gold-300)" : "1px solid var(--border)",
                    background: currency === c ? "rgba(249,200,70,0.08)" : "var(--bg-elevated)",
                    color: currency === c ? "var(--text-gold)" : "var(--text-secondary)",
                    transition: "all 0.15s ease",
                  }}>
                  {c === "USD" ? "$ USD" : "₹ INR"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn-primary" onClick={savePreferences} disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </button>
            {saveMsg && <span style={{ fontSize: 13, color: saveMsg.includes("✓") ? "var(--green)" : "var(--red)" }}>{saveMsg}</span>}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/kuberaa/allocation" className="btn-ghost">View Allocation →</Link>
        <Link href="/kuberaa/dashboard" className="btn-ghost">Go to Dashboard →</Link>
      </div>
    </div>
  );
}
