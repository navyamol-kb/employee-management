import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Employees from "./Employees";
import api from "../services/api";
import Departments from "./Department";
import Settings from "./Settings";
import Attendance from "./Attendance";
import LeaveManagement from "./LeaveManagement";
import { useTheme } from "../contexts/ThemeContext";

export default function Dashboard({ user, employee, setEmployee, onLogout }) {
  const { darkMode } = useTheme();
  const getEmailInitials = (email = "") => {
    const name = email?.split("@")[0] || "admin";
    return name.slice(0, 2).toUpperCase();
  };
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => { loadEmployees(); }, []);
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

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) { console.error("Failed to load employees", err); }
  };

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

  const stats = [
    { label: "Total employees", value: employees.length, icon: "ti-users", iconBg: darkMode ? "#312e81" : "#ede9fe", iconColor: "#7c3aed", change: "+1 this month", changeType: "up" },
    { label: "Departments", value: [...new Set(employees.map(e => e.department).filter(Boolean))].length || 4, icon: "ti-building", iconBg: darkMode ? "#1e3a5f" : "#dbeafe", iconColor: "#2563eb", change: "No change", changeType: "neutral" },
    { label: "Active users", value: employees.filter(e => e.status === "Active").length, icon: "ti-user-check", iconBg: darkMode ? "#14532d" : "#dcfce7", iconColor: "#16a34a", change: "100% active", changeType: "up" },
  ];

  const avatarColors = [
    { bg: darkMode ? "#312e81" : "#ede9fe", color: "#6d28d9" },
    { bg: darkMode ? "#1e3a5f" : "#dbeafe", color: "#1d4ed8" },
    { bg: darkMode ? "#713f12" : "#fef9c3", color: "#a16207" },
    { bg: darkMode ? "#831843" : "#fce7f3", color: "#9d174d" },
    { bg: darkMode ? "#14532d" : "#dcfce7", color: "#15803d" },
  ];

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const recentEmployees = [...employees]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
  const deptColors = ["#7c3aed", "#2563eb", "#16a34a", "#f59e0b", "#ec4899", "#94a3b8"];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={onLogout} />

      <div style={{ flex: 1, background: darkMode ? "#0f172a" : "#f1f5f9", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{
          background: darkMode ? "#1f2937" : "#fff",
          borderBottom: `0.5px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
          padding: "0 24px", height: 56, display: "flex",
          alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: darkMode ? "#f9fafb" : "#0f172a", textTransform: "capitalize" }}>
              {activeMenu}
            </span>
            <span style={{ fontSize: 11, color: darkMode ? "#6b7280" : "#94a3b8", background: darkMode ? "#374151" : "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>
              June 2026
            </span>
          </div>
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

        {/* Page content */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

          {activeMenu === "dashboard" && (
            <>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14 }}>
                {stats.map((stat) => (
                  <div key={stat.label} style={{
                    background: darkMode ? "#1f2937" : "#fff",
                    borderRadius: 12,
                    border: `0.5px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
                    padding: "18px 20px",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: stat.iconBg,
                      display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
                    }}>
                      <i className={`ti ${stat.icon}`} style={{ fontSize: 18, color: stat.iconColor }} />
                    </div>
                    <div style={{ fontSize: 12, color: darkMode ? "#9ca3af" : "#64748b", marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 500, color: darkMode ? "#f9fafb" : "#0f172a" }}>{stat.value}</div>
                    <div style={{ fontSize: 11, marginTop: 4, color: stat.changeType === "up" ? "#16a34a" : (darkMode ? "#6b7280" : "#64748b"), display: "flex", alignItems: "center", gap: 3 }}>
                      <i className={`ti ${stat.changeType === "up" ? "ti-trending-up" : "ti-minus"}`} style={{ fontSize: 13 }} />
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom panels */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 14 }}>

                {/* Recent employees — live from API */}
                <div style={{ background: darkMode ? "#1f2937" : "#fff", borderRadius: 12, border: `0.5px solid ${darkMode ? "#374151" : "#e2e8f0"}`, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: darkMode ? "#f9fafb" : "#0f172a" }}>Recent employees</span>
                    <button
                      onClick={() => setActiveMenu("employees")}
                      style={{ fontSize: 12, color: "#7c3aed", border: "none", background: "none", cursor: "pointer" }}
                    >
                      View all
                    </button>
                  </div>

                  {recentEmployees.length === 0 ? (
                    <p style={{ fontSize: 13, color: darkMode ? "#9ca3af" : "#94a3b8", textAlign: "center", padding: "20px 0", margin: 0 }}>
                      No employees yet
                    </p>
                  ) : (
                    recentEmployees.map((emp, i) => {
                      const c = avatarColors[i % avatarColors.length];
                      return (
                        <div key={emp.id} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 0",
                          borderBottom: i < recentEmployees.length - 1 ? `0.5px solid ${darkMode ? "#374151" : "#f1f5f9"}` : "none",
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: c.bg, color: c.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 500, flexShrink: 0,
                          }}>
                            {getInitials(emp.name)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: darkMode ? "#f9fafb" : "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {emp.name}
                            </div>
                            <div style={{ fontSize: 11, color: darkMode ? "#9ca3af" : "#94a3b8" }}>
                              {emp.department || emp.role || "—"}
                            </div>
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 500, padding: "2px 8px",
                            borderRadius: 20, flexShrink: 0,
                            background: emp.status === "Active" ? (darkMode ? "#14532d" : "#dcfce7") : (darkMode ? "#78350f" : "#fff7e6"),
                            color: emp.status === "Active" ? "#15803d" : "#b45309",
                          }}>
                            {emp.status || "Active"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Departments — live from API */}
                <div style={{ background: darkMode ? "#1f2937" : "#fff", borderRadius: 12, border: `0.5px solid ${darkMode ? "#374151" : "#e2e8f0"}`, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: darkMode ? "#f9fafb" : "#0f172a" }}>Departments</span>
                    <button
                      onClick={() => setActiveMenu("departments")}
                      style={{ fontSize: 12, color: "#7c3aed", border: "none", background: "none", cursor: "pointer" }}
                    >
                      Manage
                    </button>
                  </div>

                  {departments.length === 0 ? (
                    <p style={{ fontSize: 13, color: darkMode ? "#9ca3af" : "#94a3b8", textAlign: "center", padding: "20px 0", margin: 0 }}>
                      No departments yet
                    </p>
                  ) : (
                    departments.map((dept, i) => {
                      const count = employees.filter(e => e.department === dept).length;
                      const pct = employees.length > 0 ? Math.round((count / employees.length) * 100) : 0;
                      return (
                        <div key={dept} style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <div>
                              <div style={{ fontSize: 13, color: darkMode ? "#f9fafb" : "#0f172a" }}>{dept}</div>
                              <div style={{ fontSize: 11, color: darkMode ? "#9ca3af" : "#94a3b8" }}>{count} employee{count !== 1 ? "s" : ""}</div>
                            </div>
                            <span style={{ fontSize: 11, color: darkMode ? "#9ca3af" : "#64748b" }}>{pct}%</span>
                          </div>
                          <div style={{ height: 4, background: darkMode ? "#374151" : "#f1f5f9", borderRadius: 4 }}>
                            <div style={{ height: 4, width: `${Math.max(pct, 2)}%`, background: deptColors[i % deptColors.length], borderRadius: 4 }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </>
          )}

          {activeMenu === "employees" && (
            <Employees
              user={user}
              onLogout={onLogout}
              embedded
              employees={employees}
              setEmployees={setEmployees}
            />
          )}

          {activeMenu === "departments" && (
            <Departments />
          )}

          {activeMenu === "attendance" && (
            <Attendance embedded />
          )}

          {activeMenu === "leaves" && (
            <LeaveManagement embedded />
          )}

          {activeMenu === "settings" && (
            <Settings user={user} employee={employee} setEmployee={setEmployee} />
          )}

        </div>
      </div>
    </div>
  );
}
