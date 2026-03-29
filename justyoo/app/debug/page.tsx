"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DebugPage() {
  const [userId, setUserId] = useState("");
  const [storedUserId, setStoredUserId] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('kuberaa_userId');
    setStoredUserId(stored || "Not set");
    
    // Fetch all users from database
    fetch('/api/kuberaa/debug/users')
      .then(r => r.json())
      .then(data => setUsers(data.users || []))
      .catch(() => {});
  }, []);

  function setUserIdManually() {
    if (userId.trim()) {
      localStorage.setItem('kuberaa_userId', userId.trim());
      setStoredUserId(userId.trim());
      alert('UserId set successfully!');
    }
  }

  function clearUserId() {
    localStorage.removeItem('kuberaa_userId');
    localStorage.removeItem('kuberaa_portfolioId');
    setStoredUserId("Not set");
    alert('UserId cleared!');
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>🔧 Debug Panel</h1>
      
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Current Session</h2>
        <div style={{ padding: 16, background: "var(--bg-elevated)", borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Stored UserId:</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: storedUserId === "Not set" ? "var(--red)" : "var(--green)" }}>
            {storedUserId}
          </div>
        </div>
        
        <button className="btn-ghost" onClick={clearUserId} style={{ marginBottom: 16 }}>
          Clear Session
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Set UserId Manually</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
          Use this to set a userId from the database if you already completed onboarding.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input 
            className="input" 
            placeholder="Enter userId" 
            value={userId}
            onChange={e => setUserId(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={setUserIdManually}>
            Set UserId
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Users in Database</h2>
        {users.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            No users found. Complete onboarding to create a user.
          </p>
        ) : (
          <div>
            {users.map((user: any) => (
              <div key={user.id} style={{ 
                padding: 16, 
                marginBottom: 10, 
                background: "var(--bg-elevated)", 
                borderRadius: 10,
                border: user.id === storedUserId ? "2px solid var(--gold-300)" : "1px solid var(--border)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{user.id}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
                  </div>
                  <button 
                    className="btn-ghost" 
                    style={{ padding: "6px 14px", fontSize: 12 }}
                    onClick={() => {
                      localStorage.setItem('kuberaa_userId', user.id);
                      setStoredUserId(user.id);
                      setUserId(user.id);
                      alert('UserId set to: ' + user.id);
                    }}
                  >
                    Use This User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => router.push('/onboarding')}>
            Go to Onboarding
          </button>
          <button className="btn-ghost" onClick={() => router.push('/portfolio/build')}>
            Go to Portfolio Builder
          </button>
          <button className="btn-ghost" onClick={() => router.push('/kuberaa/etfs')}>
            Go to ETF Selection
          </button>
          <button className="btn-ghost" onClick={() => router.push('/kuberaa/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
