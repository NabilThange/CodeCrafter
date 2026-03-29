"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TradePlan {
  etfTicker: string;
  action: "BUY" | "SELL";
  amount: number;
  units: number;
  currentWeight: number;
  targetWeight: number;
  drift: number;
}

interface RebalancePlan {
  portfolioId: string;
  totalValue: number;
  needsRebalancing: boolean;
  threshold: number;
  trades: TradePlan[];
  logId?: string;
}

export default function RebalancePage() {
  const [plan, setPlan]           = useState<RebalancePlan | null>(null);
  const [loading, setLoading]     = useState(true);
  const [approving, setApproving] = useState(false);
  const [msg, setMsg]             = useState("");
  const [error, setError]         = useState("");
  const [selected, setSelected]   = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/kuberaa/rebalance/check")
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setPlan(d);
        // Pre-select all trades that need rebalancing
        const tickers: string[] = d.trades.filter((t: TradePlan) => Math.abs(t.drift) > (d.threshold ?? 0.05)).map((t: TradePlan) => t.etfTicker);
        const sel = new Set<string>(tickers);
        setSelected(sel);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load rebalancing data"); setLoading(false); });
  }, []);

  function toggleTrade(ticker: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker); else next.add(ticker);
      return next;
    });
  }

  async function approvePlan() {
    if (!plan) return;
    setApproving(true); setMsg("");
    const approvedTrades = plan.trades.filter(t => selected.has(t.etfTicker));
    try {
      const res = await fetch("/api/kuberaa/rebalance/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId: plan.logId, trades: approvedTrades }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to approve");
      setMsg(`✓ Rebalancing complete. Executed ${approvedTrades.length} trades.`);
      // Re-check after approval
      setTimeout(() => { window.location.href = "/kuberaa/dashboard"; }, 2000);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Approval failed");
    }
    setApproving(false);
  }

  if (loading) return (
    <div style={{ maxWidth:900 }}>
      <div className="skeleton" style={{ height:40, width:320, marginBottom:40 }} />
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:100, borderRadius:16, marginBottom:12 }} />)}
    </div>
  );

  if (error) return (
    <div style={{ textAlign:"center", paddingTop:80 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>⚖️</div>
      <h2 style={{ marginBottom:8 }}>Rebalancing Unavailable</h2>
      <p style={{ color:"var(--text-secondary)", marginBottom:24 }}>{error}</p>
      <Link href="/kuberaa/dashboard" className="btn-ghost">← Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40 }}>
        <div>
          <h1 style={{ fontSize:32, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", marginBottom:6 }}>Portfolio Rebalancing</h1>
          <p style={{ color:"var(--text-secondary)" }}>
            Drift threshold: <strong style={{ color:"var(--text-gold)" }}>{((plan?.threshold ?? 0.05) * 100).toFixed(0)}%</strong>
            {" · "}Portfolio value: <strong style={{ color:"var(--text-gold)" }}>${plan?.totalValue?.toLocaleString()}</strong>
          </p>
        </div>
        <Link href="/kuberaa/dashboard" className="btn-ghost">← Dashboard</Link>
      </div>

      {/* Status banner */}
      {plan && (
        <div style={{
          marginBottom:24, padding:"20px 24px", borderRadius:16,
          background: plan.needsRebalancing ? "rgba(249,200,70,0.06)" : "rgba(34,197,94,0.06)",
          border: `1px solid ${plan.needsRebalancing ? "rgba(249,200,70,0.25)" : "rgba(34,197,94,0.25)"}`,
          display:"flex", alignItems:"center", gap:16,
        }}>
          <div style={{ fontSize:36 }}>{plan.needsRebalancing ? "⚠️" : "✅"}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:18, marginBottom:4, color: plan.needsRebalancing ? "var(--text-gold)" : "var(--green)" }}>
              {plan.needsRebalancing ? "Rebalancing Recommended" : "Portfolio is Balanced"}
            </div>
            <div style={{ fontSize:14, color:"var(--text-secondary)" }}>
              {plan.needsRebalancing
                ? `${plan.trades.filter(t => Math.abs(t.drift) > (plan.threshold ?? 0.05)).length} position(s) have drifted beyond the ${((plan.threshold ?? 0.05)*100).toFixed(0)}% threshold.`
                : "All positions are within acceptable drift limits. No action required."}
            </div>
          </div>
        </div>
      )}

      {plan && plan.trades.length > 0 ? (
        <>
          {/* Trades table */}
          <div className="card" style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:16, color:"var(--text-gold)" }}>📋 Proposed Trades</h3>
              <div style={{ fontSize:13, color:"var(--text-muted)" }}>
                Select which trades to approve. <strong>Sells execute before Buys.</strong>
              </div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width:40 }}></th>
                    <th>ETF</th>
                    <th>Action</th>
                    <th>Drift</th>
                    <th>Current Weight</th>
                    <th>Target Weight</th>
                    <th>Trade Amount</th>
                    <th>Units</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.trades.map(trade => {
                    const isBuy   = trade.action === "BUY";
                    const drift   = trade.drift;
                    const needsIt = Math.abs(drift) > (plan.threshold ?? 0.05);
                    const isSelected = selected.has(trade.etfTicker);
                    return (
                      <tr key={trade.etfTicker} style={{ opacity: needsIt ? 1 : 0.5 }}>
                        <td>
                          <input type="checkbox" className="checkbox-gold" checked={isSelected}
                            onChange={() => toggleTrade(trade.etfTicker)}
                            disabled={!needsIt} />
                        </td>
                        <td>
                          <div style={{ fontWeight:700, color:"var(--text-gold)" }}>{trade.etfTicker}</div>
                        </td>
                        <td>
                          <span className={`badge ${isBuy ? "badge-green" : "badge-red"}`}>
                            {isBuy ? "▼ BUY" : "▲ SELL"}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight:600, color: Math.abs(drift) > (plan.threshold ?? 0.05) ? (drift > 0 ? "var(--red)" : "var(--green)") : "var(--text-muted)" }}>
                            {drift > 0 ? "+" : ""}{(drift * 100).toFixed(2)}%
                          </span>
                        </td>
                        <td>{(trade.currentWeight * 100).toFixed(2)}%</td>
                        <td>{(trade.targetWeight * 100).toFixed(2)}%</td>
                        <td style={{ fontWeight:600 }}>${trade.amount.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}</td>
                        <td>{trade.units.toFixed(4)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary + Approve */}
          <div className="card">
            <h3 style={{ fontSize:16, marginBottom:16, color:"var(--text-gold)" }}>✅ Approval Summary</h3>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
              <div className="card-elevated" style={{ padding:"14px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:4 }}>SELECTED TRADES</div>
                <div style={{ fontSize:24, fontWeight:800, color:"var(--text-gold)" }}>{selected.size}</div>
              </div>
              <div className="card-elevated" style={{ padding:"14px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:4 }}>TOTAL SELL VALUE</div>
                <div style={{ fontSize:24, fontWeight:800, color:"var(--red)" }}>
                  ${plan.trades.filter(t => t.action === "SELL" && selected.has(t.etfTicker))
                    .reduce((s, t) => s + t.amount, 0)
                    .toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}
                </div>
              </div>
              <div className="card-elevated" style={{ padding:"14px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:4 }}>TOTAL BUY VALUE</div>
                <div style={{ fontSize:24, fontWeight:800, color:"var(--green)" }}>
                  ${plan.trades.filter(t => t.action === "BUY" && selected.has(t.etfTicker))
                    .reduce((s, t) => s + t.amount, 0)
                    .toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}
                </div>
              </div>
            </div>

            <div style={{ padding:"14px 16px", background:"rgba(249,200,70,0.04)", border:"1px solid var(--border)", borderRadius:10, marginBottom:20, fontSize:13, color:"var(--text-secondary)", lineHeight:1.7 }}>
              <strong>⚠️ Important:</strong> Rebalancing trades execute as paper trades only. 
              Sells will execute first to free up virtual cash, then Buys. You can approve individual trades or all at once.
              This action cannot be undone.
            </div>

            {msg && (
              <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, fontSize:14,
                background: msg.startsWith("✓") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border:     `1px solid ${msg.startsWith("✓") ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                color:      msg.startsWith("✓") ? "var(--green)" : "var(--red)" }}>
                {msg}
              </div>
            )}

            <div style={{ display:"flex", gap:12 }}>
              <button className="btn-primary" onClick={approvePlan}
                disabled={approving || selected.size === 0}>
                {approving ? "Executing trades..." : `Approve ${selected.size} Trade${selected.size !== 1 ? "s" : ""}`}
              </button>
              <button className="btn-ghost" onClick={() => setSelected(new Set())}>Deselect All</button>
              <button className="btn-ghost"
                onClick={() => setSelected(new Set(plan.trades.filter(t => Math.abs(t.drift) > (plan.threshold ?? 0.05)).map(t => t.etfTicker)))}>
                Select All Flagged
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign:"center", padding:"60px 40px" }}>
          <div style={{ fontSize:64, marginBottom:16 }}>⚖️</div>
          <h3 style={{ marginBottom:8 }}>Everything is Balanced</h3>
          <p style={{ color:"var(--text-secondary)", marginBottom:24 }}>
            No positions have drifted beyond your {((plan?.threshold ?? 0.05)*100).toFixed(0)}% threshold. Check back after market movements.
          </p>
          <Link href="/kuberaa/dashboard" className="btn-primary">Return to Dashboard</Link>
        </div>
      )}
    </div>
  );
}
