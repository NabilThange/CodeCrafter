"use client";

import { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import Link from "next/link";

interface Allocation {
  equityPct: number;
  bondPct: number;
  altPct: number;
  expectedReturn: number;
  expectedVolatility: number;
  riskScore: number;
}

export default function AllocationPage() {
  const [alloc, setAlloc]       = useState<Allocation | null>(null);
  const [equity, setEquity]     = useState(55);
  const [bond, setBond]         = useState(35);
  const [alt, setAlt]           = useState(10);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");
  const [error, setError]       = useState("");

  useEffect(() => {
    fetch("/api/kuberaa/allocation")
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setAlloc(d);
        setEquity(Math.round(d.equityPct * 100));
        setBond(Math.round(d.bondPct * 100));
        setAlt(Math.round(d.altPct * 100));
        setLoading(false);
      })
      .catch(() => { setError("Failed to load allocation"); setLoading(false); });
  }, []);

  function handleSlider(changed: "equity" | "bond" | "alt", val: number) {
    const v = Math.max(0, Math.min(100, val));
    if (changed === "equity") {
      const remaining = 100 - v;
      const ratio = bond + alt > 0 ? bond / (bond + alt) : 0.5;
      setBond(Math.round(remaining * ratio));
      setAlt(100 - v - Math.round(remaining * ratio));
      setEquity(v);
    } else if (changed === "bond") {
      const remaining = 100 - v;
      const ratio = equity + alt > 0 ? equity / (equity + alt) : 0.5;
      setEquity(Math.round(remaining * ratio));
      setAlt(100 - v - Math.round(remaining * ratio));
      setBond(v);
    } else {
      const remaining = 100 - v;
      const ratio = equity + bond > 0 ? equity / (equity + bond) : 0.5;
      setEquity(Math.round(remaining * ratio));
      setBond(100 - v - Math.round(remaining * ratio));
      setAlt(v);
    }
  }

  const total = equity + bond + alt;

  async function saveAllocation() {
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch("/api/kuberaa/allocation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equityPct: equity / 100,
          bondPct: bond / 100,
          altPct: alt / 100,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaveMsg("Saved ✓");
    } catch { setSaveMsg("Save failed"); }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  if (loading) return (
    <div style={{ maxWidth: 900 }}>
      <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 40 }} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 350, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign:"center", paddingTop:80 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
      <h2 style={{ marginBottom:8 }}>No Allocation Found</h2>
      <p style={{ color:"var(--text-secondary)", marginBottom:24 }}>{error}</p>
      <Link href="/kuberaa/onboarding" className="btn-primary">Complete Onboarding →</Link>
    </div>
  );

  // Estimated return / vol from allocation (simple linear model)
  const estReturn      = (equity * 0.001 * 10.5 + bond * 0.001 * 4.2 + alt * 0.001 * 7.8).toFixed(1);
  const estVol         = (equity * 0.001 * 15 + bond * 0.001 * 5 + alt * 0.001 * 12).toFixed(1);
  const estSharpe      = ((parseFloat(estReturn) - 4.5) / parseFloat(estVol)).toFixed(2);

  const pieData = [
    { id: 0, value: equity, label: "Equities",     color: "#f9c846" },
    { id: 1, value: bond,   label: "Bonds",         color: "#3b82f6" },
    { id: 2, value: alt,    label: "Alternatives",  color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const sliders = [
    { key: "equity" as const, label: "Equities", value: equity, color: "#f9c846",
      description: "Stocks & ETFs — higher growth, higher volatility" },
    { key: "bond"   as const, label: "Bonds",    value: bond,   color: "#3b82f6",
      description: "Fixed income — stable returns, lower risk" },
    { key: "alt"    as const, label: "Alternatives", value: alt, color: "#8b5cf6",
      description: "Gold, REITs, commodities — portfolio diversifier" },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40 }}>
        <div>
          <h1 style={{ fontSize:32, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", marginBottom:6 }}>
            Asset Allocation
          </h1>
          <p style={{ color:"var(--text-secondary)" }}>
            System-generated from your risk score of <strong style={{ color:"var(--text-gold)" }}>{alloc?.riskScore}</strong>. Adjust the sliders to customize.
          </p>
        </div>
        <Link href="/kuberaa/etfs" className="btn-primary">Next: Select ETFs →</Link>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        {/* Sliders */}
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:24, color:"var(--text-gold)" }}>📐 Adjust Allocation</h3>

          {sliders.map(({ key, label, value, color, description }) => (
            <div key={key} style={{ marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:15 }}>{label}</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)" }}>{description}</div>
                </div>
                <div style={{ fontSize:28, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color }}>
                  {value}<span style={{ fontSize:16, fontWeight:500, color:"var(--text-muted)" }}>%</span>
                </div>
              </div>
              <div style={{ position:"relative" }}>
                <div style={{
                  position:"absolute", top:0, left:0, height:6,
                  width:`${value}%`, background:`linear-gradient(90deg, ${color}88, ${color})`,
                  borderRadius:99, pointerEvents:"none", transition:"width 0.1s",
                }} />
                <input type="range" min={0} max={100} value={value}
                  onChange={e => handleSlider(key, parseInt(e.target.value))} />
              </div>
            </div>
          ))}

          {/* Total indicator */}
          <div style={{
            padding:"12px 16px", borderRadius:10, marginTop:8,
            background: total === 100 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${total === 100 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span style={{ fontSize:13, fontWeight:600, color:"var(--text-secondary)" }}>Total</span>
            <span style={{ fontSize:18, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif",
              color: total === 100 ? "var(--green)" : "var(--red)" }}>
              {total}%
            </span>
          </div>
          {total !== 100 && (
            <p style={{ fontSize:12, color:"var(--red)", marginTop:8 }}>
              ⚠ Allocation must sum to exactly 100%. Currently {total > 100 ? "over" : "under"} by {Math.abs(total - 100)}%.
            </p>
          )}

          <div style={{ display:"flex", gap:12, marginTop:24, alignItems:"center" }}>
            <button className="btn-primary" onClick={saveAllocation} disabled={saving || total !== 100}>
              {saving ? "Saving..." : "Save Allocation"}
            </button>
            <button className="btn-ghost" onClick={() => {
              if (alloc) {
                setEquity(Math.round(alloc.equityPct * 100));
                setBond(Math.round(alloc.bondPct * 100));
                setAlt(Math.round(alloc.altPct * 100));
              }
            }}>Reset to System Default</button>
            {saveMsg && <span style={{ fontSize:13, color: saveMsg.includes("✓") ? "var(--green)" : "var(--red)" }}>{saveMsg}</span>}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Pie chart */}
          <div className="card" style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
            <h3 style={{ fontSize:16, marginBottom:16, color:"var(--text-gold)", alignSelf:"flex-start" }}>🥧 Allocation Breakdown</h3>
            <PieChart
              series={[{ data: pieData, innerRadius:60, outerRadius:100, paddingAngle:3, cornerRadius:6,
                highlightScope:{ fade:"global", highlight:"item" } }]}
              width={280} height={220}
              sx={{ "& .MuiChartsLegend-label": { fill:"var(--text-secondary)", fontSize:13 } }}
              slotProps={{ legend:{ direction:"row", position:{ vertical:"bottom", horizontal:"middle" }, itemMarkWidth:12, itemMarkHeight:12, markGap:8, itemGap:16 } }}
            />
          </div>

          {/* Live metrics preview */}
          <div className="card">
            <h3 style={{ fontSize:16, marginBottom:16, color:"var(--text-gold)" }}>📈 Estimated Portfolio Metrics</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {[
                { label:"Expected Return", value:`${estReturn}%`, sublabel:"per year", color:"var(--green)" },
                { label:"Expected Volatility", value:`±${estVol}%`, sublabel:"annual swing", color:"var(--red)" },
                { label:"Sharpe Ratio", value:estSharpe,
                  sublabel: parseFloat(estSharpe) < 1 ? "Below avg" : parseFloat(estSharpe) < 2 ? "Good" : "Excellent",
                  color: parseFloat(estSharpe) < 1 ? "var(--red)" : parseFloat(estSharpe) < 2 ? "var(--gold-300)" : "var(--green)" },
              ].map(({ label, value, sublabel, color }) => (
                <div key={label} className="card-elevated" style={{ textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{label}</div>
                  <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color, marginBottom:2 }}>{value}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>{sublabel}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, padding:"12px 16px", background:"rgba(249,200,70,0.04)", borderRadius:10, border:"1px solid var(--border)", fontSize:12, color:"var(--text-secondary)", lineHeight:1.6 }}>
              💡 <strong>Note:</strong> These are estimates based on historical ETF data. Past performance does not guarantee future results. Actual returns will vary.
            </div>
          </div>

          {/* System default reference */}
          {alloc && (
            <div className="card-elevated" style={{ padding:"16px 20px" }}>
              <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>System Default (Risk Score {alloc.riskScore})</div>
              <div style={{ display:"flex", gap:20 }}>
                {[
                  { label:"Equity", val:Math.round(alloc.equityPct*100) },
                  { label:"Bonds",  val:Math.round(alloc.bondPct*100) },
                  { label:"Alt",    val:Math.round(alloc.altPct*100) },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{ fontSize:12, color:"var(--text-muted)" }}>{label}</div>
                    <div style={{ fontSize:18, fontWeight:700, color:"var(--text-gold)" }}>{val}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
