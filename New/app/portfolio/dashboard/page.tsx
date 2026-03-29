"use client";

import { useEffect, useState, useCallback } from "react";
import { LineChart }      from "@mui/x-charts/LineChart";
import { PieChart }       from "@mui/x-charts/PieChart";
import { BarChart }       from "@mui/x-charts/BarChart";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Holding {
  etfTicker: string;
  currentPrice: number;
  currentValue: number;
  units: number;
  targetWeight: number;
  currentWeight: number;
  gainLoss: number;
  returnPct: number;
  averagePurchasePrice: number;
  etf?: { name: string; assetClass: string; historicalAnnualReturn: number; historicalVolatility: number };
}

interface Portfolio {
  id: string;
  virtualCash: number;
  totalValue: number;
  initialCapital: number;
  holdings: Holding[];
  metrics: { expectedReturn: number; portfolioVolatility: number; sharpeRatio: number };
}

interface PerformancePoint { date: string; value: number }
interface CurrencyRate { rate: number; takenAt: string }
interface MarketTrend { symbol: string; name: string; price: number; change: number; changePct: number }

const CLASS_COLORS: Record<string, string> = {
  Equities: "#f9c846", Bonds: "#3b82f6", "Real Estate": "#10b981",
  Commodities: "#8b5cf6", Cash: "#6b7280",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [portfolio, setPortfolio]     = useState<Portfolio | null>(null);
  const [perf, setPerf]               = useState<PerformancePoint[]>([]);
  const [currency, setCurrency]       = useState<CurrencyRate | null>(null);
  const [trends, setTrends]           = useState<MarketTrend[]>([]);
  const [displayCcy, setDisplayCcy]   = useState<"USD" | "INR">("USD");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [tradeModal, setTradeModal]   = useState<{ ticker: string; price: number } | null>(null);
  const [tradeType, setTradeType]     = useState<"BUY" | "SELL">("BUY");
  const [tradeUnits, setTradeUnits]   = useState("");
  const [tradeMsg, setTradeMsg]       = useState("");
  const [trading, setTrading]         = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    
    Promise.all([
      fetch(`/api/kuberaa/portfolio`).then(r => r.json()),
      fetch(`/api/kuberaa/portfolio/performance`).then(r => r.json()),
      fetch("/api/kuberaa/currency/rate").then(r => r.json()),
      fetch("/api/kuberaa/market/trends").then(r => r.json()),
    ]).then(([p, perf, ccy, tr]) => {
      if (p.error) { setError(p.error); setLoading(false); return; }
      setPortfolio(p.portfolio || p);
      setPerf(Array.isArray(perf) ? perf : []);
      setCurrency(ccy?.rate ? ccy : null);
      setTrends(Array.isArray(tr) ? tr : (tr?.results ?? []));
      setLoading(false);
    }).catch(() => { setError("Failed to load portfolio"); setLoading(false); });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function executeTrade() {
    if (!tradeModal) return;
    setTrading(true); setTradeMsg("");
    try {
      const res = await fetch("/api/kuberaa/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etfTicker: tradeModal.ticker, type: tradeType, units: parseFloat(tradeUnits), reason: "MANUAL" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setTradeMsg(`✓ ${tradeType === "BUY" ? "Bought" : "Sold"} ${tradeUnits} units of ${tradeModal.ticker}`);
      loadData();
      setTimeout(() => { setTradeModal(null); setTradeMsg(""); setTradeUnits(""); }, 2000);
    } catch (e: unknown) {
      setTradeMsg(e instanceof Error ? e.message : "Trade failed");
    }
    setTrading(false);
  }

  const fx = displayCcy === "INR" && currency ? currency.rate : 1;
  const symbol = displayCcy === "INR" ? "₹" : "$";

  function fmt(val: number, dec = 2) {
    return `${symbol}${(val * fx).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
  }

  if (loading) return (
    <div style={{ maxWidth:1200 }}>
      <div className="skeleton" style={{ height:40, width:300, marginBottom:32 }} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:110, borderRadius:16 }} />)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        <div className="skeleton" style={{ height:320, borderRadius:16 }} />
        <div className="skeleton" style={{ height:320, borderRadius:16 }} />
      </div>
    </div>
  );

  if (error || !portfolio) return (
    <div style={{ textAlign:"center", paddingTop:80 }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🏛️</div>
      <h2 style={{ marginBottom:8 }}>No Portfolio Yet</h2>
      <p style={{ color:"var(--text-secondary)", marginBottom:28 }}>{error || "Complete onboarding and select your ETFs to create your portfolio."}</p>
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <Link href="/kuberaa/onboarding" className="btn-primary">Start Onboarding →</Link>
        <Link href="/kuberaa/etfs" className="btn-ghost">Select ETFs</Link>
      </div>
    </div>
  );

  const { holdings, metrics, totalValue, virtualCash, initialCapital } = portfolio;
  const totalGainLoss    = totalValue - initialCapital;
  const totalReturnPct   = (totalGainLoss / initialCapital) * 100;

  // Chart data
  const perfDates  = perf.map(p => p.date);
  const perfValues = perf.map(p => p.value * fx);

  const pieData = holdings.map(h => ({
    id:    h.etfTicker,
    value: Math.round(h.currentWeight * 100),
    label: h.etfTicker,
    color: CLASS_COLORS[h.etf?.assetClass ?? ""] ?? "#6b7280",
  }));

  const barLabels = holdings.map(h => h.etfTicker);
  const barTarget = holdings.map(h => Math.round(h.targetWeight * 100));
  const barCurrent= holdings.map(h => Math.round(h.currentWeight * 100));

  const sharpe = metrics.sharpeRatio;

  return (
    <div className="fade-in" style={{ maxWidth:1200 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
        <div>
          <h1 style={{ fontSize:32, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", marginBottom:4 }}>Portfolio Dashboard</h1>
          <p style={{ color:"var(--text-secondary)", fontSize:14 }}>Paper trading mode — no real money involved</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {/* Currency toggle */}
          <div style={{ display:"flex", background:"var(--bg-elevated)", borderRadius:10, padding:4, border:"1px solid var(--border)" }}>
            {(["USD","INR"] as const).map(c => (
              <button key={c} onClick={() => setDisplayCcy(c)}
                style={{ padding:"6px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, transition:"all 0.15s",
                  background: displayCcy === c ? "var(--gold-300)" : "transparent",
                  color:      displayCcy === c ? "#0d0a00" : "var(--text-secondary)" }}>
                {c === "USD" ? "$" : "₹"} {c}
              </button>
            ))}
          </div>
          <Link href="/kuberaa/rebalance" className="btn-ghost">Check Rebalancing →</Link>
        </div>
      </div>

      {/* INR rate bar */}
      {currency && displayCcy === "INR" && (
        <div style={{ marginBottom:20, padding:"10px 16px", background:"rgba(249,200,70,0.06)", border:"1px solid var(--border-gold)", borderRadius:10, fontSize:13, color:"var(--text-secondary)" }}>
          <strong style={{ color:"var(--text-gold)" }}>1 USD = ₹{currency.rate.toFixed(2)}</strong>
          {" · "}Updated {new Date(currency.takenAt).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
          {" · "}Cached hourly
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {[
          { label:"Portfolio Value", value:fmt(totalValue), sub:"including cash",
            trend: totalGainLoss >= 0 ? "positive" : "negative" },
          { label:"Total Gain / Loss", value:fmt(totalGainLoss),
            sub: `${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}% all-time`,
            trend: totalGainLoss >= 0 ? "positive" : "negative" },
          { label:"Virtual Cash", value:fmt(virtualCash), sub:"available to invest", trend:"neutral" },
          { label:"Invested Capital", value:fmt(totalValue - virtualCash), sub:`of ${fmt(initialCapital)} initial`, trend:"neutral" },
        ].map(({ label, value, sub, trend }) => (
          <div key={label} className="card" style={{ padding:"20px 24px" }}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color: trend === "positive" ? "var(--green)" : trend === "negative" ? "var(--red)" : "var(--text-primary)" }}>
              {value}
            </div>
            <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Row 2: Line chart + Pie */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        {/* Performance line chart */}
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ fontSize:16, color:"var(--text-gold)" }}>📉 Portfolio Value Over Time</h3>
            {perfValues.length === 0 && <span className="badge badge-muted">Awaiting price history</span>}
          </div>
          {perfValues.length > 1 ? (
            <LineChart
              xAxis={[{ data: perfDates, scaleType:"band", tickLabelStyle:{ fill:"var(--text-muted)", fontSize:11 } }]}
              series={[{ data: perfValues, area:true, color:"#f9c846",
                valueFormatter: v => `${symbol}${v?.toLocaleString()}` }]}
              height={260}
              sx={{
                "& .MuiAreaElement-root": { fill:"url(#goldGrad)", fillOpacity:0.15 },
                "& .MuiLineElement-root": { stroke:"#f9c846", strokeWidth:2 },
                "& .MuiMarkElement-root": { display:"none" },
                "& .MuiChartsAxis-tick":  { stroke:"transparent" },
                "& .MuiChartsAxis-line":  { stroke:"var(--border)" },
              }}
            />
          ) : (
            <div style={{ height:260, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
              <div style={{ fontSize:40 }}>📊</div>
              <div style={{ color:"var(--text-muted)", fontSize:14 }}>Chart will populate as price history accumulates.</div>
            </div>
          )}
        </div>

        {/* Allocation pie */}
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:16, color:"var(--text-gold)" }}>🥧 Asset Allocation</h3>
          {pieData.length > 0 ? (
            <PieChart
              series={[{ data:pieData, innerRadius:55, outerRadius:95, paddingAngle:3, cornerRadius:5,
                highlightScope:{ fade:"global", highlight:"item" } }]}
              width={280} height={260}
              sx={{ "& .MuiChartsLegend-label": { fill:"var(--text-secondary)", fontSize:12 } }}
              slotProps={{ legend:{ direction:"column", position:{ vertical:"middle", horizontal:"right" }, itemMarkWidth:10, itemMarkHeight:10, markGap:6, itemGap:10 } }}
            />
          ) : <div style={{ height:260, display:"flex", alignItems:"center", justifyContent:"center" }}><p style={{ color:"var(--text-muted)" }}>No holdings</p></div>}
        </div>
      </div>

      {/* Row 3: Drift bar + Metrics */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        {/* Drift bar chart */}
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:16, color:"var(--text-gold)" }}>📊 Target vs Current Weight (%)</h3>
          {barLabels.length > 0 ? (
            <BarChart
              xAxis={[{ data:barLabels, scaleType:"band", tickLabelStyle:{ fill:"var(--text-secondary)", fontSize:12 } }]}
              series={[
                { data:barTarget,  label:"Target",  color:"rgba(249,200,70,0.6)" },
                { data:barCurrent, label:"Current", color:"#3b82f6" },
              ]}
              height={240}
              sx={{
                "& .MuiChartsAxis-line":  { stroke:"var(--border)" },
                "& .MuiChartsAxis-tick":  { stroke:"transparent" },
                "& .MuiChartsLegend-label": { fill:"var(--text-secondary)", fontSize:12 },
              }}
            />
          ) : <div style={{ height:240, display:"flex", alignItems:"center", justifyContent:"center" }}><p style={{ color:"var(--text-muted)" }}>No holdings</p></div>}
        </div>

        {/* Risk metrics */}
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:16, color:"var(--text-gold)" }}>⚡ Risk Metrics</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div className="stat-label">Expected Annual Return</div>
              <div style={{ fontSize:26, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:"var(--green)" }}>
                {(metrics.expectedReturn * 100).toFixed(2)}%
              </div>
              <div style={{ fontSize:11, color:"var(--text-muted)" }}>Based on historical ETF returns</div>
            </div>
            <div className="divider" />
            <div>
              <div className="stat-label">Portfolio Volatility</div>
              <div style={{ fontSize:26, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:"var(--red)" }}>
                ±{(metrics.portfolioVolatility * 100).toFixed(2)}%
              </div>
              <div style={{ fontSize:11, color:"var(--text-muted)" }}>Annualized, correlation-adjusted</div>
            </div>
            <div className="divider" />
            <div>
              <div className="stat-label">Sharpe Ratio</div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontSize:26, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif",
                  color: sharpe < 1 ? "var(--red)" : sharpe < 2 ? "var(--gold-300)" : "var(--green)" }}>
                  {sharpe.toFixed(2)}
                </div>
                <span className={`badge ${sharpe < 1 ? "badge-red" : sharpe < 2 ? "badge-gold" : "badge-green"}`}>
                  {sharpe < 1 ? "Below Average" : sharpe < 2 ? "Good" : "Excellent"}
                </span>
              </div>
              <div style={{ fontSize:11, color:"var(--text-muted)" }}>Risk-free rate: 4.5% (US T-bill)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:16, color:"var(--text-gold)" }}>💼 Holdings</h3>
          <span style={{ fontSize:13, color:"var(--text-muted)" }}>{holdings.length} positions</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>ETF</th><th>Units</th><th>Avg Price</th><th>Current Price</th>
                <th>Value</th><th>Gain/Loss</th><th>Return</th><th>Weight</th><th>Trend</th><th>Trade</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const isGain = h.gainLoss >= 0;
                const sparkData = Array.from({ length: 10 }, (_, i) =>
                  h.averagePurchasePrice * (1 + (h.returnPct / 10) * i));
                return (
                  <tr key={h.etfTicker}>
                    <td>
                      <div style={{ fontWeight:700, color:"var(--text-gold)" }}>{h.etfTicker}</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>{h.etf?.name}</div>
                    </td>
                    <td>{parseFloat(h.units.toString()).toFixed(4)}</td>
                    <td>{fmt(h.averagePurchasePrice)}</td>
                    <td style={{ fontWeight:600 }}>{fmt(h.currentPrice)}</td>
                    <td style={{ fontWeight:600 }}>{fmt(h.currentValue)}</td>
                    <td className={isGain ? "gain" : "loss"} style={{ fontWeight:600 }}>
                      {isGain ? "+" : ""}{fmt(h.gainLoss)}
                    </td>
                    <td className={isGain ? "gain" : "loss"} style={{ fontWeight:600 }}>
                      {isGain ? "+" : ""}{(h.returnPct * 100).toFixed(2)}%
                    </td>
                    <td>
                      <div style={{ fontSize:13, fontWeight:600 }}>{(h.currentWeight * 100).toFixed(1)}%</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>target {(h.targetWeight * 100).toFixed(0)}%</div>
                    </td>
                    <td style={{ width:90 }}>
                      <SparkLineChart data={sparkData} width={80} height={32}
                        colors={[isGain ? "#22c55e" : "#ef4444"]} />
                    </td>
                    <td>
                      <button className="btn-ghost" style={{ padding:"5px 12px", fontSize:12 }}
                        onClick={() => { setTradeModal({ ticker: h.etfTicker, price: h.currentPrice }); setTradeType("BUY"); setTradeUnits(""); }}>
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

      {/* Market Trends */}
      <div className="card" style={{ marginBottom:20 }}>
        <h3 style={{ fontSize:16, marginBottom:16, color:"var(--text-gold)" }}>🌍 Market Trends</h3>
        {trends.length > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12 }}>
            {trends.slice(0, 8).map(t => {
              const isUp = t.changePct >= 0;
              return (
                <div key={t.symbol} className="card-elevated" style={{ padding:"14px 16px" }}>
                  <div style={{ fontWeight:700, fontSize:15, color:"var(--text-gold)", marginBottom:2 }}>{t.symbol}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
                  <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:"var(--text-primary)" }}>
                    ${t.price?.toFixed(2) ?? "—"}
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color: isUp ? "var(--green)" : "var(--red)" }}>
                    {isUp ? "▲" : "▼"} {Math.abs(t.changePct ?? 0).toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color:"var(--text-muted)", fontSize:14 }}>Market data unavailable. Connect the main platform market feed.</p>
        )}
      </div>

      {/* Trade modal */}
      {tradeModal && (
        <div style={{ position:"fixed", inset:0, backdropFilter:"blur(6px)", background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <div className="card" style={{ width:440, padding:32, boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h3 style={{ fontSize:20 }}>Trade <span style={{ color:"var(--text-gold)" }}>{tradeModal.ticker}</span></h3>
              <button onClick={() => setTradeModal(null)} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:20 }}>✕</button>
            </div>

            {/* Buy / Sell toggle */}
            <div style={{ display:"flex", background:"var(--bg-elevated)", borderRadius:10, padding:4, marginBottom:24 }}>
              {(["BUY","SELL"] as const).map(t => (
                <button key={t} onClick={() => setTradeType(t)}
                  style={{ flex:1, padding:"10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, transition:"all 0.15s",
                    background: tradeType === t ? (t === "BUY" ? "var(--green)" : "var(--red)") : "transparent",
                    color:      tradeType === t ? "#fff" : "var(--text-muted)" }}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ marginBottom:20 }}>
              <label className="label">Current Price</label>
              <div style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)" }}>{fmt(tradeModal.price)}</div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label className="label">Units to {tradeType === "BUY" ? "Buy" : "Sell"}</label>
              <input className="input" type="number" min="0.0001" step="0.01"
                placeholder="e.g. 1.5" value={tradeUnits}
                onChange={e => setTradeUnits(e.target.value)} />
              {tradeUnits && (
                <div style={{ marginTop:10, fontSize:13, color:"var(--text-secondary)" }}>
                  Total: <strong style={{ color:"var(--text-gold)" }}>{fmt(parseFloat(tradeUnits) * tradeModal.price)}</strong>
                </div>
              )}
            </div>

            {tradeMsg && (
              <div style={{ marginBottom:16, padding:"10px 16px", borderRadius:10, fontSize:13,
                background: tradeMsg.startsWith("✓") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border:     `1px solid ${tradeMsg.startsWith("✓") ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                color:      tradeMsg.startsWith("✓") ? "var(--green)" : "var(--red)" }}>
                {tradeMsg}
              </div>
            )}

            <div style={{ display:"flex", gap:12 }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={() => setTradeModal(null)}>Cancel</button>
              <button
                style={{ flex:2, background: tradeType === "BUY" ? "var(--green)" : "var(--red)",
                  color:"#fff", border:"none", borderRadius:10, padding:"12px", fontSize:15, fontWeight:700, cursor:"pointer",
                  opacity: trading || !tradeUnits ? 0.5 : 1 }}
                onClick={executeTrade} disabled={trading || !tradeUnits}>
                {trading ? "Executing..." : `${tradeType} ${tradeUnits || "0"} units`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
