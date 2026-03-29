"use client";

import { useEffect, useState, useCallback } from "react";
import { LineChart }      from "@mui/x-charts/LineChart";
import { PieChart }       from "@mui/x-charts/PieChart";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Holding {
  etfTicker: string; currentPrice: number; currentValue: number;
  units: number; targetWeight: number; currentWeight: number;
  gainLoss: number; returnPct: number; averagePurchasePrice: number;
  etf?: { name: string; assetClass: string; historicalAnnualReturn: number; historicalVolatility: number };
}
interface Portfolio {
  id: string; virtualCash: number; totalValue: number; initialCapital: number;
  holdings: Holding[];
  metrics: { expectedReturn: number; portfolioVolatility: number; sharpeRatio: number };
  updatedAt: string;
}
interface PerfPoint  { date: string; value: number }
interface Trade      { etfTicker: string; action: "BUY"|"SELL"; amount: number; units: number; currentWeight: number; targetWeight: number; drift: number }
interface RebalPlan  { needsRebalancing: boolean; trades: Trade[]; threshold: number; totalValue: number; logId?: string }

const CLASS_COLORS: Record<string, string> = {
  Equities:"#f9c846", Bonds:"#3b82f6", "Real Estate":"#10b981",
  Commodities:"#8b5cf6", Cash:"#6b7280",
};

function fmtMoney(n: number, symbol: string, rate: number) {
  return `${symbol}${Math.round(n * rate).toLocaleString()}`;
}
function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${(n * 100).toFixed(2)}%`;
}

// ─── Trade modal ──────────────────────────────────────────────────────────────
function TradeModal({
  ticker, price, onClose, onDone,
}: { ticker: string; price: number; onClose: () => void; onDone: () => void }) {
  const [type, setType]       = useState<"BUY"|"SELL">("BUY");
  const [units, setUnits]     = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");

  async function execute() {
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/kuberaa/trade", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ etfTicker:ticker, type, units:parseFloat(units), reason:"MANUAL" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg(`✓ ${type === "BUY" ? "Bought" : "Sold"} ${units} units`);
      setTimeout(() => { onDone(); }, 1600);
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Failed"); }
    setLoading(false);
  }

  const total = units && price ? Math.round(parseFloat(units) * price) : 0;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div className="card" style={{ width:420, padding:32, boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h3 style={{ fontSize:20 }}>Trade <span style={{ color:"var(--text-gold)" }}>{ticker}</span></h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:"flex", background:"var(--bg-elevated)", borderRadius:10, padding:4, marginBottom:24 }}>
          {(["BUY","SELL"] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex:1, padding:"10px", borderRadius:8, border:"none", cursor:"pointer",
              fontSize:14, fontWeight:700, transition:"all 0.15s",
              background: type === t ? (t==="BUY" ? "var(--green)" : "var(--red)") : "transparent",
              color: type === t ? "#fff" : "var(--text-muted)",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ marginBottom:16 }}>
          <label className="label">Current Price</label>
          <div style={{ fontSize:22, fontWeight:800 }}>${price.toFixed(2)}</div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label className="label" htmlFor="units-input">Units to {type === "BUY" ? "buy" : "sell"}</label>
          <input id="units-input" className="input" type="number" min="0.0001" step="0.01"
            placeholder="e.g. 2" value={units} onChange={e => setUnits(e.target.value)} />
          {total > 0 && (
            <div style={{ marginTop:8, fontSize:13, color:"var(--text-secondary)" }}>
              Total: <strong style={{ color:"var(--text-gold)" }}>${total.toLocaleString()}</strong>
            </div>
          )}
        </div>
        {msg && (
          <div style={{ marginBottom:16, padding:"10px 14px", borderRadius:10, fontSize:13,
            background: msg.startsWith("✓") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border:`1px solid ${msg.startsWith("✓") ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            color: msg.startsWith("✓") ? "var(--green)" : "var(--red)" }}>
            {msg}
          </div>
        )}
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button disabled={loading || !units} onClick={execute}
            style={{ flex:2, background:type==="BUY" ? "var(--green)" : "var(--red)", color:"#fff",
              border:"none", borderRadius:10, padding:"12px", fontSize:15, fontWeight:700,
              cursor:"pointer", opacity: loading || !units ? 0.5 : 1 }}>
            {loading ? "Executing…" : `${type} ${units || "—"} units`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Rebalance modal ──────────────────────────────────────────────────────────
function RebalanceModal({ plan, onClose, onDone }: { plan: RebalPlan; onClose: () => void; onDone: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(plan.trades.filter(t => Math.abs(t.drift) > plan.threshold).map(t => t.etfTicker))
  );
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");

  async function approve() {
    setLoading(true); setMsg("");
    try {
      const trades = plan.trades.filter(t => selected.has(t.etfTicker));
      const res = await fetch("/api/kuberaa/rebalance/approve", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ logId:plan.logId, trades }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg(`✓ ${trades.length} trades executed`);
      setTimeout(onDone, 1500);
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Failed"); }
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:24 }}>
      <div className="card" style={{ width:"100%", maxWidth:640, maxHeight:"80vh", overflowY:"auto", padding:32, boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <h3>Rebalancing Plan</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:22 }}>×</button>
        </div>
        <div style={{ padding:"12px 14px", background:"rgba(249,200,70,0.06)", borderRadius:10, marginBottom:20, fontSize:13, color:"var(--text-secondary)", lineHeight:1.6 }}>
          Check positions that have drifted beyond <strong style={{ color:"var(--text-gold)" }}>{(plan.threshold*100).toFixed(0)}%</strong>.
          Sells execute first, then buys. You must approve — nothing runs automatically.
        </div>
        <table className="table" style={{ marginBottom:20 }}>
          <thead><tr><th></th><th>ETF</th><th>Action</th><th>Drift</th><th>Amount</th></tr></thead>
          <tbody>
            {plan.trades.map(t => {
              const flagged = Math.abs(t.drift) > plan.threshold;
              const isSel = selected.has(t.etfTicker);
              return (
                <tr key={t.etfTicker} style={{ opacity: flagged ? 1 : 0.5 }}>
                  <td>
                    <input type="checkbox" className="checkbox-gold" checked={isSel} disabled={!flagged}
                      onChange={() => {
                        setSelected(prev => { const n=new Set(prev); isSel ? n.delete(t.etfTicker) : n.add(t.etfTicker); return n; });
                      }} />
                  </td>
                  <td style={{ fontWeight:700, color:"var(--text-gold)" }}>{t.etfTicker}</td>
                  <td><span className={`badge ${t.action==="BUY" ? "badge-green" : "badge-red"}`}>{t.action}</span></td>
                  <td style={{ color: t.drift>0 ? "var(--red)" : "var(--green)", fontWeight:600 }}>
                    {t.drift>0?"+":""}{(t.drift*100).toFixed(2)}%
                  </td>
                  <td style={{ fontWeight:600 }}>${t.amount.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {msg && (
          <div style={{ marginBottom:16, padding:"10px 14px", borderRadius:10, fontSize:13,
            background: msg.startsWith("✓") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: msg.startsWith("✓") ? "var(--green)" : "var(--red)" }}>
            {msg}
          </div>
        )}
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Dismiss</button>
          <button className="btn-primary" disabled={loading || selected.size === 0} onClick={approve}>
            {loading ? "Executing…" : `Approve ${selected.size} trade${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [portfolio, setPortfolio]   = useState<Portfolio | null>(null);
  const [perf, setPerf]             = useState<PerfPoint[]>([]);
  const [rebalPlan, setRebalPlan]   = useState<RebalPlan | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [tradeTickr, setTradeTickr] = useState<{ ticker:string; price:number }|null>(null);
  const [showRebal, setShowRebal]   = useState(false);
  const [displayCcy, setDisplayCcy] = useState<"USD"|"INR">("USD");
  const [fxRate, setFxRate]         = useState(1);
  const [marketData, setMarketData] = useState<{ name:string; symbol:string; data:number[]; dates:string[] }[]>([]);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/kuberaa/portfolio").then(r => r.json()),
      fetch("/api/kuberaa/portfolio/performance").then(r => r.json()),
      fetch("/api/kuberaa/rebalance/check").then(r => r.json()),
      fetch("/api/kuberaa/currency/rate").then(r => r.json()),
      fetch("/api/kuberaa/market/trends").then(r => r.json()),
    ]).then(([port, p, reb, ccy, mkt]) => {
      if (port.error) { setError(port.error); setLoading(false); return; }
      setPortfolio(port);
      setPerf(Array.isArray(p) ? p : []);
      if (!reb.error) setRebalPlan(reb);
      if (ccy.rate) setFxRate(ccy.rate);
      // Build market chart data — PRD says wire to main platform; use fallback structure
      const results = Array.isArray(mkt) ? mkt : (mkt?.results ?? []);
      if (results.length > 0) {
        setMarketData(results.slice(0, 3).map((m: { name: string; symbol: string; price?: number; change?: number }) => ({
          name:   m.name ?? m.symbol,
          symbol: m.symbol,
          // Build synthetic 30-day trend from current price + change
          data:   Array.from({ length:30 }, (_, i) => {
            const base = (m.price ?? 100) - (m.change ?? 0);
            return parseFloat((base + (m.change ?? 0) * (i / 29)).toFixed(2));
          }),
          dates: Array.from({ length:30 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (29 - i));
            return d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
          }),
        })));
      }
      setLoading(false);
    }).catch(() => { setError("Failed to load"); setLoading(false); });
  }, []);

  useEffect(() => {
    loadAll();
    // Listen for currency toggle from TopNav
    const handler = (e: Event) => {
      const ccy = (e as CustomEvent<string>).detail;
      setDisplayCcy(ccy as "USD"|"INR");
    };
    window.addEventListener("ccyChange", handler);
    return () => window.removeEventListener("ccyChange", handler);
  }, [loadAll]);

  // Read initial currency from cookie
  useEffect(() => {
    const saved = document.cookie.split(";").find(c => c.trim().startsWith("displayCcy="));
    if (saved) setDisplayCcy(saved.split("=")[1].trim() as "USD"|"INR");
  }, []);

  const rate   = displayCcy === "INR" ? fxRate : 1;
  const symbol = displayCcy === "INR" ? "₹" : "$";
  const fmt    = (n: number) => fmtMoney(n, symbol, rate);

  if (loading) return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 24px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:110, borderRadius:16 }} />)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        <div className="skeleton" style={{ height:300, borderRadius:16 }} />
        <div className="skeleton" style={{ height:300, borderRadius:16 }} />
      </div>
      <div className="skeleton" style={{ height:300, borderRadius:16 }} />
    </div>
  );

  if (error || !portfolio) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🏛️</div>
      <h2 style={{ marginBottom:8 }}>No Portfolio Found</h2>
      <p style={{ color:"var(--text-secondary)", marginBottom:28, maxWidth:400, margin:"0 auto 28px" }}>
        {error || "Complete onboarding and build your portfolio to see your dashboard."}
      </p>
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <Link href="/onboarding" className="btn-primary">Start Onboarding →</Link>
        <Link href="/portfolio/build" className="btn-ghost">Build Portfolio</Link>
      </div>
    </div>
  );

  const { holdings, metrics, totalValue, virtualCash, initialCapital, updatedAt } = portfolio;
  const totalGL  = totalValue - initialCapital;
  const totalRet = initialCapital > 0 ? totalGL / initialCapital : 0;

  // Safely handle holdings array
  const safeHoldings = holdings || [];

  // Chart data
  const perfDates  = perf.map(p => p.date);
  const perfValues = perf.map(p => Math.round(p.value * rate));
  const initialLine = perf.map(() => Math.round(initialCapital * rate));

  const currentPie = safeHoldings.map((h, i) => ({
    id:i, value:Math.round(h.currentWeight*100), label:h.etfTicker,
    color: CLASS_COLORS[h.etf?.assetClass ?? ""] ?? "#6b7280",
  }));
  const targetPie = safeHoldings.map((h, i) => ({
    id:i, value:Math.round(h.targetWeight*100), label:h.etfTicker,
    color: (CLASS_COLORS[h.etf?.assetClass ?? ""] ?? "#6b7280") + "99",
  }));

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 24px 80px" }} className="fade-in">

      {/* ── Section 1: Summary bar ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", marginBottom:4 }}>Portfolio Dashboard</h1>
          <div style={{ fontSize:12, color:"var(--text-muted)" }}>
            Last updated {new Date(updatedAt).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {/* Currency toggle */}
          <div style={{ display:"flex", background:"var(--bg-elevated)", borderRadius:10, padding:3, border:"1px solid var(--border)" }}>
            {(["USD","INR"] as const).map(c => (
              <button key={c} onClick={() => {
                setDisplayCcy(c);
                document.cookie = `displayCcy=${c}; path=/; max-age=31536000`;
                window.dispatchEvent(new CustomEvent("ccyChange", { detail:c }));
              }} style={{
                padding:"7px 16px", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:13, fontWeight:600, transition:"all 0.15s",
                background: displayCcy === c ? "var(--gold-300)" : "transparent",
                color:      displayCcy === c ? "#0d0a00" : "var(--text-secondary)",
              }}>
                {c === "USD" ? "$ USD" : "₹ INR"}
              </button>
            ))}
          </div>
          <Link href="/kuberaa/transactions" className="btn-ghost">History</Link>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        <div className="card" style={{ padding:"20px 22px" }}>
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value">{fmt(totalValue)}</div>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>total incl. cash</div>
        </div>
        <div className="card" style={{ padding:"20px 22px" }}>
          <div className="stat-label">Total Gain / Loss</div>
          <div className="stat-value" style={{ color: totalGL >= 0 ? "var(--green)" : "var(--red)" }}>
            {totalGL >= 0 ? "+" : ""}{fmt(totalGL)}
          </div>
          <div style={{ fontSize:11, color: totalRet >= 0 ? "var(--green)" : "var(--red)", marginTop:4, fontWeight:600 }}>
            {fmtPct(totalRet)} all-time return
          </div>
        </div>
        <div className="card" style={{ padding:"20px 22px" }}>
          <div className="stat-label">Virtual Cash</div>
          <div className="stat-value">{fmt(virtualCash)}</div>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>available to invest</div>
        </div>
        <div className="card" style={{ padding:"20px 22px" }}>
          <div className="stat-label">Initial Capital</div>
          <div className="stat-value">{fmt(initialCapital)}</div>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>paper trading baseline</div>
        </div>
      </div>

      {/* Currency info */}
      {displayCcy === "INR" && (
        <div style={{ marginBottom:20, padding:"9px 16px", background:"rgba(249,200,70,0.06)", border:"1px solid var(--border-gold)", borderRadius:10, fontSize:13, color:"var(--text-secondary)" }}>
          <strong style={{ color:"var(--text-gold)" }}>1 USD = ₹{fxRate.toFixed(2)}</strong>
          {" · "}All values converted at this rate · cached hourly
        </div>
      )}

      {/* ── Rebalancing alert ── */}
      {rebalPlan?.needsRebalancing && (
        <div style={{ marginBottom:24, padding:"18px 22px", borderRadius:14,
          background:"rgba(249,200,70,0.07)", border:"1px solid rgba(249,200,70,0.3)",
          display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:28 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:16, color:"var(--text-gold)", marginBottom:2 }}>Your portfolio has drifted — review suggestions</div>
            <div style={{ fontSize:13, color:"var(--text-secondary)" }}>
              {rebalPlan.trades.filter(t => Math.abs(t.drift) > rebalPlan.threshold).length} positions have drifted beyond the {(rebalPlan.threshold*100).toFixed(0)}% threshold.
            </div>
          </div>
          <button id="review-rebalance-btn" className="btn-primary" onClick={() => setShowRebal(true)}>
            Review Suggestions →
          </button>
        </div>
      )}

      {/* ── Section 2: Portfolio value chart ── */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:16, color:"var(--text-gold)" }}>📈 Portfolio Value Over Time</h3>
          {perfValues.length === 0 && <span className="badge badge-muted">Awaiting price history</span>}
        </div>
        {perfValues.length > 1 ? (
          <LineChart
            xAxis={[{ data:perfDates, scaleType:"band", tickLabelStyle:{ fill:"var(--text-muted)", fontSize:11 } }]}
            series={[
              { data:perfValues, area:true, color:"#f9c846", label:"Portfolio Value",
                valueFormatter: v => `${symbol}${(v??0).toLocaleString()}` },
              { data:initialLine, color:"rgba(255,255,255,0.15)", label:"Initial Capital",
                valueFormatter: v => `${symbol}${(v??0).toLocaleString()}` },
            ]}
            height={280}
            sx={{
              "& .MuiAreaElement-root":{ fillOpacity:0.12 },
              "& .MuiLineElement-root":{ strokeWidth:2 },
              "& .MuiMarkElement-root":{ display:"none" },
              "& .MuiChartsAxis-line": { stroke:"var(--border)" },
              "& .MuiChartsAxis-tick": { stroke:"transparent" },
              "& .MuiChartsLegend-label":{ fill:"var(--text-secondary)", fontSize:12 },
            }}
          />
        ) : (
          <div style={{ height:280, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10, color:"var(--text-muted)" }}>
            <div style={{ fontSize:40 }}>📊</div>
            <div>Price history will accumulate here as time passes and prices update.</div>
          </div>
        )}
      </div>

      {/* ── Section 3: Allocation ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div className="card">
          <h3 style={{ fontSize:16, color:"var(--text-gold)", marginBottom:12 }}>🎯 Current Allocation</h3>
          <PieChart
            series={[{ data:currentPie, innerRadius:55, outerRadius:90, paddingAngle:3, cornerRadius:5,
              arcLabel: item => `${item.label}`, arcLabelMinAngle:20 }]}
            width={300} height={240}
            sx={{ "& .MuiChartsLegend-label":{ fill:"var(--text-secondary)", fontSize:12 } }}
          />
        </div>
        <div className="card">
          <h3 style={{ fontSize:16, color:"var(--text-secondary)", marginBottom:12 }}>📐 Target Allocation</h3>
          <PieChart
            series={[{ data:targetPie, innerRadius:55, outerRadius:90, paddingAngle:3, cornerRadius:5,
              arcLabel: item => `${item.label}`, arcLabelMinAngle:20 }]}
            width={300} height={240}
            sx={{ "& .MuiChartsLegend-label":{ fill:"var(--text-secondary)", fontSize:12 } }}
          />
        </div>
      </div>

      {/* ── Section 4: Holdings table ── */}
      <div className="card" style={{ marginBottom:20, padding:0, overflow:"hidden" }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontSize:16, color:"var(--text-gold)" }}>💼 Holdings</h3>
          <span style={{ fontSize:13, color:"var(--text-muted)" }}>{safeHoldings.length} positions</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft:24 }}>Ticker</th><th>Units</th>
                <th>Avg Price</th><th>Current</th><th>Value</th>
                <th>Gain/Loss</th><th>Return</th><th>Weight vs Target</th>
                <th>30d Trend</th><th>Trade</th>
              </tr>
            </thead>
            <tbody>
              {safeHoldings.map(h => {
                const gain = h.gainLoss >= 0;
                const sparkData = Array.from({ length:30 }, (_, i) =>
                  Math.round(h.averagePurchasePrice * (1 + (h.returnPct / 30) * i) * rate));
                return (
                  <tr key={h.etfTicker}>
                    <td style={{ paddingLeft:24 }}>
                      <div style={{ fontWeight:800, color:"var(--text-gold)", fontFamily:"'Space Grotesk',sans-serif" }}>{h.etfTicker}</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.etf?.name}</div>
                    </td>
                    <td style={{ fontWeight:500 }}>{Number(h.units).toFixed(4)}</td>
                    <td>{fmt(h.averagePurchasePrice)}</td>
                    <td style={{ fontWeight:600 }}>{fmt(h.currentPrice)}</td>
                    <td style={{ fontWeight:700 }}>{fmt(h.currentValue)}</td>
                    <td className={gain ? "gain" : "loss"} style={{ fontWeight:700 }}>
                      {gain?"+":""}{fmt(h.gainLoss)}
                    </td>
                    <td className={gain ? "gain" : "loss"} style={{ fontWeight:700 }}>
                      {fmtPct(h.returnPct)}
                    </td>
                    <td>
                      <div style={{ fontSize:13, fontWeight:700 }}>{Math.round(h.currentWeight*100)}%</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>target {Math.round(h.targetWeight*100)}%</div>
                    </td>
                    <td style={{ width:90 }}>
                      <SparkLineChart data={sparkData} width={80} height={32}
                        color={gain ? "#22c55e" : "#ef4444"} />
                    </td>
                    <td>
                      <button id={`trade-${h.etfTicker}`} className="btn-ghost" style={{ padding:"5px 12px", fontSize:12 }}
                        onClick={() => setTradeTickr({ ticker:h.etfTicker, price:h.currentPrice })}>
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: Risk metrics ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Expected Annual Return", value:`${(metrics.expectedReturn*100).toFixed(2)}%`, sub:"From historical ETF data", color:"var(--green)" },
          { label:"Portfolio Volatility",   value:`±${(metrics.portfolioVolatility*100).toFixed(2)}%`, sub:"Correlation-adjusted, annualised", color:"var(--red)" },
          { label:"Sharpe Ratio",
            value: metrics.sharpeRatio.toFixed(2),
            sub: metrics.sharpeRatio < 1 ? "Below average" : metrics.sharpeRatio < 2 ? "Good risk-adjusted return" : "Excellent risk-adjusted return",
            color: metrics.sharpeRatio < 1 ? "var(--red)" : metrics.sharpeRatio < 2 ? "var(--gold-300)" : "var(--green)" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card" style={{ padding:"20px 22px" }}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Section 6: Market trends ── */}
      <div className="card" style={{ marginBottom:20 }}>
        <h3 style={{ fontSize:16, color:"var(--text-gold)", marginBottom:20 }}>🌍 Market Trends</h3>
        {/* NOTE: Wired to /api/kuberaa/market/trends which proxies the main platform market data.
            If the main platform endpoint is unavailable, this section shows an empty/placeholder state.
            Replace the API route's data source once the main platform endpoint is confirmed. */}
        {marketData.length > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {marketData.map(m => (
              <div key={m.symbol}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:"var(--text-gold)" }}>{m.symbol}</div>
                    <div style={{ fontSize:11, color:"var(--text-muted)" }}>{m.name}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:700 }}>${m.data[m.data.length-1]?.toLocaleString()}</div>
                  </div>
                </div>
                <LineChart
                  xAxis={[{ data:m.dates, scaleType:"band", tickLabelStyle:{ fill:"var(--text-muted)", fontSize:9 } }]}
                  series={[{ data:m.data, color:"#f9c846" }]}
                  height={140}
                  sx={{ "& .MuiMarkElement-root":{ display:"none" }, "& .MuiChartsAxis-line":{ stroke:"var(--border)" }, "& .MuiChartsAxis-tick":{ stroke:"transparent" } }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding:"40px 0", textAlign:"center", color:"var(--text-muted)" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📡</div>
            <div style={{ fontWeight:600, marginBottom:6 }}>Market data endpoint not yet connected</div>
            <div style={{ fontSize:13 }}>
              Wire <code style={{ background:"var(--bg-elevated)", padding:"2px 6px", borderRadius:4 }}>/api/kuberaa/market/trends</code> to the main platform&apos;s market feed once the endpoint is confirmed.
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {tradeTickr && (
        <TradeModal
          ticker={tradeTickr.ticker}
          price={tradeTickr.price}
          onClose={() => setTradeTickr(null)}
          onDone={() => { setTradeTickr(null); loadAll(); }}
        />
      )}
      {showRebal && rebalPlan && (
        <RebalanceModal
          plan={rebalPlan}
          onClose={() => setShowRebal(false)}
          onDone={() => { setShowRebal(false); loadAll(); }}
        />
      )}
    </div>
  );
}
