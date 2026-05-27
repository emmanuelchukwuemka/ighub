"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const courses = [
  {
    name: "Scratch Programming",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
  },
  {
    name: "AI Development for Kids",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>
  },
  {
    name: "Digital Literacy",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
  },
  {
    name: "Graphics Design (Beginner/Advanced)",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
  },
  {
    name: "Python Programming",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
  },
  {
    name: "Cyber Security for Kids",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
  },
  {
    name: "Video Editing",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
  },
  {
    name: "Elementary Data Analysis",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
  }
];

const courseNames = courses.map(c => c.name);
const locations = ["Aba", "Umuahia", "Live Online"];

function formatCountdown(time: number) {
  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const seconds = Math.floor((time / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState<{days:number, hours:number, minutes:number, seconds:number} | null>(null);
  
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    childName: "",
    childAge: "",
    location: "Aba",
    course: "Scratch Programming",
    referralCode: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const target = new Date("2026-08-01T09:00:00");
    const timer = setInterval(() => {
      const diff = target.getTime() - new Date().getTime();
      if (diff > 0) {
        setTimeLeft(formatCountdown(diff));
      } else {
        setTimeLeft({days:0,hours:0,minutes:0,seconds:0});
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          childAge: Number(formState.childAge),
          amount: 50000,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Unable to submit registration");
      }

      if (result.authorization_url) {
        window.location.href = result.authorization_url;
        return;
      }

      setFeedback("Registration received. Check your email for payment details.");
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "0", maxWidth: "100%" }}>
      {/* Navbar */}
      <nav style={{ padding: "20px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e1e4e8", background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.jpeg" alt="IGHub Logo" style={{ height: 40, width: "auto", borderRadius: 8, objectFit: "contain" }} />
          <span style={{ fontWeight: 800, color: "#003388", fontSize: "1.2rem", letterSpacing: "1px" }}>KCC 2026</span>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="#courses" style={{ fontWeight: 600, color: "#32373c", fontSize: "0.95rem" }} className="hover-link">Courses</a>
          <a href="#register" className="button button-accent" style={{ padding: "10px 20px", fontSize: "0.95rem" }}>Register Now</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: "80px 5% 120px", position: "relative", overflow: "hidden", maxWidth: 1300, margin: "0 auto" }}>
        <div className="grid grid-2" style={{ alignItems: "center", gap: 64 }}>
          <div>
            <div className="badge" style={{ marginBottom: 24 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              August 2026 Edition
            </div>
            <h1 className="title" style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)", marginBottom: 24 }}>
              Empower your child's <span style={{ color: "#ff6b00" }}>Future.</span>
            </h1>
            <p className="subtitle" style={{ fontSize: "1.2rem", lineHeight: 1.6, marginBottom: 40, maxWidth: 540 }}>
              Join over 500 students at IGHub Kids Code Camp to build practical digital skills that open doors worldwide. No prior experience required.
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="#register" className="button button-accent" style={{ fontSize: "1.1rem", padding: "18px 32px" }}>Secure a Spot</a>
              <a href="#courses" className="button button-secondary" style={{ fontSize: "1.1rem", padding: "18px 32px" }}>View Courses</a>
            </div>
          </div>
          
          <div className="card" style={{ padding: 48, textAlign: "center", background: "#f8faff", border: "1px solid #dce4f5" }}>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 32, color: "#003388" }}>Camp starts in</h3>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              {[
                { label: "Days", value: timeLeft?.days ?? "-" },
                { label: "Hours", value: timeLeft?.hours ?? "-" },
                { label: "Mins", value: timeLeft?.minutes ?? "-" },
                { label: "Secs", value: timeLeft?.seconds ?? "-" }
              ].map((item, i) => (
                <div key={i} style={{ width: 80 }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, background: "#ffffff", borderRadius: 12, padding: "16px 0", marginBottom: 8, color: "#003388", boxShadow: "0 4px 12px rgba(0,51,136,0.05)" }}>
                    {item.value}
                  </div>
                  <span style={{ fontSize: "0.85rem", color: "#5b6571", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "80px 5%", background: "#f8faff", borderTop: "1px solid #e1e4e8", borderBottom: "1px solid #e1e4e8" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#003388" }}>This isn't just a camp — it's a launchpad</h2>
            <p className="subtitle" style={{ margin: "16px auto 0" }}>What makes IGHub KCC the best choice for your child?</p>
          </div>
          <div className="grid grid-3" style={{ gap: 32 }}>
            {[
              { 
                icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#003388" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>, 
                title: "Global-Standard Training", 
                desc: "Our curriculum is aligned with international tech standards." 
              },
              { 
                icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#003388" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>, 
                title: "Hands-On Coding", 
                desc: "100% practical sessions building real-world projects." 
              },
              { 
                icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#003388" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>, 
                title: "Future Skills", 
                desc: "Equip your child with AI, Data, and problem-solving skills." 
              }
            ].map((feature, i) => (
              <div key={i} className="card" style={{ padding: 32, textAlign: "center", background: "#ffffff" }}>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                  <div style={{ background: "rgba(137, 190, 43, 0.15)", width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {feature.icon}
                  </div>
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 12, color: "#003388" }}>{feature.title}</h3>
                <p style={{ color: "#5b6571", lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" style={{ padding: "100px 5%" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#003388" }}>Available Course Tracks</h2>
            <p className="subtitle" style={{ margin: "16px auto 0" }}>Select from 8 different specialized tracks designed for ages 5–18.</p>
          </div>
          <div className="grid grid-4" style={{ gap: 24 }}>
            {courses.map((course) => (
              <div key={course.name} className="alert" style={{ background: "#ffffff", padding: 24 }}>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ color: "#ff6b00" }}>{course.icon}</div>
                </div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8, color: "#003388" }}>{course.name}</h4>
                <p style={{ fontSize: "0.9rem", color: "#5b6571", fontWeight: 500 }}>1 Month Duration</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" style={{ padding: "100px 5%", background: "#f8faff", borderTop: "1px solid #e1e4e8" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }} className="grid grid-2 gap-register">
          <div style={{ paddingRight: "4vw" }}>
            <h2 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: 24, lineHeight: 1.1, color: "#003388" }}>Join the class of 2026.</h2>
            <p className="subtitle" style={{ fontSize: "1.1rem", marginBottom: 40 }}>
              Don't let your child just consume technology — teach them to build it. Spaces are limited for our physical locations.
            </p>
            
            <div className="card" style={{ marginBottom: 32, padding: 32 }}>
              <h3 style={{ fontSize: "1.2rem", color: "#5b6571", marginBottom: 16, fontWeight: 700 }}>Registration Fee</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", borderBottom: "1px solid #e1e4e8", paddingBottom: 16, marginBottom: 16 }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>Early Bird (Current)</span>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#ff6b00" }}>₦50,000</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#5b6571", fontWeight: 500 }}>
                <span>Late Registration</span>
                <span>₦60,000</span>
              </div>
            </div>

            <div className="card" style={{ padding: 32 }}>
               <h3 style={{ fontSize: "1.2rem", marginBottom: 16, fontWeight: 700, color: "#003388" }}>Requirements</h3>
               <ul style={{ color: "#5b6571", paddingLeft: 20, lineHeight: 1.8, fontWeight: 500 }}>
                 <li>A working laptop</li>
                 <li>Ages 5 to 18</li>
                 <li>No prior experience required</li>
               </ul>
               <p style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: 16, fontStyle: "italic" }}>
                 *Note: We have Laptops available for rent to those who do not have Laptops (T&C applies)
               </p>
            </div>
          </div>

          <form className="card" onSubmit={handleSubmit} style={{ padding: "40px 32px", borderTop: "4px solid #003388" }}>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 32, color: "#003388" }}>Parent & Child Details</h3>
            
            <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
              <div className="form-field">
                <label className="label">Parent First Name</label>
                <input className="input" name="firstName" value={formState.firstName} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label className="label">Parent Last Name</label>
                <input className="input" name="lastName" value={formState.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
              <div className="form-field">
                <label className="label">Email Address</label>
                <input className="input" name="email" type="email" value={formState.email} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label className="label">Phone Number</label>
                <input className="input" name="phone" type="tel" value={formState.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
              <div className="form-field">
                <label className="label">Child's Name</label>
                <input className="input" name="childName" value={formState.childName} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label className="label">Child's Age (5-18)</label>
                <input className="input" name="childAge" type="number" min="5" max="18" value={formState.childAge} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
              <div className="form-field">
                <label className="label">Preferred Location</label>
                <select className="select" name="location" value={formState.location} onChange={handleChange}>
                  {locations.map(loc => <option key={loc} value={loc} style={{ background: "#ffffff" }}>{loc}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="label">Course Track</label>
                <select className="select" name="course" value={formState.course} onChange={handleChange}>
                  {courseNames.map(course => <option key={course} value={course} style={{ background: "#ffffff" }}>{course}</option>)}
                </select>
              </div>
            </div>

            <div className="form-field" style={{ marginBottom: 32 }}>
              <label className="label">Referral Code (Optional)</label>
              <input className="input" name="referralCode" value={formState.referralCode} onChange={handleChange} placeholder="If someone referred you..." />
            </div>

            <button className="button button-accent" type="submit" disabled={loading} style={{ width: "100%", padding: 20, fontSize: "1.1rem" }}>
              {loading ? "Processing..." : "Proceed to Payment (₦50,000)"}
            </button>
            
            {feedback && (
              <div style={{ marginTop: 20, textAlign: "center", color: "#003388", fontWeight: 700 }}>
                {feedback}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "64px 5%", background: "#001f54", color: "#ffffff" }}>
        <div className="grid grid-3" style={{ gap: 48, marginBottom: 48, maxWidth: 1300, margin: "0 auto" }}>
          <div>
             <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <img src="/logo.jpeg" alt="IGHub Logo" style={{ height: 40, width: "auto", borderRadius: 8, objectFit: "contain", background: "white", padding: 2 }} />
                <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>KCC 2026</span>
             </div>
             <p style={{ color: "#b0c4de", fontSize: "0.95rem", lineHeight: 1.6 }}>Empowering the next generation of tech leaders across Africa through hands-on, practical learning.</p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 24, color: "#ffffff" }}>Locations</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#b0c4de", fontSize: "0.95rem", display: "grid", gap: 16 }}>
              <li><strong>Aba:</strong> 10 Calabar Street opposite Abia Polytechnic Aba.</li>
              <li><strong>Umuahia:</strong> No 6 Ojike street, Luzen Plaza, Umuahia.</li>
              <li><strong>Online:</strong> Google Meet</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 24, color: "#ffffff" }}>Links</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
              <li><a href="/admin/login" style={{ color: "#b0c4de", textDecoration: "none" }} className="hover-link">Admin Login</a></li>
              <li><a href="#courses" style={{ color: "#b0c4de", textDecoration: "none" }} className="hover-link">Courses</a></li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: "center", color: "#7a9cc6", fontSize: "0.9rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32 }}>
          &copy; {new Date().getFullYear()} IGHub Kids Code Camp. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
