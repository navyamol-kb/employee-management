import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

function Toggle({ label, checked, onChange }) {
  const { darkMode } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
      <span style={{ fontSize: 14, color: darkMode ? "#d1d5db" : "#374151" }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 24,
          background: checked ? "#7c3aed" : darkMode ? "#4b5563" : "#d1d5db",
          border: "none",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <div style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }} />
      </button>
    </div>
  );
}

function Field({ label, children, error, disabled }) {
  const { darkMode } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: darkMode ? "#d1d5db" : "#374151" }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: "#dc2626", marginTop: 2 }}>{error}</span>}
    </div>
  );
}

function Card({ title, subtitle, children }) {
  const { darkMode } = useTheme();
  return (
    <div style={{
      background: darkMode ? "#1f2937" : "#fff",
      borderRadius: 12,
      border: `1px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
      padding: "24px",
    }}>
      {title && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: darkMode ? "#f9fafb" : "#0f172a" }}>{title}</h3>
          {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: darkMode ? "#9ca3af" : "#64748b" }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export default function Settings({ user, employee, setEmployee }) {
  const { darkMode, setDarkMode } = useTheme();
  const [profile, setProfile] = useState({
    name: employee?.name || "Admin User",
    email: user?.email || employee?.email || "admin@corporateprecision.com",
  });
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [currentAvatar, setCurrentAvatar] = useState(employee?.avatar);
  const fileInputRef = useRef(null);

  // Sync profile and avatar when employee data changes
  useEffect(() => {
    if (employee) {
      console.log("Settings.jsx useEffect triggered with employee:", employee);
      setProfile({
        name: employee.name || "Admin User",
        email: user?.email || employee.email || "admin@corporateprecision.com",
      });
      setCurrentAvatar(employee.avatar || null); // Always sync, even if null
    }
  }, [employee, user]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e) => {
    setSecurity({ ...security, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    try {
      // Update employee in backend
      if (employee?.id) {
        const updatedEmployeeData = {
          name: profile.name,
          avatar: getAvatar()
        };
        console.log("Updating employee with data (Settings):", { ...updatedEmployeeData, avatar: updatedEmployeeData.avatar ? "data URL present" : "null" });
        const res = await api.put(`/employees/${employee.id}`, updatedEmployeeData);
        console.log("Response from backend (Settings):", res.data);
        setEmployee(res.data); // Update in parent component with the data from API
        // Also save to localStorage to persist
        localStorage.setItem("cp_employee", JSON.stringify(res.data));
      }
      alert("Profile changes saved successfully!");
    } catch (err) {
      console.error("Error saving profile changes (Settings):", err);
      alert("Failed to save profile changes!");
    }
  };

  const handlePasswordChange = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password changed successfully!");
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentAvatar(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name = "") => {
    if (!name) {
      const emailPart = profile.email.split("@")[0];
      return emailPart.slice(0, 2).toUpperCase();
    }
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const getAvatar = () => {
    if (currentAvatar) return currentAvatar;
    if (employee?.avatar) return employee.avatar;
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Profile Settings */}
        <div style={{ gridColumn: "1 / -1" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
              <div
                onClick={handleAvatarClick}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: getAvatar() ? "transparent" : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                  cursor: "pointer",
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                {getAvatar() ? (
                  <img
                    src={getAvatar()}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <div>
                <button
                  onClick={handleAvatarClick}
                  style={{
                    padding: "8px 16px",
                    background: darkMode ? "#374151" : "#f1f5f9",
                    border: `1px solid ${darkMode ? "#4b5563" : "#e2e8f0"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    color: darkMode ? "#e5e7eb" : "#374151",
                    fontWeight: 500,
                  }}
                >
                  Change Avatar
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Full Name">
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                    background: darkMode ? "#111827" : "#fff",
                    color: darkMode ? "#f9fafb" : "#111",
                    boxSizing: "border-box",
                  }}
                />
              </Field>
              <Field label="Email Address">
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                    background: darkMode ? "#1f2937" : "#f8fafc",
                    color: darkMode ? "#9ca3af" : "#64748b",
                    boxSizing: "border-box",
                    cursor: "not-allowed",
                  }}
                />
              </Field>
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleProfileSave}
                style={{
                  padding: "10px 20px",
                  background: "#7c3aed",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </Card>
        </div>

        {/* Security Settings */}
        <Card
          title="Security Settings"
          subtitle="Change your password and security preferences"
        >
          <Field label="Current Password">
            <input
              name="currentPassword"
              type="password"
              value={security.currentPassword}
              onChange={handleSecurityChange}
              placeholder="Enter your current password"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                background: darkMode ? "#111827" : "#fff",
                color: darkMode ? "#f9fafb" : "#111",
                boxSizing: "border-box",
              }}
            />
          </Field>
          <Field label="New Password">
            <input
              name="newPassword"
              type="password"
              value={security.newPassword}
              onChange={handleSecurityChange}
              placeholder="Enter your new password"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                background: darkMode ? "#111827" : "#fff",
                color: darkMode ? "#f9fafb" : "#111",
                boxSizing: "border-box",
              }}
            />
          </Field>
          <Field label="Confirm New Password">
            <input
              name="confirmPassword"
              type="password"
              value={security.confirmPassword}
              onChange={handleSecurityChange}
              placeholder="Confirm your new password"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                background: darkMode ? "#111827" : "#fff",
                color: darkMode ? "#f9fafb" : "#111",
                boxSizing: "border-box",
              }}
            />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button
              onClick={handlePasswordChange}
              style={{
                padding: "10px 20px",
                background: "#7c3aed",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Change Password
            </button>
          </div>
        </Card>

        {/* System Information */}
        <Card
          title="System Information"
          subtitle="Account and system details"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: darkMode ? "#9ca3af" : "#64748b" }}>Logged-in User</span>
              <span style={{ fontSize: 14, color: darkMode ? "#f9fafb" : "#111", fontWeight: 500 }}>{profile.email}</span>
            </div>
            <div style={{ height: 1, background: darkMode ? "#374151" : "#f1f5f9" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: darkMode ? "#9ca3af" : "#64748b" }}>Role</span>
              <span style={{ fontSize: 14, color: darkMode ? "#f9fafb" : "#111", fontWeight: 500, textTransform: "capitalize" }}>{user?.role || "Admin"}</span>
            </div>
            <div style={{ height: 1, background: darkMode ? "#374151" : "#f1f5f9" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: darkMode ? "#9ca3af" : "#64748b" }}>Last Login</span>
              <span style={{ fontSize: 14, color: darkMode ? "#f9fafb" : "#111", fontWeight: 500 }}>{new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
