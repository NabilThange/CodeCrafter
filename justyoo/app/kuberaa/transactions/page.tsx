"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  etfTicker: string;
  type: "BUY" | "SELL";
  units: number;
  price: number;
  totalValue: number;
  reason: "MANUAL" | "REBALANCE" | "INITIAL";
  createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
  MANUAL:    "Manual Trade",
  REBALANCE: "Rebalancing",
  INITIAL:   "Portfolio Creation",
};

const REASON_COLORS: Record<string, string> = {
  MANUAL:    "badge-blue",
  REBALANCE: "badge-gold",
  INITIAL:   "badge-muted",
};

export default function TransactionsPage() {
  const [txns, setTxns]       = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    fetch("/api/kuberaa/transactions")
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); }
        else { setTxns(Array.isArray(d) ? d : []); }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load transactions"); setLoading(false); });
  }, []);

  const filtered = txns.filter(t => {
    if (filter !== "ALL" && t.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.etfTicker.toLowerCase().includes(q) || t.reason.toLowerCase().includes(q);
    }
    return true;
  });

  // Summary stats
  const totalBuys    = txns.filter(t => t.type === "BUY").reduce((s, t) => s + t.totalValue, 0);
  const totalSells   = txns.filter(t => t.type === "SELL").reduce((s, t) => s + t.totalValue, 0);
  const totalTrades  = txns.length;

  if (loading) return (
    <div style={{ maxWidth:960 }}>
      <div className="skeleton" style={{ height:40, width:280, marginBottom:32 }} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:100, borderRadius:16 }} />)}
      </div>
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height:64, borderRadius:12, marginBottom:8 }} />)}
    </div>
  );

  if (error) return (
    <div style={{ textAlign:"center", paddingTop:80 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
      <h2 style={{ marginBottom:8 }}>No Transactions</h2>
      <p style={{ color:"var(--text-secondary)", marginBottom:24 }}>{error}</p>
      <Link href="/kuberaa/dashboard" className="btn-ghost">← Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth:960 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40 }}>
        <div>
          <h1 style={{ fontSize:32, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", marginBottom:6 }}>
            Transaction History
          </h1>
          <p style={{ color:"var(--text-secondary)" }}>
            Complete log of all paper trades — initial, manual, and rebalancing.
          </p>
        </div>
        <Link href="/kuberaa/dashboard" className="btn-ghost">← Dashboard</Link>
      </div>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
        <div className="card">
          <div className="stat-label">Total Trades</div>
          <div className="stat-value">{totalTrades}</div>
          <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}>all time</div>
        </div>
        <div className="card">
          <div className="stat-label">Total Bought</div>
          <div className="stat-value" style={{ color:"var(--green)" }}>
            ${totalBuys.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}
          </div>
          <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}>
            {txns.filter(t => t.type === "BUY").length} buy orders
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Total Sold</div>
          <div className="stat-value" style={{ color:"var(--red)" }}>
            ${totalSells.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}
          </div>
          <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}>
            {txns.filter(t => t.type === "SELL").length} sell orders
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:20, alignItems:"center" }}>
        <input className="input" style={{ maxWidth:280 }}
          placeholder="Search by ticker or type..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display:"flex", background:"var(--bg-elevated)", borderRadius:10, padding:4, border:"1px solid var(--border)" }}>
          {(["ALL","BUY","SELL"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:"7px 18px", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:13, fontWeight:600, transition:"all 0.15s",
                background: filter === f ? (f === "BUY" ? "var(--green)" : f === "SELL" ? "var(--red)" : "var(--gold-300)") : "transparent",
                color:      filter === f ? (f === "ALL" ? "#0d0a00" : "#fff") : "var(--text-secondary)",
              }}>{f}</button>
          ))}
        </div>
        <span style={{ fontSize:13, color:"var(--text-muted)", marginLeft:"auto" }}>
          {filtered.length} of {totalTrades} transactions
        </span>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft:24 }}>Date & Time</th>
                <th>ETF</th>
                <th>Type</th>
                <th>Units</th>
                <th>Price / Unit</th>
                <th>Total Value</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(txn => {
                const isBuy  = txn.type === "BUY";
                const date   = new Date(txn.createdAt);
                return (
                  <tr key={txn.id}>
                    <td style={{ paddingLeft:24 }}>
                      <div style={{ fontWeight:500, fontSize:14 }}>
                        {date.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                      </div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>
                        {date.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight:700, color:"var(--text-gold)", fontSize:15 }}>
                        {txn.etfTicker}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isBuy ? "badge-green" : "badge-red"}`}>
                        {isBuy ? "▼ BUY" : "▲ SELL"}
                      </span>
                    </td>
                    <td style={{ fontWeight:600 }}>
                      {parseFloat(txn.units.toString()).toFixed(4)}
                    </td>
                    <td>
                      ${parseFloat(txn.price.toString()).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}
                    </td>
                    <td style={{ fontWeight:700, fontSize:15, color: isBuy ? "var(--red)" : "var(--green)" }}>
                      {isBuy ? "−" : "+"}$
                      {parseFloat(txn.totalValue.toString()).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}
                    </td>
                    <td>
                      <span className={`badge ${REASON_COLORS[txn.reason] ?? "badge-muted"}`}>
                        {REASON_LABELS[txn.reason] ?? txn.reason}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign:"center", padding:"60px 40px" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
          <h3 style={{ marginBottom:8 }}>No transactions found</h3>
          <p style={{ color:"var(--text-secondary)", marginBottom:24 }}>
            {search || filter !== "ALL"
              ? "Try adjusting your search or filter."
              : "Create your portfolio to see your first transactions here."}
          </p>
          {!search && filter === "ALL" && (
            <Link href="/kuberaa/etfs" className="btn-primary">Create Portfolio →</Link>
          )}
        </div>
      )}
    </div>
  );
}
