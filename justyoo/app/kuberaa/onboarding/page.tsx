"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────
interface OnboardingData {
  // Step 1
  fullName: string;
  country: string;
  age: string;
  // Step 2
  experienceLevel: "BEGINNER" | "SOME" | "ACTIVE" | "";
  // Step 3
  goal: "GROW" | "INCOME" | "SPECIFIC" | "PRESERVE" | "";
  goalDescription: string;
  targetDate: string;
  // Step 4
  timeHorizon: "LT2" | "2TO5" | "5TO10" | "GT10" | "";
  // Step 5
  capitalUSD: string;
  // Step 6 — 4 risk questions (a/b/c = conservative/balanced/aggressive)
  riskQ1: "a" | "b" | "c" | "";
  riskQ2: "a" | "b" | "c" | "";
  riskQ3: "a" | "b" | "c" | "";
  riskQ4: "a" | "b" | "c" | "";
  // Step 7
  esgOnly: boolean;
  excludedSectors: string[];
  excludedAssets: string[];
  notes: string;
}

const INIT: OnboardingData = {
  fullName: "", country: "", age: "",
  experienceLevel: "",
  goal: "", goalDescription: "", targetDate: "",
  timeHorizon: "",
  capitalUSD: "",
  riskQ1: "", riskQ2: "", riskQ3: "", riskQ4: "",
  esgOnly: false, excludedSectors: [], excludedAssets: [], notes: "",
};

const TOTAL_STEPS = 8;

const SECTORS = ["Technology", "Healthcare", "Energy", "Financials", "Tobacco", "Weapons", "Fossil Fuels", "Gambling", "Alcohol"];
const ASSET_CLASSES = ["Commodities", "Real Estate", "Bonds", "Crypto", "Emerging Markets"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function computeRiskScore(data: OnboardingData): number {
  let score = 0;
  const riskMap = { a: 2, b: 6, c: 10 };
  score += (riskMap[data.riskQ1] ?? 0) + (riskMap[data.riskQ2] ?? 0) +
           (riskMap[data.riskQ3] ?? 0) + (riskMap[data.riskQ4] ?? 0);
  const horizonMap = { LT2: 5, "2TO5": 10, "5TO10": 18, GT10: 25 };
  score += horizonMap[data.timeHorizon as keyof typeof horizonMap] ?? 0;
  const goalMap = { PRESERVE: 5, INCOME: 10, GROW: 15, SPECIFIC: 20 };
  score += goalMap[data.goal as keyof typeof goalMap] ?? 0;
  const cap = parseFloat(data.capitalUSD) || 0;
  if (cap < 5000) score += 5;
  else if (cap < 25000) score += 8;
  else if (cap < 100000) score += 11;
  else score += 15;
  return Math.min(score, 100);
}

function getRiskProfile(score: number): { label: string; color: string; description: string } {
  if (score <= 35) return { label: "Conservative", color: "#3b82f6", description: "You prioritize capital preservation over growth. Your portfolio will lean towards bonds and stable assets." };
  if (score <= 65) return { label: "Balanced", color: "#f9c846", description: "You seek a balance between growth and stability. Equal weight across equities and bonds." };
  return { label: "Aggressive", color: "#22c55e", description: "You're comfortable with risk in pursuit of maximum long-term returns. Heavy equity allocation." };
}

// ─── Step components ──────────────────────────────────────────────────────────
function StepHeader({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        Step {step} of {TOTAL_STEPS}
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>{title}</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

function ChoiceCard({
  selected, onClick, title, subtitle, icon,
}: { selected: boolean; onClick: () => void; title: string; subtitle?: string; icon?: string }) {
  return (
    <div className={`choice-card${selected ? " selected" : ""}`} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: selected ? "var(--text-gold)" : "var(--text-primary)" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{subtitle}</div>}
        </div>
        {selected && (
          <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "var(--gold-300)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0d0a00" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INIT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const progress = ((step - 1) / TOTAL_STEPS) * 100;
  const set = useCallback(<K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [key]: val }));
  }, []);

  const toggleList = useCallback((key: "excludedSectors" | "excludedAssets", val: string) => {
    setData(prev => {
      const list = prev[key];
      return { ...prev, [key]: list.includes(val) ? list.filter(x => x !== val) : [...list, val] };
    });
  }, []);

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!data.fullName.trim() && !!data.country.trim() && !!data.age;
      case 2: return !!data.experienceLevel;
      case 3: return !!data.goal;
      case 4: return !!data.timeHorizon;
      case 5: return !!data.capitalUSD && parseFloat(data.capitalUSD) >= 100;
      case 6: return !!data.riskQ1 && !!data.riskQ2 && !!data.riskQ3 && !!data.riskQ4;
      case 7: return true;
      case 8: return true;
      default: return false;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const score = computeRiskScore(data);
    const profile = getRiskProfile(score);
    try {
      const res = await fetch("/api/kuberaa/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          country: data.country,
          age: parseInt(data.age),
          experienceLevel: data.experienceLevel,
          goal: data.goal,
          goalDescription: data.goalDescription || null,
          targetDate: data.targetDate || null,
          timeHorizon: data.timeHorizon,
          capitalUSD: parseFloat(data.capitalUSD),
          riskAnswers: [data.riskQ1, data.riskQ2, data.riskQ3, data.riskQ4],
          esgOnly: data.esgOnly,
          excludedSectors: data.excludedSectors,
          excludedAssets: data.excludedAssets,
          notes: data.notes,
          riskScore: score,
          riskProfile: profile.label.toUpperCase(),
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to save profile");
      }
      router.push("/kuberaa/allocation");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const riskScore = computeRiskScore(data);
  const riskProfileInfo = getRiskProfile(riskScore);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }} className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>
          Welcome to <span style={{ color: "var(--text-gold)" }}>Kuberaa</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Answer a few questions and we&apos;ll build a personalized portfolio strategy, just for you.
        </p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Step <strong style={{ color: "var(--text-primary)" }}>{step}</strong> of {TOTAL_STEPS}
          </span>
          <span style={{ fontSize: 13, color: "var(--text-gold)", fontWeight: 600 }}>
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
            <div key={s} className={`step-dot ${s === step ? "active" : s < step ? "completed" : "pending"}`}>
              {s < step ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              ) : s}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="card" style={{ marginBottom: 24 }}>
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="fade-in">
            <StepHeader step={1} title="Tell us about yourself" description="Basic information to personalize your experience from day one." />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="e.g. Priya Sharma" value={data.fullName}
                  onChange={e => set("fullName", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="label">Country / Location</label>
                  <input className="input" placeholder="e.g. India" value={data.country}
                    onChange={e => set("country", e.target.value)} />
                </div>
                <div>
                  <label className="label">Age</label>
                  <input className="input" type="number" placeholder="e.g. 28" value={data.age}
                    onChange={e => set("age", e.target.value)} min="18" max="100" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="fade-in">
            <StepHeader step={2} title="Your investing experience" description="No wrong answers — this helps us set the right level of guidance." />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ChoiceCard icon="🌱" selected={data.experienceLevel === "BEGINNER"} onClick={() => set("experienceLevel", "BEGINNER")}
                title="Complete beginner" subtitle="I've never invested before and want to learn as I go." />
              <ChoiceCard icon="📊" selected={data.experienceLevel === "SOME"} onClick={() => set("experienceLevel", "SOME")}
                title="Some experience" subtitle="I've bought a few stocks or funds but don't have a strategy." />
              <ChoiceCard icon="⚡" selected={data.experienceLevel === "ACTIVE"} onClick={() => set("experienceLevel", "ACTIVE")}
                title="Actively investing" subtitle="I manage my own portfolio and understand market fundamentals." />
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="fade-in">
            <StepHeader step={3} title="Your investment goal" description="What are you trying to achieve with this portfolio?" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ChoiceCard icon="📈" selected={data.goal === "GROW"} onClick={() => set("goal", "GROW")}
                title="Grow wealth over time" subtitle="Long-term capital appreciation — maximize total return." />
              <ChoiceCard icon="💰" selected={data.goal === "INCOME"} onClick={() => set("goal", "INCOME")}
                title="Generate regular income" subtitle="Dividend and bond income — steady cash flow." />
              <ChoiceCard icon="🎯" selected={data.goal === "SPECIFIC"} onClick={() => set("goal", "SPECIFIC")}
                title="Save for a specific goal" subtitle="A house, education, wedding — defined target and date." />
              <ChoiceCard icon="🛡️" selected={data.goal === "PRESERVE"} onClick={() => set("goal", "PRESERVE")}
                title="Preserve capital" subtitle="Safety first — protect what I have from inflation." />
            </div>
            {data.goal === "SPECIFIC" && (
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="label">Describe your goal</label>
                  <input className="input" placeholder="e.g. Down payment for a house" value={data.goalDescription}
                    onChange={e => set("goalDescription", e.target.value)} />
                </div>
                <div>
                  <label className="label">Target Date</label>
                  <input className="input" type="date" value={data.targetDate}
                    onChange={e => set("targetDate", e.target.value)} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div className="fade-in">
            <StepHeader step={4} title="Your time horizon" description="How long do you plan to keep your money invested?" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ChoiceCard icon="⏱️" selected={data.timeHorizon === "LT2"} onClick={() => set("timeHorizon", "LT2")}
                title="Less than 2 years" subtitle="Short-term — safety and liquidity are critical." />
              <ChoiceCard icon="📅" selected={data.timeHorizon === "2TO5"} onClick={() => set("timeHorizon", "2TO5")}
                title="2 – 5 years" subtitle="Medium-term — some growth with moderate risk." />
              <ChoiceCard icon="🗓️" selected={data.timeHorizon === "5TO10"} onClick={() => set("timeHorizon", "5TO10")}
                title="5 – 10 years" subtitle="Long-term — can ride out market volatility." />
              <ChoiceCard icon="♾️" selected={data.timeHorizon === "GT10"} onClick={() => set("timeHorizon", "GT10")}
                title="More than 10 years" subtitle="Very long-term — compounding works in your favor." />
            </div>
          </div>
        )}

        {/* ── STEP 5 ── */}
        {step === 5 && (
          <div className="fade-in">
            <StepHeader step={5} title="Starting capital" description="How much are you starting with? Minimum $100 USD." />
            <div style={{ position: "relative", maxWidth: 400 }}>
              <label className="label">Amount (USD)</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600, fontSize: 16 }}>$</span>
                <input className="input" type="number" placeholder="10,000" value={data.capitalUSD}
                  onChange={e => set("capitalUSD", e.target.value)} min="100" style={{ paddingLeft: 32 }} />
              </div>
              {data.capitalUSD && parseFloat(data.capitalUSD) < 100 && (
                <p style={{ color: "var(--red)", fontSize: 13, marginTop: 8 }}>Minimum investment is $100 USD.</p>
              )}
              {data.capitalUSD && parseFloat(data.capitalUSD) >= 100 && (
                <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(249,200,70,0.06)", border: "1px solid var(--border-gold)", borderRadius: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                  ≈ ₹{(parseFloat(data.capitalUSD) * 83.5).toLocaleString("en-IN", { maximumFractionDigits: 0 })} INR at current rates
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 6 ── */}
        {step === 6 && (
          <div className="fade-in">
            <StepHeader step={6} title="Risk tolerance questions" description="Answer honestly — these 4 scenarios determine your risk score." />
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Q1 */}
              <div>
                <p style={{ fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
                  1. Your portfolio drops 20% in a month. What do you do?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <ChoiceCard selected={data.riskQ1 === "a"} onClick={() => set("riskQ1", "a")} title="Sell everything and move to cash" />
                  <ChoiceCard selected={data.riskQ1 === "b"} onClick={() => set("riskQ1", "b")} title="Hold and wait for recovery" />
                  <ChoiceCard selected={data.riskQ1 === "c"} onClick={() => set("riskQ1", "c")} title="Buy more — it's on sale" />
                </div>
              </div>
              {/* Q2 */}
              <div>
                <p style={{ fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
                  2. Your primary investment concern is:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <ChoiceCard selected={data.riskQ2 === "a"} onClick={() => set("riskQ2", "a")} title="Not losing any of my money" />
                  <ChoiceCard selected={data.riskQ2 === "b"} onClick={() => set("riskQ2", "b")} title="A balance of growth and safety" />
                  <ChoiceCard selected={data.riskQ2 === "c"} onClick={() => set("riskQ2", "c")} title="Maximum long-term growth" />
                </div>
              </div>
              {/* Q3 */}
              <div>
                <p style={{ fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
                  3. Have you invested in stocks or funds before?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <ChoiceCard selected={data.riskQ3 === "a"} onClick={() => set("riskQ3", "a")} title="Never" />
                  <ChoiceCard selected={data.riskQ3 === "b"} onClick={() => set("riskQ3", "b")} title="A little — I've dabbled" />
                  <ChoiceCard selected={data.riskQ3 === "c"} onClick={() => set("riskQ3", "c")} title="Yes, I invest actively" />
                </div>
              </div>
              {/* Q4 */}
              <div>
                <p style={{ fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
                  4. A high-risk investment could triple your money in 3 years. You:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <ChoiceCard selected={data.riskQ4 === "a"} onClick={() => set("riskQ4", "a")} title="Skip it — too risky" />
                  <ChoiceCard selected={data.riskQ4 === "b"} onClick={() => set("riskQ4", "b")} title="Invest a small amount and watch it" />
                  <ChoiceCard selected={data.riskQ4 === "c"} onClick={() => set("riskQ4", "c")} title="Put a significant portion of my portfolio in" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 7 ── */}
        {step === 7 && (
          <div className="fade-in">
            <StepHeader step={7} title="Constraints & preferences" description="Optional filters to align your portfolio with your values." />
            {/* ESG */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
              <input type="checkbox" className="checkbox-gold" id="esg" checked={data.esgOnly}
                onChange={e => set("esgOnly", e.target.checked)} />
              <label htmlFor="esg" style={{ cursor: "pointer" }}>
                <div style={{ fontWeight: 600 }}>ESG / Ethical investing only</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Only include ETFs with high environmental, social & governance ratings</div>
              </label>
            </div>
            {/* Excluded Sectors */}
            <div style={{ marginTop: 20 }}>
              <label className="label">Exclude sectors (optional)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SECTORS.map(s => (
                  <button key={s}
                    style={{
                      padding: "7px 14px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer",
                      border: data.excludedSectors.includes(s) ? "1px solid var(--red)" : "1px solid var(--border)",
                      background: data.excludedSectors.includes(s) ? "rgba(239,68,68,0.1)" : "var(--bg-elevated)",
                      color: data.excludedSectors.includes(s) ? "var(--red)" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => toggleList("excludedSectors", s)}>{s}
                  </button>
                ))}
              </div>
            </div>
            {/* Excluded Assets */}
            <div style={{ marginTop: 20 }}>
              <label className="label">Exclude asset classes (optional)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ASSET_CLASSES.map(a => (
                  <button key={a}
                    style={{
                      padding: "7px 14px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer",
                      border: data.excludedAssets.includes(a) ? "1px solid var(--red)" : "1px solid var(--border)",
                      background: data.excludedAssets.includes(a) ? "rgba(239,68,68,0.1)" : "var(--bg-elevated)",
                      color: data.excludedAssets.includes(a) ? "var(--red)" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => toggleList("excludedAssets", a)}>{a}
                  </button>
                ))}
              </div>
            </div>
            {/* Notes */}
            <div style={{ marginTop: 20 }}>
              <label className="label">Additional notes (optional)</label>
              <textarea className="input" style={{ resize: "vertical", minHeight: 80, fontFamily: "inherit" }}
                placeholder="Any other preferences or constraints we should know about..."
                value={data.notes} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
        )}

        {/* ── STEP 8 — Confirmation ── */}
        {step === 8 && (
          <div className="fade-in">
            <StepHeader step={8} title="Confirm your investor profile" description="Review everything before we generate your portfolio strategy." />

            {/* Risk profile banner */}
            <div style={{
              padding: "20px 24px", borderRadius: 14, marginBottom: 28,
              background: `${riskProfileInfo.color}12`,
              border: `1px solid ${riskProfileInfo.color}30`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: riskProfileInfo.color }}>
                  {riskScore}<span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>/100</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: riskProfileInfo.color }}>{riskProfileInfo.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Risk Profile</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{riskProfileInfo.description}</p>
            </div>

            {/* Summary grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Name", value: data.fullName },
                { label: "Country / Age", value: `${data.country}, ${data.age} years` },
                { label: "Experience", value: { BEGINNER: "Beginner", SOME: "Some experience", ACTIVE: "Active investor" }[data.experienceLevel] },
                { label: "Goal", value: { GROW: "Grow wealth", INCOME: "Generate income", SPECIFIC: "Specific goal", PRESERVE: "Preserve capital" }[data.goal] },
                { label: "Time Horizon", value: { LT2: "< 2 years", "2TO5": "2–5 years", "5TO10": "5–10 years", GT10: "> 10 years" }[data.timeHorizon] },
                { label: "Starting Capital", value: `$${parseFloat(data.capitalUSD).toLocaleString()} USD` },
                { label: "ESG Only", value: data.esgOnly ? "✅ Yes" : "No" },
                { label: "Excluded Sectors", value: data.excludedSectors.length > 0 ? data.excludedSectors.join(", ") : "None" },
              ].map(({ label, value }) => (
                <div key={label} className="card-elevated" style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{value ?? "—"}</div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 10, color: "var(--red)", fontSize: 14 }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn-ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}
          style={{ opacity: step === 1 ? 0.3 : 1 }}>
          ← Back
        </button>
        {step < TOTAL_STEPS ? (
          <button className="btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
            Continue →
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving profile..." : "Confirm & Build Portfolio →"}
          </button>
        )}
      </div>
    </div>
  );
}
