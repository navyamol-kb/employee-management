
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

export default function EmployeeNotifications({ user }) {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications", { params: { user_id: user.id } });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return { icon: "ti-circle-check", color: "#16a34a" };
      case "warning":
        return { icon: "ti-alert-triangle", color: "#f59e0b" };
      case "error":
        return { icon: "ti-circle-x", color: "#ef4444" };
      default:
        return { icon: "ti-bell", color: "#7c3aed" };
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          backgroundColor: darkMode ? "#1f2937" : "#ffffff",
          borderRadius: 12,
          border: darkMode ? "1px solid #374151" : "1px solid #e2e8f0",
          padding: 24,
        }}
      >
        <h2 style={{ margin: "0 0 24px 0", color: darkMode ? "#f9fafb" : "#1f2937" }}>
          Notifications
        </h2>

        {notifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 16px",
              color: darkMode ? "#6b7280" : "#9ca3af",
            }}
          >
            <i className="ti ti-bell" style={{ fontSize: 48, marginBottom: 16, display: "block" }} />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notifications.map((n) => {
              const { icon, color } = getIcon(n.type);
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: n.is_read
                      ? (darkMode ? "#111827" : "#f9fafb")
                      : `${color}10`,
                    border: n.is_read
                      ? (darkMode ? "1px solid #374151" : "1px solid #e5e7eb")
                      : `1px solid ${color}30`,
                    cursor: !n.is_read ? "pointer" : "default",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: `${color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color,
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    <i className={`ti ${icon}`} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: darkMode ? "#f9fafb" : "#1f2937",
                        }}
                      >
                        {n.title}
                      </h4>
                      {!n.is_read && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: color,
                          }}
                        />
                      )}
                    </div>
                    {n.message && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: darkMode ? "#9ca3af" : "#6b7280",
                        }}
                      >
                        {n.message}
                      </p>
                    )}
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: 12,
                        color: darkMode ? "#6b7280" : "#9ca3af",
                      }}
                    >
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
