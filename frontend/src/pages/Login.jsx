
import { useState, useEffect } from "react";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.add("fullscreen");
    return () => root?.classList.remove("fullscreen");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (data.success) {
          onLogin(data.user, data.employee);
        } else {
          setError(data.message || "Registration failed");
        }
      } else {
        const response = await fetch("http://localhost:5000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (data.success) {
          onLogin(data.user, data.employee);
        } else {
          setError(data.message || "Invalid credentials");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 900px) {
          .login-left-panel { display: none !important; }
          .login-right-panel { flex: 1 1 100% !important; padding: 1.5rem !important; }
          .login-form-wrap { padding: 0 1rem !important; }
        }
      `}</style>

      <div className="login-left-panel" style={styles.leftPanel}>
        <div style={styles.brandRow}>
          <span style={styles.logoDot} />
          <span style={styles.brandName}>Corporate Precision</span>
        </div>

        <div>
          <h1 style={styles.heroHeading}>
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h1>
          <p style={styles.heroText}>
            {mode === "login"
              ? "Access your dashboard, track projects, and collaborate with your team — all in one secure workspace built for enterprises."
              : "Register to join our platform and start managing your work with precision."}
          </p>
        </div>

        <p style={styles.footerText}>
          Trusted by teams worldwide · Corporate Precision © 2024
        </p>
      </div>

      <div className="login-right-panel" style={styles.rightPanel}>
        <div className="login-form-wrap" style={styles.formWrap}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={styles.heading}>{mode === "login" ? "Sign in" : "Sign up"}</h2>
            <p style={styles.subtext}>
              {mode === "login" ? "Enter your credentials to continue" : "Fill in your details to get started"}
            </p>
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>
              {mode === "login" ? "OR" : "ALTERNATIVE"}
            </span>
            <span style={styles.dividerLine} />
          </div>

          {error && <p style={styles.errorMsg}>{error}</p>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <div>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            )}
            <div>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {mode === "register" && (
              <div>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading
                ? mode === "login" ? "Signing in…" : "Registering…"
                : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <p style={styles.signupText}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }} style={styles.link}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    display: "flex",
    colorScheme: "light",
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
  },
  leftPanel: {
    flex: 1.1,
    background: "#eef2ff",
    padding: "4rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  logoDot: {
    width: 28, height: 28,
    borderRadius: 8,
    background: "#aa3bff",
    display: "inline-block",
  },
  brandName: { fontWeight: 600, fontSize: 16, color: "#1e293b" },
  heroHeading: {
    margin: "0 0 16px",
    fontSize: 36, fontWeight: 600,
    color: "#1e293b", lineHeight: 1.25, maxWidth: 480,
  },
  heroText: {
    fontSize: 15, color: "#475569",
    lineHeight: 1.7, maxWidth: 420, margin: 0,
  },
  footerText: { fontSize: 12, color: "#94a3b8", margin: 0 },
  rightPanel: {
    flex: 1,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    padding: "2rem 0",
    overflowY: "auto",
  },
  formWrap: { width: "100%", maxWidth: 380, padding: "0 2rem" },
  heading: { margin: "0 0 4px", fontSize: 24, fontWeight: 600, color: "#111" },
  subtext: { fontSize: 13, color: "#6b7280", margin: 0 },
  divider: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, background: "#e5e7eb" },
  dividerText: { fontSize: 12, color: "#9ca3af" },
  errorMsg: {
    fontSize: 13,
    color: "#dc2626",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 6,
    padding: "8px 12px",
    margin: "0 0 8px",
  },
  label: { fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 },
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14, outline: "none",
    background: "#fff", color: "#111",
    boxSizing: "border-box",
  },
  link: { color: "#aa3bff", textDecoration: "none", fontWeight: 500 },
  button: {
    background: "#aa3bff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "11px 0",
    fontWeight: 500, fontSize: 14,
    cursor: "pointer", marginTop: 4,
  },
  signupText: { textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 16 },
};
