"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.message || "Invalid secret key. Please try again.");
      }
      router.push("/admin");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, margin: 0, background: "#f8faff" }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: "48px 40px", textAlign: "center" }}>
        <div style={{ marginBottom: 32 }}>
          <img src="/logo.jpeg" alt="IGHub Logo" style={{ height: 64, width: "auto", margin: "0 auto 24px", borderRadius: 12, display: "block" }} />
          <h1 className="title" style={{ fontSize: "2.2rem", animation: "none", color: "#003388" }}>Admin Portal</h1>
          <p className="subtitle" style={{ margin: "8px auto 0", fontSize: "1rem" }}>Sign in to manage KCC registrations</p>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 20, textAlign: "left" }}>
          <div className="form-field">
            <label className="label">Admin Secret Key</label>
            <input 
              className="input" 
              type="password"
              placeholder="••••••••••••"
              value={secret} 
              onChange={(e) => setSecret(e.target.value)} 
              required 
              autoFocus
            />
          </div>
          
          <button className="button" type="submit" disabled={loading} style={{ marginTop: 8, padding: 16 }}>
            {loading ? "Authenticating..." : "Sign in securely"}
          </button>
          
          {error && (
            <div className="alert" style={{ background: "rgba(255, 60, 60, 0.05)", borderColor: "rgba(255, 60, 60, 0.2)", padding: 16, marginTop: 8 }}>
              <p style={{ margin: 0, color: "#d63031", fontSize: "0.95rem", textAlign: "center", fontWeight: 600 }}>{error}</p>
            </div>
          )}
        </form>
        
        <div style={{ marginTop: 36 }}>
          <a href="/" style={{ color: "#6b7280", fontSize: "0.95rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = '#003388'} onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to website
          </a>
        </div>
      </div>
    </main>
  );
}
