"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ETF {
  ticker: string;
  name: string;
  assetClass: string;
  subCategory: string;
  historicalAnnualReturn: number;
  historicalVolatility: number;
  expenseRatio: number;
  esgEligible: boolean;
  minimumInvestment: number;
  selectionScore?: number;
  suggested?: boolean;
  weight?: number;
}

interface SuggestedPortfolio {
  etfs: ETF[];
  totalExpectedReturn: number;
  totalVolatility: number;
  sharpeRatio: number;
}

const CLASS_COLORS: Record<string, string> = {
  Equities: "#f9c846",
  Bonds:    "#3b82f6",
  "Real Estate": "#10b981",
  Commodities:   "#8b5cf6",
  Cash:     "#6b7280",
};

export default function ETFSelectionPage() {
  const [suggested, setSuggested]   = useState<SuggestedPortfolio | null>(null);
  const [allETFs, setAllETFs]       = useState<ETF[]>([]);
  const [selected, setSelected]     = useState<Map<string, number>>(new Map());
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [creating, setCreating]     = useState(false);
  const [createError, setCreateError] = useState("");
  const [search, setSearch]         = useState("");
  const [showAll, setShowAll]       = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/kuberaa/etfs/suggest`).then(r => r.json()),
      fetch("/api/kuberaa/etfs").then(r => r.json()),
    ]).then(([sugg, etfList]) => {
      if (sugg.error) { setError(sugg.error); setLoading(false); return; }
      setSuggested(sugg);
      const initialSelected = new Map<string, number>();
      (sugg.etfs as ETF[]).forEach((e: ETF) => initialSelected.set(e.ticker, e.weight ?? 0));
      setSelected(initialSelected);
      setAllETFs(Array.isArray(etfList) ? etfList : []);
      setLoading(false);
    }).catch(() => { setError("Failed to load ETFs"); setLoading(false); });
  }, []);

  function toggleETF(etf: ETF) {
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(etf.ticker)) {
        next.delete(etf.ticker);
      } else {
        next.set(etf.ticker, 0);
      }
      return next;
    });
  }

  function setWeight(ticker: string, w: number) {
    setSelected(prev => { const next = new Map(prev); next.set(ticker, Math.max(0, Math.min(100, w))); return next; });
  }

  const totalWeight = Array.from(selected.values()).reduce((a, b) => a + b, 0);

  async function createPortfolio() {
    setCreating(true); setCreateError("");

    // Fetch current prices for selected ETFs
    const selectedTickers = Array.from(selected.keys());
    const etfsWithPrices = await Promise.all(
      selectedTickers.map(async (ticker) => {
        const etf = [...(suggested?.etfs ?? []), ...allETFs].find(e => e.ticker === ticker);
        return {
          ticker,
          weight: selected.get(ticker) ?? 0,
          // Use a mock price for now (in production, fetch from price API)
          currentPrice: 100, // Mock price
        };
      })
    );

    const holdings = etfsWithPrices.map(({ ticker, weight, currentPrice }) => ({
      ticker,
      absoluteWeight: weight / 100, // Convert percentage to decimal
      currentPrice,
    }));

    try {
      const res = await fetch("/api/kuberaa/portfolio/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create portfolio");
      
      window.location.href = "/kuberaa/dashboard";
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Something went wrong");
      setCreating(false);
    }
  }

  const filteredAll = allETFs.filter(e =>
    !selected.has(e.ticker) &&
    (e.ticker.toLowerCase().includes(search.toLowerCase()) ||
     e.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div style={{ maxWidth:1100 }}>
      <div className="skeleton" style={{ height:40, width:320, marginBottom:40 }} />
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:90, borderRadius:16, marginBottom:12 }} />)}
    </div>
  );

  if (error) return (
    <div style={{ textAlign:"center", paddingTop:80 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>💼</div>
      <h2 style={{ marginBottom:8 }}>ETFs Not Available</h2>
      <p style={{ color:"var(--text-secondary)", marginBottom:24 }}>{error}</p>
      <Link href="/kuberaa/allocation" className="btn-primary">← Back to Allocation</Link>
    </div>
  );

  const groupedSelected = (() => {
    const groups: Record<string, ETF[]> = {};
    (suggested?.etfs ?? []).forEach(e => {
      if (selected.has(e.ticker)) {
        if (!groups[e.assetClass]) groups[e.assetClass] = [];
        groups[e.assetClass].push(e);
      }
    });
    return groups;
  })();

  return (
    <div className="fade-in" style={{ maxWidth:1100 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40 }}>
        <div>
          <h1 style={{ fontSize:32, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", marginBottom:6 }}>
            ETF Selection
          </h1>
          <p style={{ color:"var(--text-secondary)" }}>
            System-ranked picks for your risk profile. Remove, add, or adjust weights — then confirm your portfolio.
          </p>
        </div>
        <Link href="/kuberaa/allocation" className="btn-ghost">← Back to Allocation</Link>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24, alignItems:"start" }}>
        {/* Left: ETF list */}
        <div>
          {/* Suggested */}
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:16, color:"var(--text-gold)" }}>⭐ System Suggestions</h3>
              <span className="badge badge-gold">{selected.size} selected</span>
            </div>

            {(suggested?.etfs ?? []).map(etf => {
              const isSelected = selected.has(etf.ticker);
              const weight = selected.get(etf.ticker) ?? 0;
              const clr = CLASS_COLORS[etf.assetClass] ?? "#6b7280";
              return (
                <div key={etf.ticker} style={{
                  padding:"16px", marginBottom:10, borderRadius:12,
                  border:`1px solid ${isSelected ? clr+"40" : "var(--border)"}`,
                  background: isSelected ? `${clr}08` : "var(--bg-elevated)",
                  transition:"all 0.2s ease",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    {/* Checkbox */}
                    <input type="checkbox" className="checkbox-gold" checked={isSelected}
                      onChange={() => toggleETF(etf)}
                      style={{ flexShrink:0 }} />

                    {/* Ticker badge */}
                    <div style={{
                      width:56, height:36, borderRadius:8, flexShrink:0,
                      background:`${clr}18`, border:`1px solid ${clr}30`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontWeight:800, fontSize:12, color:clr, fontFamily:"'Space Grotesk',sans-serif",
                    }}>{etf.ticker}</div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {etf.name}
                      </div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontSize:11, color:clr, fontWeight:600 }}>{etf.assetClass}</span>
                        <span style={{ fontSize:11, color:"var(--text-muted)" }}>· {etf.subCategory}</span>
                        {etf.esgEligible && <span className="badge badge-green" style={{ fontSize:10, padding:"2px 7px" }}>ESG</span>}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div style={{ display:"flex", gap:20, flexShrink:0 }}>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"var(--green)" }}>{(etf.historicalAnnualReturn * 100).toFixed(1)}%</div>
                        <div style={{ fontSize:10, color:"var(--text-muted)" }}>Hist. Return</div>
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"var(--red)" }}>±{(etf.historicalVolatility * 100).toFixed(1)}%</div>
                        <div style={{ fontSize:10, color:"var(--text-muted)" }}>Volatility</div>
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"var(--text-secondary)" }}>{(etf.expenseRatio * 100).toFixed(2)}%</div>
                        <div style={{ fontSize:10, color:"var(--text-muted)" }}>Expense</div>
                      </div>
                    </div>
                  </div>

                  {/* Weight slider (only if selected) */}
                  {isSelected && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                        <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:600 }}>Portfolio Weight</span>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <input type="number" min={0} max={100} value={weight}
                            onChange={e => setWeight(etf.ticker, parseInt(e.target.value) || 0)}
                            style={{ width:60, textAlign:"center", fontSize:14, fontWeight:700, color:clr,
                              background:"var(--bg-card)", border:`1px solid ${clr}40`, borderRadius:8, padding:"4px 8px", outline:"none" }} />
                          <span style={{ fontSize:13, color:"var(--text-muted)" }}>%</span>
                        </div>
                      </div>
                      <input type="range" min={0} max={100} value={weight}
                        onChange={e => setWeight(etf.ticker, parseInt(e.target.value))} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add from master list */}
          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ fontSize:16, color:"var(--text-secondary)" }}>All ETFs — Master List</h3>
              <button className="btn-ghost" style={{ padding:"6px 14px", fontSize:12 }}
                onClick={() => setShowAll(p => !p)}>
                {showAll ? "Hide" : "Show"} Master List
              </button>
            </div>
            {showAll && (
              <>
                <input className="input" placeholder="Search by ticker or name..." value={search}
                  onChange={e => setSearch(e.target.value)} style={{ marginBottom:16 }} />
                <div style={{ maxHeight:360, overflowY:"auto" }}>
                  {filteredAll.slice(0, 30).map(etf => {
                    const clr = CLASS_COLORS[etf.assetClass] ?? "#6b7280";
                    return (
                      <div key={etf.ticker} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
                        <div style={{ width:50, height:30, borderRadius:6, background:`${clr}18`, border:`1px solid ${clr}30`,
                          display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11, color:clr }}>
                          {etf.ticker}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{etf.name}</div>
                          <div style={{ fontSize:11, color:"var(--text-muted)" }}>{etf.assetClass} · {etf.subCategory}</div>
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--green)", marginRight:8 }}>{(etf.historicalAnnualReturn*100).toFixed(1)}%</div>
                        <button className="btn-ghost" style={{ padding:"5px 14px", fontSize:12 }} onClick={() => toggleETF(etf)}>Add</button>
                      </div>
                    );
                  })}
                  {filteredAll.length === 0 && <p style={{ color:"var(--text-muted)", fontSize:13, padding:"12px 0" }}>No ETFs match your search.</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Summary panel */}
        <div style={{ position:"sticky", top:24 }}>
          <div className="card" style={{ marginBottom:16 }}>
            <h3 style={{ fontSize:15, marginBottom:16, color:"var(--text-gold)" }}>📋 Portfolio Summary</h3>

            {/* Metrics */}
            {suggested && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                <div className="card-elevated" style={{ padding:"12px" }}>
                  <div style={{ fontSize:10, color:"var(--text-muted)", fontWeight:600, marginBottom:4 }}>EXP. RETURN</div>
                  <div style={{ fontSize:20, fontWeight:800, color:"var(--green)" }}>{(suggested.totalExpectedReturn*100).toFixed(1)}%</div>
                </div>
                <div className="card-elevated" style={{ padding:"12px" }}>
                  <div style={{ fontSize:10, color:"var(--text-muted)", fontWeight:600, marginBottom:4 }}>VOLATILITY</div>
                  <div style={{ fontSize:20, fontWeight:800, color:"var(--red)" }}>±{(suggested.totalVolatility*100).toFixed(1)}%</div>
                </div>
                <div className="card-elevated" style={{ padding:"12px", gridColumn:"span 2" }}>
                  <div style={{ fontSize:10, color:"var(--text-muted)", fontWeight:600, marginBottom:4 }}>SHARPE RATIO</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ fontSize:20, fontWeight:800, color:
                      suggested.sharpeRatio < 1 ? "var(--red)" : suggested.sharpeRatio < 2 ? "var(--gold-300)" : "var(--green)" }}>
                      {suggested.sharpeRatio.toFixed(2)}
                    </div>
                    <span className={`badge ${suggested.sharpeRatio < 1 ? "badge-red" : suggested.sharpeRatio < 2 ? "badge-gold" : "badge-green"}`}>
                      {suggested.sharpeRatio < 1 ? "Below avg" : suggested.sharpeRatio < 2 ? "Good" : "Excellent"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Weight total */}
            <div style={{ padding:"12px 16px", borderRadius:10, marginBottom:16,
              background: Math.abs(totalWeight - 100) < 1 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border:`1px solid ${Math.abs(totalWeight - 100) < 1 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"var(--text-secondary)" }}>Weight Total</span>
              <span style={{ fontSize:20, fontWeight:800, color: Math.abs(totalWeight - 100) < 1 ? "var(--green)" : "var(--red)" }}>
                {totalWeight}%
              </span>
            </div>
            {Math.abs(totalWeight - 100) >= 1 && (
              <p style={{ fontSize:12, color:"var(--red)", marginBottom:12 }}>
                Weights must sum to 100%. {totalWeight > 100 ? `Reduce by ${totalWeight - 100}%` : `Add ${100 - totalWeight}% more`}.
              </p>
            )}

            {/* Holdings summary */}
            <div style={{ marginBottom:16 }}>
              {Array.from(selected.entries()).map(([ticker, w]) => (
                <div key={ticker} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", fontSize:13 }}>
                  <span style={{ fontWeight:600 }}>{ticker}</span>
                  <span style={{ color:"var(--text-gold)", fontWeight:700 }}>{w}%</span>
                </div>
              ))}
              {selected.size === 0 && <p style={{ fontSize:13, color:"var(--text-muted)" }}>No ETFs selected.</p>}
            </div>

            {createError && (
              <div style={{ padding:"10px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, fontSize:13, color:"var(--red)", marginBottom:12 }}>
                {createError}
              </div>
            )}

            <button className="btn-primary" style={{ width:"100%" }}
              onClick={createPortfolio}
              disabled={creating || selected.size === 0 || Math.abs(totalWeight - 100) >= 1}>
              {creating ? "Creating Portfolio..." : "✅ Confirm & Create Portfolio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
