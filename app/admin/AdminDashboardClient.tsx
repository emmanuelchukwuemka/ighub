"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Registration = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: number;
  location: string;
  course: string;
  referralCode: string | null;
  referredBy: string | null;
  paid: boolean;
  createdAt: Date;
};

export default function AdminDashboardClient({ 
  initialRegistrations, 
  totalRegs, 
  paidRegs, 
  pendingRegs, 
  totalRevenue,
  initialCampDate
}: { 
  initialRegistrations: Registration[],
  totalRegs: number,
  paidRegs: number,
  pendingRegs: number,
  totalRevenue: number,
  initialCampDate: string
}) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [tab, setTab] = useState<"registrations" | "referrals" | "settings">("registrations");
  
  // Settings
  const [campDate, setCampDate] = useState(initialCampDate.slice(0, 16)); // Format for datetime-local
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Edit Modal
  const [editingReg, setEditingReg] = useState<Registration | null>(null);

  // Derived filtered data
  const filteredData = registrations.filter(reg => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      reg.firstName.toLowerCase().includes(searchLower) ||
      reg.lastName.toLowerCase().includes(searchLower) ||
      reg.email.toLowerCase().includes(searchLower) ||
      reg.phone.includes(searchLower) ||
      reg.childName.toLowerCase().includes(searchLower);
      
    const matchesStatus = statusFilter === "all" ? true : statusFilter === "paid" ? reg.paid : !reg.paid;
    const matchesLocation = locationFilter === "all" ? true : reg.location === locationFilter;
    const matchesCourse = courseFilter === "all" ? true : reg.course === courseFilter;
    
    return matchesSearch && matchesStatus && matchesLocation && matchesCourse;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Referral Processing
  const referralsLeaderboard = Object.entries(
    registrations.reduce((acc, reg) => {
      if (reg.referredBy) {
        if (!acc[reg.referredBy]) acc[reg.referredBy] = { total: 0, paid: 0 };
        acc[reg.referredBy].total += 1;
        if (reg.paid) acc[reg.referredBy].paid += 1;
      }
      return acc;
    }, {} as Record<string, { total: number, paid: number }>)
  ).sort((a, b) => b[1].total - a[1].total);

  // Actions
  const togglePaidStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/registration/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: !currentStatus })
      });
      if (res.ok) {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, paid: !currentStatus } : r));
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteRegistration = async (id: number) => {
    if (!confirm("Are you sure you want to delete this registration? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/registration/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRegistrations(prev => prev.filter(r => r.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;
    try {
      const res = await fetch(`/api/admin/registration/${editingReg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingReg)
      });
      if (res.ok) {
        setRegistrations(prev => prev.map(r => r.id === editingReg.id ? editingReg : r));
        setEditingReg(null);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campDate: new Date(campDate).toISOString() })
      });
      if (res.ok) alert("Settings saved! The countdown timer has been updated.");
    } catch (error) {
      console.error(error);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fe", color: "#2b3674", fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Sidebar */}
      <aside style={{ width: 280, background: "#ffffff", padding: "32px 24px", display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          <img src="/logo.jpeg" alt="IGHub Logo" style={{ height: 40, width: "auto", borderRadius: 8, objectFit: "contain" }} />
          <span style={{ fontWeight: 800, color: "#003388", fontSize: "1.4rem", letterSpacing: "0.5px" }}>Admin</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <button onClick={() => setTab("registrations")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: tab === "registrations" ? "#003388" : "transparent", color: tab === "registrations" ? "#ffffff" : "#a3aed1", borderRadius: 12, fontWeight: 600, border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            Registrations
          </button>
          <button onClick={() => setTab("referrals")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: tab === "referrals" ? "#003388" : "transparent", color: tab === "referrals" ? "#ffffff" : "#a3aed1", borderRadius: 12, fontWeight: 600, border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Referrals
          </button>
          <button onClick={() => setTab("settings")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: tab === "settings" ? "#003388" : "transparent", color: tab === "settings" ? "#ffffff" : "#a3aed1", borderRadius: 12, fontWeight: 600, border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </button>
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", color: "#a3aed1", fontWeight: 600, textDecoration: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Back to Website
          </a>
          <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); router.refresh(); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", color: "#e53e3e", background: "rgba(229, 62, 62, 0.05)", borderRadius: 12, fontWeight: 600, border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 11 12 16 7"></polyline><line x1="21" y1="12" x2="11" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
        
        {/* Top Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "#2b3674" }}>Overview</h1>
            <p style={{ color: "#a3aed1", margin: "4px 0 0 0", fontWeight: 500 }}>Welcome back to the KCC Admin Portal</p>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/api/export" style={{ background: "#ffffff", border: "none", borderRadius: 999, padding: "12px 24px", color: "#003388", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", textDecoration: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export CSV
            </a>
          </div>
        </header>

        {/* Metrics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
          <div style={{ background: "#ffffff", padding: 24, borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f4f7fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#003388" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <p style={{ margin: 0, color: "#a3aed1", fontSize: "0.9rem", fontWeight: 600 }}>Total Registered</p>
                <h3 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700, color: "#2b3674" }}>{totalRegs}</h3>
              </div>
            </div>
          </div>
          
          <div style={{ background: "#ffffff", padding: 24, borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(46, 204, 113, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#27ae60" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <p style={{ margin: 0, color: "#a3aed1", fontSize: "0.9rem", fontWeight: 600 }}>Paid</p>
                <h3 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700, color: "#2b3674" }}>{paidRegs}</h3>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: 24, borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(241, 196, 15, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d4ac0d" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div>
                <p style={{ margin: 0, color: "#a3aed1", fontSize: "0.9rem", fontWeight: 600 }}>Pending</p>
                <h3 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700, color: "#2b3674" }}>{pendingRegs}</h3>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: 24, borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255, 107, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b00" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              </div>
              <div>
                <p style={{ margin: 0, color: "#a3aed1", fontSize: "0.9rem", fontWeight: 600 }}>Revenue (Est)</p>
                <h3 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700, color: "#2b3674" }}>₦{totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {tab === "registrations" ? (
          <div style={{ background: "#ffffff", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", overflow: "hidden" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
               <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#2b3674" }}>Recent Registrations</h2>
               <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   value={search} 
                   onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
                   style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid #e2e8f0", outline: "none" }} 
                 />
                 <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid #e2e8f0", outline: "none", background: "white" }}>
                   <option value="all">All Status</option>
                   <option value="paid">Paid</option>
                   <option value="pending">Pending</option>
                 </select>
                 <select value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }} style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid #e2e8f0", outline: "none", background: "white" }}>
                   <option value="all">All Locations</option>
                   <option value="Aba">Aba</option>
                   <option value="Umuahia">Umuahia</option>
                   <option value="Live Online">Live Online</option>
                 </select>
               </div>
            </div>
            
            <div style={{ overflowX: "auto", minHeight: 400 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "16px 32px", color: "#a3aed1", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid #edf2f7" }}>Date</th>
                    <th style={{ padding: "16px 32px", color: "#a3aed1", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid #edf2f7" }}>Parent Details</th>
                    <th style={{ padding: "16px 32px", color: "#a3aed1", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid #edf2f7" }}>Child Details</th>
                    <th style={{ padding: "16px 32px", color: "#a3aed1", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid #edf2f7" }}>Course & Location</th>
                    <th style={{ padding: "16px 32px", color: "#a3aed1", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid #edf2f7" }}>Status</th>
                    <th style={{ padding: "16px 32px", color: "#a3aed1", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid #edf2f7" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "64px", textAlign: "center", color: "#a3aed1", fontWeight: 500 }}>
                        No registrations found.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((reg) => (
                      <tr key={reg.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                        <td style={{ padding: "20px 32px", color: "#718096", fontSize: "0.95rem" }}>
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "20px 32px" }}>
                          <div style={{ fontWeight: 700, color: "#2b3674" }}>{reg.firstName} {reg.lastName}</div>
                          <div style={{ fontSize: "0.85rem", color: "#718096", marginTop: 4 }}>{reg.email}</div>
                          <div style={{ fontSize: "0.85rem", color: "#718096" }}>{reg.phone}</div>
                        </td>
                        <td style={{ padding: "20px 32px" }}>
                          <div style={{ fontWeight: 600, color: "#2b3674" }}>{reg.childName}</div>
                          <div style={{ fontSize: "0.85rem", color: "#ff6b00", fontWeight: 700, marginTop: 4 }}>{reg.childAge} Years Old</div>
                        </td>
                        <td style={{ padding: "20px 32px" }}>
                          <div style={{ fontWeight: 600, color: "#2b3674" }}>{reg.course}</div>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#003388", marginTop: 6, background: "rgba(0,51,136,0.05)", padding: "4px 10px", borderRadius: 999, fontWeight: 700 }}>
                            {reg.location}
                          </div>
                        </td>
                        <td style={{ padding: "20px 32px" }}>
                          {reg.paid ? (
                             <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(46, 204, 113, 0.1)", color: "#27ae60", padding: "6px 12px", borderRadius: 999, fontSize: "0.85rem", fontWeight: 700 }}>
                                PAID
                             </div>
                          ) : (
                             <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(241, 196, 15, 0.1)", color: "#d4ac0d", padding: "6px 12px", borderRadius: 999, fontSize: "0.85rem", fontWeight: 700 }}>
                                PENDING
                             </div>
                          )}
                        </td>
                        <td style={{ padding: "20px 32px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => togglePaidStatus(reg.id, reg.paid)} title="Toggle Status" style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                              {reg.paid ? "❌" : "✅"}
                            </button>
                            <button onClick={() => setEditingReg(reg)} title="Edit" style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                              ✏️
                            </button>
                            <button onClick={() => deleteRegistration(reg.id)} title="Delete" style={{ background: "transparent", border: "1px solid #ff000030", color: "red", borderRadius: 8, padding: 6, cursor: "pointer" }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ padding: "16px 32px", borderTop: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#718096", fontSize: "0.95rem" }}>Showing page {currentPage} of {totalPages}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: currentPage === 1 ? "#f7fafc" : "#ffffff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>Previous</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: currentPage === totalPages ? "#f7fafc" : "#ffffff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>Next</button>
                </div>
              </div>
            )}
          </div>
        ) : tab === "referrals" ? (
          <div style={{ background: "#ffffff", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", overflow: "hidden" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #edf2f7" }}>
               <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#2b3674" }}>Referral Leaderboard</h2>
               <p style={{ color: "#a3aed1", margin: "4px 0 0" }}>Track who is bringing in the most students</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "16px 32px", color: "#a3aed1", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid #edf2f7" }}>Referrer Name / Code</th>
                    <th style={{ padding: "16px 32px", color: "#a3aed1", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid #edf2f7" }}>Total Referrals</th>
                    <th style={{ padding: "16px 32px", color: "#a3aed1", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid #edf2f7" }}>Successfully Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {referralsLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: "64px", textAlign: "center", color: "#a3aed1", fontWeight: 500 }}>No referrals yet.</td>
                    </tr>
                  ) : (
                    referralsLeaderboard.map(([name, stats], index) => (
                      <tr key={name} style={{ borderBottom: "1px solid #edf2f7" }}>
                        <td style={{ padding: "20px 32px", fontWeight: 700, color: "#2b3674" }}>
                          {index === 0 ? "🥇 " : index === 1 ? "🥈 " : index === 2 ? "🥉 " : ""}
                          {name}
                        </td>
                        <td style={{ padding: "20px 32px", fontWeight: 600, color: "#003388" }}>{stats.total}</td>
                        <td style={{ padding: "20px 32px", fontWeight: 600, color: "#27ae60" }}>{stats.paid}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ background: "#ffffff", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", padding: 32 }}>
            <h2 style={{ margin: "0 0 24px", fontSize: "1.4rem", fontWeight: 700, color: "#2b3674" }}>System Settings</h2>
            <form onSubmit={saveSettings} style={{ maxWidth: 400 }}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#2b3674" }}>Camp Start Date (Countdown Timer)</label>
                <input 
                  type="datetime-local" 
                  value={campDate} 
                  onChange={e => setCampDate(e.target.value)} 
                  style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} 
                  required 
                />
                <p style={{ fontSize: "0.85rem", color: "#a3aed1", marginTop: 8 }}>This controls the countdown timer on the main landing page.</p>
              </div>
              <button type="submit" disabled={savingSettings} style={{ padding: "12px 24px", background: "#003388", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", width: "100%" }}>
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Edit Modal */}
      {editingReg && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#ffffff", padding: 32, borderRadius: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 24px", color: "#003388" }}>Edit Registration</h2>
            <form onSubmit={handleEditSubmit} style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.9rem" }}>Parent First Name</label>
                <input type="text" value={editingReg.firstName} onChange={e => setEditingReg({...editingReg, firstName: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.9rem" }}>Parent Last Name</label>
                <input type="text" value={editingReg.lastName} onChange={e => setEditingReg({...editingReg, lastName: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.9rem" }}>Email</label>
                <input type="email" value={editingReg.email} onChange={e => setEditingReg({...editingReg, email: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.9rem" }}>Child Name</label>
                <input type="text" value={editingReg.childName} onChange={e => setEditingReg({...editingReg, childName: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} required />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                <button type="button" onClick={() => setEditingReg(null)} style={{ flex: 1, padding: 12, background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, background: "#003388", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
