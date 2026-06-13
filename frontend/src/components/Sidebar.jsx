import { useState } from "react";
const menuItems = [
  { key: "dashboard",   label: "Dashboard",   icon: "ti-layout-dashboard"},
  { key: "employees",   label: "Employees",   icon: "ti-users" },
  { key: "departments", label: "Departments", icon: "ti-building" },
  { key: "attendance",  label: "Attendance",  icon: "ti-calendar" },
  { key: "leaves",      label: "Leaves",      icon: "ti-file-text" },
  { key: "settings",    label: "Settings",    icon: "ti-settings" },
];

const menuGroups = [
  { label: "Overview",   items: ["dashboard"] },
  { label: "Management", items: ["employees", "departments", "attendance", "leaves"] },
  { label: "System",     items: ["settings"] },
];

export default function Sidebar({ activeMenu, setActiveMenu, onLogout }) {
  return (
    <div style={{
      width: 240,
      minHeight: "100vh",
      background: "#111827",
      display: "flex",
      flexDirection: "column",
      fontFamily: "sans-serif",
    }}>
      {/* Brand */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{
          width: 32, height: 32, background: "#7c3aed",
          borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", marginBottom: 12,
        }}>
          <i className="ti ti-building-skyscraper" style={{ color: "#c4b5fd", fontSize: 17 }} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#f9fafb" }}>Corporate Precision</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Admin Portal
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {menuGroups.map(({ label, items }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, padding: "8px 8px 4px", marginTop: 8 }}>
              {label}
            </div>
            {items.map((key) => {
              const item = menuItems.find((m) => m.key === key);
              const isActive = activeMenu === key;
              return (
                <button key={key} onClick={() => setActiveMenu(key)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                  color: isActive ? "#c4b5fd" : "#9ca3af",
                  background: isActive ? "rgba(124,58,237,0.18)" : "transparent",
                  border: "none", width: "100%", textAlign: "left", fontSize: 13.5,
                }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: 17, color: isActive ? "#a78bfa" : undefined }} />
                  {item.label}
                  {item.badge && (
                    <span style={{
                      marginLeft: "auto", background: "rgba(124,58,237,0.25)",
                      color: "#a78bfa", fontSize: 10, fontWeight: 500,
                      padding: "1px 6px", borderRadius: 20,
                    }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer - logout only */}
      <div style={{ padding: 12, borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onLogout} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", borderRadius: 8, cursor: "pointer",
          color: "#f87171", background: "transparent", border: "none",
          width: "100%", textAlign: "left", fontSize: 13.5,
        }}>
          <i className="ti ti-logout" style={{ fontSize: 17 }} />
          Log out
        </button>
      </div>
    </div>
  );

}