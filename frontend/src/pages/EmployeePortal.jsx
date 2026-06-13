
import { useState, useEffect, useRef } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";
import EmployeeDashboard from "./EmployeeDashboard";
import EmployeeProfile from "./EmployeeProfile";
import EmployeeAttendance from "./EmployeeAttendance";
import ApplyLeave from "./ApplyLeave";
import MyLeaves from "./MyLeaves";
import EmployeeNotifications from "./EmployeeNotifications";
import Settings from "./Settings";

export default function EmployeePortal({ user, employee, setEmployee, onLogout }) {
  const { darkMode } = useTheme();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications", { params: { user_id: user?.id } });
      setNotifications(res.data);
    } catch (err) { console.error("Failed to load notifications", err); }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      loadNotifications();
    } catch (err) { console.error("Failed to mark notification as read", err); }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success": return "ti-circle-check";
      case "warning": return "ti-alert-triangle";
      case "error": return "ti-circle-x";
      default: return "ti-bell";
    }
  };

  const getInitials = (name = "") => {
    if (!name) return "EM";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const getEmailInitials = (email = "") => {
    const name = email?.split("@")[0] || "emp";
    return name.slice(0, 2).toUpperCase();
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <EmployeeDashboard employee={employee} />;
      case "profile":
        return <EmployeeProfile employee={employee} setEmployee={setEmployee} />;
      case "attendance":
        return <EmployeeAttendance employee={employee} />;
      case "apply-leave":
        return <ApplyLeave employee={employee} />;
      case "my-leaves":
        return <MyLeaves employee={employee} />;
      case "notifications":
        return <EmployeeNotifications user={user} />;
      case "settings":
        return <Settings user={user} employee={employee} setEmployee={setEmployee} />;
      default:
        return <EmployeeDashboard employee={employee} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <EmployeeSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onLogout={onLogout}
      />
      <div
        style={{
          flex: 1,
          background: darkMode ? "#0f172a" : "#f1f5f9",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: darkMode ? "#1f2937" : "#ffffff",
            borderBottom: darkMode ? "1px solid #374151" : "1px solid #e2e8f0",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: darkMode ? "#f9fafb" : "#1f2937",
              textTransform: "capitalize",
            }}
          >
            {activeMenu.replace("-", " ")}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{
              width: 34, height: 34, borderRadius: 8,
              border: `0.5px solid ${darkMode ? "#4b5563" : "#e2e8f0"}`,
              background: darkMode ? "#111827" : "#fff",
              display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
              color: darkMode ? "#9ca3af" : "#64748b",
            }}>
              <i className="ti ti-search" style={{ fontSize: 17 }} />
            </button>
            <div style={{ position: "relative" }} ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: `0.5px solid ${darkMode ? "#4b5563" : "#e2e8f0"}`,
                  background: darkMode ? "#111827" : "#fff",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer",
                  color: darkMode ? "#9ca3af" : "#64748b",
                  position: "relative"
                }}
              >
                <i className="ti ti-bell" style={{ fontSize: 17 }} />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <div style={{
                    position: "absolute", top: -5, right: -5,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#ef4444", color: "white",
                    fontSize: 10, fontWeight: "bold",
                    display: "flex", alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {notifications.filter(n => !n.is_read).length}
                  </div>
                )}
              </button>
              {showNotifications && (
                <div style={{
                  position: "absolute", top: 44, right: 0,
                  width: 320, maxHeight: 400, overflowY: "auto",
                  background: darkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
                  borderRadius: 12, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  zIndex: 1000
                }}>
                  <div style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
                    fontSize: 14, fontWeight: 600,
                    color: darkMode ? "#f9fafb" : "#1f2937"
                  }}>
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: darkMode ? "#9ca3af" : "#64748b" }}>
                      <i className="ti ti-bell" style={{ fontSize: 32, marginBottom: 8, display: "block" }} />
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.is_read && markAsRead(n.id)}
                        style={{
                          padding: "12px 16px",
                          borderBottom: `1px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
                          cursor: !n.is_read ? "pointer" : "default",
                          background: n.is_read ? "transparent" : (darkMode ? "#1e293b" : "#f8fafc")
                        }}
                      >
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: n.type === "success" ? "#dcfce7" : n.type === "warning" ? "#fef9c3" : "#ede9fe",
                            color: n.type === "success" ? "#16a34a" : n.type === "warning" ? "#f59e0b" : "#7c3aed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <i className={`ti ${getIcon(n.type)}`} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 600, color: darkMode ? "#f9fafb" : "#1f2937" }}>
                              {n.title}
                            </div>
                            {n.message && (
                              <div style={{ fontSize: 12, color: darkMode ? "#9ca3af" : "#64748b", marginTop: 2 }}>
                                {n.message}
                              </div>
                            )}
                            <div style={{ fontSize: 11, color: darkMode ? "#6b7280" : "#9ca3af", marginTop: 4 }}>
                              {new Date(n.created_at).toLocaleString()}
                            </div>
                          </div>
                          {!n.is_read && (
                            <div style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: "#7c3aed", flexShrink: 0, marginTop: 4
                            }} />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: employee?.avatar ? "transparent" : "#7c3aed",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 500, color: "#fff", cursor: "pointer",
              overflow: "hidden",
              position: "relative"
            }}>
              {employee?.avatar ? (
                <img
                  src={employee.avatar}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              ) : (
                (employee?.name ? getInitials(employee.name) : getEmailInitials(user?.email))
              )}
            </div>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
