"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RISK_QUESTIONS } from "@/lib/risk/questions";
import type { QuestionAnswer } from "@/lib/risk/scorer";
import { computeRiskScore, explainRiskProfile } from "@/lib/risk/scorer";

// ─── Types ────────────────────────────────────────────────────────────────────
type TimeHorizon = "LT2" | "2TO5" | "5TO10" | "GT10";
type Goal        = "GROW" | "INCOME" | "SPECIFIC" | "PRESERVE";
type Experience  = "BEGINNER" | "SOME" | "ACTIVE";

interface FormData {
  // Step 1
  fullName: string;
  country: string;
  age: string;
  // Step 2
  experienceLevel: Experience | "";
  // Step 3
  goal: Goal | "";
  goalDescription: string;
  targetDate: string;
  // Step 4
  timeHorizon: TimeHorizon | "";
  // Step 5
  capitalUSD: string;
  // Step 6 — one answer per risk question
  riskAnswers: (QuestionAnswer | "")[];
  // Step 7
  esgOnly: boolean;
  excludedSectors: string[];
  excludedAssets: string[];
  notes: string;
  // Step 8 override
  profileOverride: "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE" | null;
}

const INIT: FormData = {
  fullName: "", country: "", age: "",
  experienceLevel: "",
  goal: "", goalDescription: "", targetDate: "",
  timeHorizon: "",
  capitalUSD: "",
  riskAnswers: ["", "", "", ""],
  esgOnly: false, excludedSectors: [], excludedAssets: [], notes: "",
  profileOverride: null,
};

// Step counts: steps 1–5 = 1 screen each, step 6 = 4 sub-screens (one per question), step 7 = 1, step 8 = 1
// Total visible "screens": 5 + 4 + 1 + 1 = 11
// We track a single screenIndex 0–10
const TOTAL_SCREENS = 11;
const SCREEN_LABELS = [
  "About You",       // 0
  "Experience",      // 1
  "Goal",            // 2
  "Time Horizon",    // 3
  "Capital",         // 4
  "Risk Q 1",        // 5
  "Risk Q 2",        // 6
  "Risk Q 3",        // 7
  "Risk Q 4",        // 8
  "Constraints",     // 9
  "Review",          // 10
];

function getStepLabel(screen: number) {
  if (screen <= 4) return `Step ${screen + 1} of 8`;
  if (screen <= 8) return `Step 6 of 8 — Question ${screen - 4} of 4`;
  if (screen === 9) return "Step 7 of 8";
  return "Step 8 of 8";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ChoiceCard({
  selected, onClick, icon, title, subtitle, id,
}: {
  selected: boolean; onClick: () => void; icon?: string;
  title: string; subtitle?: string; id: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", border: "none", cursor: "pointer",
        padding: "18px 22px", borderRadius: 14, marginBottom: 10,
        background: selected ? "rgba(249,200,70,0.07)" : "var(--bg-elevated)",
        outline: selected ? "2px solid var(--gold-300)" : "2px solid transparent",
        outlineOffset: 0,
        transition: "all 0.18s ease",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {icon && <span style={{ fontSize: 26, flexShrink: 0 }}>{icon}</span>}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: selected ? "var(--text-gold)" : "var(--text-primary)", marginBottom: subtitle ? 3 : 0 }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{subtitle}</div>}
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
          border: selected ? "none" : "2px solid var(--border)",
          background: selected ? "var(--gold-300)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.18s ease",
        }}>
          {selected && (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5l3.5 3.5 5.5-6" stroke="#0d0a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

function ScreenTitle({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        {label}
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8, lineHeight: 1.2 }}>{title}</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65 }}>{description}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [screen, setScreen] = useState(0);
  const [data, setData]     = useState<FormData>(INIT);
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState("");
  const router = useRouter();

  // Fetch currency rate once when step 5 loads
  const loadFxRate = useCallback(() => {
    if (fxRate !== null) return;
    fetch("/api/kuberaa/currency/rate")
      .then(r => r.json())
      .then(d => { if (d.rate) setFxRate(d.rate); })
      .catch(() => {});
  }, [fxRate]);

  const set = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData(p => ({ ...p, [k]: v })), []);

  const toggleList = useCallback((key: "excludedSectors" | "excludedAssets", val: string) =>
    setData(p => {
      const list = p[key] as string[];
      return { ...p, [key]: list.includes(val) ? list.filter(x => x !== val) : [...list, val] };
    }), []);

  function setRiskAnswer(qIdx: number, ans: QuestionAnswer) {
    setData(p => {
      const next = [...p.riskAnswers] as (QuestionAnswer | "")[];
      next[qIdx] = ans;
      return { ...p, riskAnswers: next };
    });
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function canProceed(): boolean {
    switch (screen) {
      case 0: return !!data.fullName.trim() && !!data.country.trim() && !!data.age && parseInt(data.age) >= 18;
      case 1: return !!data.experienceLevel;
      case 2: return !!data.goal;
      case 3: return !!data.timeHorizon;
      case 4: return !!data.capitalUSD && parseFloat(data.capitalUSD) >= 100;
      case 5: return !!data.riskAnswers[0];
      case 6: return !!data.riskAnswers[1];
      case 7: return !!data.riskAnswers[2];
      case 8: return !!data.riskAnswers[3];
      case 9: return true;
      case 10: return true;
      default: return false;
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true); setError("");
    const answers = data.riskAnswers as QuestionAnswer[];
    const scored  = computeRiskScore({
      questionAnswers: answers,
      timeHorizon: data.timeHorizon as "LT2" | "2TO5" | "5TO10" | "GT10",
      goal: data.goal as "GROW" | "INCOME" | "SPECIFIC" | "PRESERVE",
      capitalUSD: parseFloat(data.capitalUSD),
    });
    const riskProfile = data.profileOverride ?? scored.riskProfile;

    try {
      const res = await fetch("/api/kuberaa/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          location: data.country,
          age: parseInt(data.age),
          experienceLevel: data.experienceLevel,
          goal: data.goal,
          goalDescription: data.goalDescription || null,
          targetDate: data.targetDate || null,
          timeHorizon: data.timeHorizon,
          capitalUSD: parseFloat(data.capitalUSD),
          riskAnswers: answers,
          riskScore: scored.totalScore,
          riskProfile,
          esgOnly: data.esgOnly,
          excludedSectors: data.excludedSectors,
          excludedAssets: data.excludedAssets,
          notes: data.notes,
          profileOverride: !!data.profileOverride,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save profile");
      
      // Cookie is set by the API, no need to store anything client-side
      router.push("/portfolio/build");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  // ── Computed values for step 8 ───────────────────────────────────────────────
  const allAnswered = data.riskAnswers.every(a => !!a);
  const scored = allAnswered && data.timeHorizon && data.goal && data.capitalUSD
    ? computeRiskScore({
        questionAnswers: data.riskAnswers as QuestionAnswer[],
        timeHorizon: data.timeHorizon as "LT2" | "2TO5" | "5TO10" | "GT10",
        goal: data.goal as "GROW" | "INCOME" | "SPECIFIC" | "PRESERVE",
        capitalUSD: parseFloat(data.capitalUSD) || 100,
      })
    : null;
  const computedProfile = scored?.riskProfile ?? "BALANCED";
  const effectiveProfile = data.profileOverride ?? computedProfile;

  const PROFILE_META = {
    CONSERVATIVE: { color: "#3b82f6", emoji: "🛡️" },
    BALANCED:     { color: "#f9c846", emoji: "⚖️" },
    AGGRESSIVE:   { color: "#22c55e", emoji: "🚀" },
  };
  const pm = PROFILE_META[effectiveProfile as keyof typeof PROFILE_META];

  const progress = (screen / (TOTAL_SCREENS - 1)) * 100;

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px 80px" }}>
      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 660, marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {getStepLabel(screen)}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-gold)" }}>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {/* Step pills */}
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {["About", "Experience", "Goal", "Horizon", "Capital", "Risk", "Constraints", "Review"].map((label, i) => {
            const stepScreen = i <= 4 ? i : i === 5 ? 5 : i === 6 ? 9 : 10;
            const isDone = screen > (i <= 4 ? i : i === 5 ? 8 : i === 6 ? 9 : 9);
            const isActive = i <= 4 ? screen === i : i === 5 ? screen >= 5 && screen <= 8 : i === 6 ? screen === 9 : screen === 10;
            return (
              <div key={label} onClick={() => screen > stepScreen && setScreen(stepScreen)}
                style={{
                  padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                  cursor: screen > stepScreen ? "pointer" : "default",
                  background: isDone ? "rgba(34,197,94,0.12)" : isActive ? "rgba(249,200,70,0.12)" : "var(--bg-elevated)",
                  color: isDone ? "var(--green)" : isActive ? "var(--text-gold)" : "var(--text-muted)",
                  border: `1px solid ${isDone ? "rgba(34,197,94,0.2)" : isActive ? "rgba(249,200,70,0.2)" : "var(--border)"}`,
                  transition: "all 0.15s",
                }}>
                {isDone ? "✓ " : ""}{label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Form card ────────────────────────────────────────────────────── */}
      <div className="card" style={{ width: "100%", maxWidth: 660, marginBottom: 20 }}>

        {/* ════ SCREEN 0 — About You ════ */}
        {screen === 0 && (
          <div className="fade-in">
            <ScreenTitle label={getStepLabel(0)} title="Let's start with the basics"
              description="Your name, where you're based, and your age help us personalise your experience from day one." />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="label" htmlFor="fullName">Full Name</label>
                <input id="fullName" className="input" placeholder="e.g. Priya Sharma"
                  value={data.fullName} onChange={e => set("fullName", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="label" htmlFor="country">Country / Location</label>
                  <input id="country" className="input" placeholder="e.g. India"
                    value={data.country} onChange={e => set("country", e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="age">Your Age</label>
                  <input id="age" className="input" type="number" placeholder="e.g. 28"
                    value={data.age} onChange={e => set("age", e.target.value)} min="18" max="100" />
                  {data.age && parseInt(data.age) < 18 && (
                    <p style={{ fontSize: 12, color: "var(--red)", marginTop: 6 }}>Must be 18 or older</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ SCREEN 1 — Experience ════ */}
        {screen === 1 && (
          <div className="fade-in">
            <ScreenTitle label={getStepLabel(1)} title="How much investing experience do you have?"
              description="There's no wrong answer — this helps us calibrate the level of guidance we show you." />
            <ChoiceCard id="exp-beginner" icon="🌱" selected={data.experienceLevel === "BEGINNER"}
              onClick={() => set("experienceLevel", "BEGINNER")}
              title="Complete beginner"
              subtitle="I've never bought a stock or fund and want to learn as I go." />
            <ChoiceCard id="exp-some" icon="📚" selected={data.experienceLevel === "SOME"}
              onClick={() => set("experienceLevel", "SOME")}
              title="Some experience"
              subtitle="I've bought a few investments before but don't have a consistent strategy." />
            <ChoiceCard id="exp-active" icon="⚡" selected={data.experienceLevel === "ACTIVE"}
              onClick={() => set("experienceLevel", "ACTIVE")}
              title="Actively investing"
              subtitle="I manage my own portfolio, follow markets regularly, and understand key concepts." />
          </div>
        )}

        {/* ════ SCREEN 2 — Goal ════ */}
        {screen === 2 && (
          <div className="fade-in">
            <ScreenTitle label={getStepLabel(2)} title="What is your primary investment goal?"
              description="This drives your entire allocation strategy. Be honest — you can change it later." />
            <ChoiceCard id="goal-grow" icon="📈" selected={data.goal === "GROW"}
              onClick={() => set("goal", "GROW")} title="Grow wealth over time"
              subtitle="Long-term capital appreciation — maximise total return over years or decades." />
            <ChoiceCard id="goal-income" icon="💵" selected={data.goal === "INCOME"}
              onClick={() => set("goal", "INCOME")} title="Generate regular income"
              subtitle="Dividends and bond coupons — a steady stream of cash from your portfolio." />
            <ChoiceCard id="goal-specific" icon="🎯" selected={data.goal === "SPECIFIC"}
              onClick={() => set("goal", "SPECIFIC")} title="Save for a specific goal"
              subtitle="A house, a wedding, education — a defined target with a deadline." />
            <ChoiceCard id="goal-preserve" icon="🛡️" selected={data.goal === "PRESERVE"}
              onClick={() => set("goal", "PRESERVE")} title="Preserve capital"
              subtitle="Safety first — protect what I have and stay ahead of inflation." />
            {data.goal === "SPECIFIC" && (
              <div style={{ marginTop: 20, padding: 18, background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="label" htmlFor="goalDesc">Describe your goal</label>
                    <input id="goalDesc" className="input" placeholder="e.g. Down payment for a house"
                      value={data.goalDescription} onChange={e => set("goalDescription", e.target.value)} />
                  </div>
                  <div>
                    <label className="label" htmlFor="targetDate">Target Date</label>
                    <input id="targetDate" className="input" type="date"
                      value={data.targetDate} onChange={e => set("targetDate", e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ SCREEN 3 — Time Horizon ════ */}
        {screen === 3 && (
          <div className="fade-in">
            <ScreenTitle label={getStepLabel(3)} title="How long will you keep this money invested?"
              description="Longer horizons allow more risk — markets reward patience. Don't count money you may need soon." />
            <ChoiceCard id="horizon-lt2" icon="⏱️" selected={data.timeHorizon === "LT2"}
              onClick={() => set("timeHorizon", "LT2")} title="Less than 2 years"
              subtitle="Short-term — safety and liquidity are critical. Avoid high-volatility assets." />
            <ChoiceCard id="horizon-2to5" icon="📅" selected={data.timeHorizon === "2TO5"}
              onClick={() => set("timeHorizon", "2TO5")} title="2 – 5 years"
              subtitle="Medium-term — a balanced mix of growth and stability." />
            <ChoiceCard id="horizon-5to10" icon="🗓️" selected={data.timeHorizon === "5TO10"}
              onClick={() => set("timeHorizon", "5TO10")} title="5 – 10 years"
              subtitle="Long-term — you can ride out downturns. Growth-oriented allocation is appropriate." />
            <ChoiceCard id="horizon-gt10" icon="♾️" selected={data.timeHorizon === "GT10"}
              onClick={() => set("timeHorizon", "GT10")} title="More than 10 years"
              subtitle="Very long-term — compounding has time to work. Equity-heavy allocations are well-suited." />
          </div>
        )}

        {/* ════ SCREEN 4 — Capital ════ */}
        {screen === 4 && (() => { if (screen === 4) loadFxRate(); return null; })()}
        {screen === 4 && (
          <div className="fade-in">
            <ScreenTitle label={getStepLabel(4)} title="How much are you starting with?"
              description="This is your virtual paper-trading capital — no real money changes hands. Minimum: $100 USD." />
            <div style={{ maxWidth: 340 }}>
              <label className="label" htmlFor="capital">Starting Amount</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 700, fontSize: 16, zIndex: 1 }}>$</span>
                <input id="capital" className="input" type="number" placeholder="10,000"
                  value={data.capitalUSD} min="100"
                  onChange={e => set("capitalUSD", e.target.value)}
                  style={{ paddingLeft: 32 }} />
              </div>
              {data.capitalUSD && parseFloat(data.capitalUSD) < 100 && (
                <p style={{ fontSize: 13, color: "var(--red)", marginTop: 8 }}>⚠ Minimum is $100 — below this, meaningful diversification isn't possible.</p>
              )}
              {data.capitalUSD && parseFloat(data.capitalUSD) >= 100 && (
                <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(249,200,70,0.06)", border: "1px solid var(--border-gold)", borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Approx. in Indian Rupees</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: "var(--text-gold)" }}>
                    ₹{fxRate
                      ? Math.round(parseFloat(data.capitalUSD) * fxRate).toLocaleString("en-IN")
                      : (parseFloat(data.capitalUSD) * 83.5).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </div>
                  {fxRate && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>at ₹{fxRate.toFixed(2)} / USD</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ SCREENS 5–8 — Risk questions (one per screen) ════ */}
        {screen >= 5 && screen <= 8 && (() => {
          const qIdx = screen - 5;
          const q = RISK_QUESTIONS[qIdx];
          return (
            <div className="fade-in">
              <ScreenTitle label={getStepLabel(screen)} title={q.question}
                description={q.description ?? "Choose the answer that best reflects your honest instinct."} />
              {q.options.map((opt, i) => (
                <ChoiceCard key={opt.value}
                  id={`risk-q${qIdx + 1}-${i}`}
                  selected={data.riskAnswers[qIdx] === opt.value}
                  onClick={() => setRiskAnswer(qIdx, opt.value)}
                  title={opt.label}
                />
              ))}
              {/* Running score teaser */}
              {data.riskAnswers.slice(0, qIdx + 1).every(a => !!a) && scored && (
                <div style={{ marginTop: 16, padding: "10px 16px", background: "var(--bg-elevated)", borderRadius: 10, fontSize: 12, color: "var(--text-muted)" }}>
                  Running score: <strong style={{ color: "var(--text-gold)" }}>{scored.totalScore}</strong> / 100 — updates as you answer
                </div>
              )}
            </div>
          );
        })()}

        {/* ════ SCREEN 9 — Constraints ════ */}
        {screen === 9 && (
          <div className="fade-in">
            <ScreenTitle label={getStepLabel(9)} title="Any constraints or ethical preferences?"
              description="All optional. These filters are applied before ETFs are ranked and suggested." />

            {/* ESG toggle */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 0", borderBottom: "1px solid var(--border)" }}>
              <div
                onClick={() => set("esgOnly", !data.esgOnly)}
                style={{
                  width: 44, height: 24, borderRadius: 12, cursor: "pointer", flexShrink: 0, marginTop: 2,
                  background: data.esgOnly ? "var(--gold-300)" : "var(--bg-hover)",
                  border: "1px solid var(--border)", position: "relative", transition: "background 0.2s",
                }}>
                <div style={{
                  position: "absolute", top: 2, left: data.esgOnly ? 22 : 2,
                  width: 18, height: 18, borderRadius: "50%",
                  background: data.esgOnly ? "#0d0a00" : "var(--text-muted)",
                  transition: "left 0.2s",
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>ESG / Socially responsible investing only</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                  Only include ETFs rated highly on Environmental, Social & Governance criteria. Excludes some conventional funds.
                </div>
              </div>
            </div>

            {/* Sector exclusions */}
            <div style={{ marginTop: 20 }}>
              <label className="label">Exclude sectors (click to exclude)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Tobacco", "Weapons", "Fossil Fuels", "Gambling", "Alcohol"].map(s => {
                  const on = data.excludedSectors.includes(s);
                  return (
                    <button key={s} onClick={() => toggleList("excludedSectors", s)}
                      style={{
                        padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer",
                        border: `1px solid ${on ? "rgba(239,68,68,0.35)" : "var(--border)"}`,
                        background: on ? "rgba(239,68,68,0.1)" : "var(--bg-elevated)",
                        color: on ? "var(--red)" : "var(--text-secondary)",
                        transition: "all 0.15s",
                      }}>{on ? "✕ " : ""}{s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Asset class exclusions */}
            <div style={{ marginTop: 20 }}>
              <label className="label">Exclude asset classes (click to exclude)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Commodities", "Real Estate"].map(a => {
                  const on = data.excludedAssets.includes(a);
                  return (
                    <button key={a} onClick={() => toggleList("excludedAssets", a)}
                      style={{
                        padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer",
                        border: `1px solid ${on ? "rgba(239,68,68,0.35)" : "var(--border)"}`,
                        background: on ? "rgba(239,68,68,0.1)" : "var(--bg-elevated)",
                        color: on ? "var(--red)" : "var(--text-secondary)",
                        transition: "all 0.15s",
                      }}>{on ? "✕ " : ""}{a}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginTop: 20 }}>
              <label className="label" htmlFor="notes">Anything else we should know? (optional)</label>
              <textarea id="notes" className="input" rows={3}
                style={{ resize: "vertical", fontFamily: "inherit" }}
                placeholder="Free text — any other preferences, constraints, or context."
                value={data.notes} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
        )}

        {/* ════ SCREEN 10 — Confirmation ════ */}
        {screen === 10 && (
          <div className="fade-in">
            <ScreenTitle label={getStepLabel(10)} title="Review your investor profile"
              description="Everything is editable below. Nothing has been saved yet — click Confirm when you're ready." />

            {/* Risk profile card */}
            {scored && (
              <div style={{
                padding: "20px 24px", borderRadius: 14, marginBottom: 24,
                background: `${pm.color}10`, border: `1px solid ${pm.color}28`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48 }}>{pm.emoji}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                      <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: pm.color }}>
                        {scored.totalScore}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>/ 100 risk score</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 20, color: pm.color }}>
                      {effectiveProfile.charAt(0) + effectiveProfile.slice(1).toLowerCase()} Investor
                      {data.profileOverride && <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-muted)", marginLeft: 8 }}>(manual override)</span>}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {explainRiskProfile(effectiveProfile)}
                </p>
                {/* Score breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 16 }}>
                  {[
                    { label: "Questions", val: scored.breakdown.questionScore, max: 40 },
                    { label: "Horizon",   val: scored.breakdown.timeHorizonScore, max: 25 },
                    { label: "Goal",      val: scored.breakdown.goalScore,     max: 20 },
                    { label: "Capital",   val: scored.breakdown.capitalScore,  max: 15 },
                  ].map(({ label, val, max }) => (
                    <div key={label} style={{ textAlign: "center", padding: "10px 8px", background: "rgba(0,0,0,0.2)", borderRadius: 10 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: pm.color }}>{val}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{label} (/{max})</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual override */}
            <div style={{ marginBottom: 24 }}>
              <label className="label">Override risk profile (optional)</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"] as const).map(p => {
                  const meta = PROFILE_META[p];
                  const active = data.profileOverride === p || (!data.profileOverride && computedProfile === p);
                  return (
                    <button key={p}
                      onClick={() => set("profileOverride", data.profileOverride === p ? null : p)}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${active ? `${meta.color}50` : "var(--border)"}`,
                        background: active ? `${meta.color}10` : "var(--bg-elevated)",
                        color: active ? meta.color : "var(--text-secondary)",
                        fontWeight: 600, fontSize: 13, transition: "all 0.15s",
                      }}>
                      {p === computedProfile && !data.profileOverride ? "✓ " : ""}{p.charAt(0) + p.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              {[
                { label: "Full Name",    val: data.fullName,     step: 0 },
                { label: "Location / Age", val: `${data.country}, ${data.age}y`, step: 0 },
                { label: "Experience",   val: { BEGINNER: "Beginner", SOME: "Some", ACTIVE: "Active" }[data.experienceLevel] ?? "—", step: 1 },
                { label: "Goal",         val: { GROW:"Grow wealth", INCOME:"Income", SPECIFIC:"Specific goal", PRESERVE:"Preserve capital" }[data.goal] ?? "—", step: 2 },
                { label: "Time Horizon", val: { LT2:"< 2 yrs", "2TO5":"2–5 yrs", "5TO10":"5–10 yrs", GT10:"> 10 yrs" }[data.timeHorizon] ?? "—", step: 3 },
                { label: "Capital",      val: `$${parseFloat(data.capitalUSD || "0").toLocaleString()} USD`, step: 4 },
                { label: "ESG Only",     val: data.esgOnly ? "Yes" : "No", step: 9 },
                { label: "Exclusions",   val: [...data.excludedSectors, ...data.excludedAssets].join(", ") || "None", step: 9 },
              ].map(({ label, val, step }) => (
                <div key={label} style={{ padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: 10, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{val}</div>
                  </div>
                  <button onClick={() => setScreen(step)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 11, fontWeight: 600, flexShrink: 0, paddingTop: 2 }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "var(--red)", fontSize: 14 }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation buttons ─────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 660, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn-ghost" onClick={() => setScreen(s => s - 1)} disabled={screen === 0}
          style={{ opacity: screen === 0 ? 0.3 : 1 }}>
          ← Back
        </button>
        {screen < TOTAL_SCREENS - 1 ? (
          <button id="next-btn" className="btn-primary" onClick={() => setScreen(s => s + 1)} disabled={!canProceed()}>
            Continue →
          </button>
        ) : (
          <button id="confirm-btn" className="btn-primary" onClick={handleSubmit} disabled={submitting || !canProceed()}>
            {submitting ? "Saving…" : "Confirm & Build My Portfolio →"}
          </button>
        )}
      </div>
    </div>
  );
}
