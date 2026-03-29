export default function GlobalLoading() {
  return (
    <div style={{
      minHeight: "calc(100vh - 60px)", padding: "40px 32px",
      maxWidth: 1200, margin: "0 auto",
    }}>
      {/* Summary bar skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {[180, 160, 140, 160].map((w, i) => (
          <div key={i} className="card" style={{ padding: "20px 24px" }}>
            <div className="skeleton" style={{ height: 12, width: w * 0.6, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 28, width: w, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 10, width: w * 0.5 }} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="skeleton" style={{ height: 16, width: 200, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 260, borderRadius: 12 }} />
        </div>
        <div className="card">
          <div className="skeleton" style={{ height: 16, width: 140, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 260, borderRadius: "50%", width: 260, margin: "0 auto" }} />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div className="skeleton" style={{ height: 16, width: 120 }} />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr 1fr 1fr",
            gap: 16, padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.03)",
            alignItems: "center",
          }}>
            <div>
              <div className="skeleton" style={{ height: 14, width: 50, marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 11, width: 120 }} />
            </div>
            {[60, 70, 70, 80, 50, 80].map((w, j) => (
              <div key={j} className="skeleton" style={{ height: 14, width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
