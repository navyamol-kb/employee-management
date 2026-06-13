
import { useTheme } from "../contexts/ThemeContext";

export default function EmployeeSidebar({ activeMenu, setActiveMenu, onLogout }) {
  const { darkMode } = useTheme();

  const menuItems = [
    { id: "dashboard", icon: "ti-home", label: "Dashboard" },
    { id: "profile", icon: "ti-user", label: "My Profile" },
    { id: "attendance", icon: "ti-calendar", label: "Attendance" },
    { id: "apply-leave", icon: "ti-file-text", label: "Apply Leave" },
    { id: "my-leaves", icon: "ti-list", label: "My Leaves" },
    { id: "notifications", icon: "ti-bell", label: "Notifications" },
    { id: "settings", icon: "ti-settings", label: "Settings" },
  ];

  return (
    <div
      style={{
        width: 260,
        minHeight: "100vh",
        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
        borderRight: darkMode ? "1px solid #374151" : "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        padding: "20px 16px",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#7c3aed",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <i className="ti ti-building" style={{ fontSize: 24 }} />
          CorpPulse
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: activeMenu === item.id ? "#7c3aed" : "transparent",
              color: activeMenu === item.id ? "#ffffff" : (darkMode ? "#9ca3af" : "#64748b"),
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 14,
              fontWeight: activeMenu === item.id ? 600 : 400,
              transition: "all 0.2s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              if (activeMenu !== item.id) {
                e.target.style.backgroundColor = darkMode ? "#374151" : "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              if (activeMenu !== item.id) {
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            <i className={`ti ${item.icon}`} />
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "auto" }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: darkMode ? "#374151" : "#f3f4f6",
            color: darkMode ? "#ef4444" : "#dc2626",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <i className="ti ti-logout" />
          Logout
        </button>
      </div>
    </div>
  );
}
