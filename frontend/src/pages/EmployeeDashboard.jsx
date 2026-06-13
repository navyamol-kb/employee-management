
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

export default function EmployeeDashboard({ employee }) {
  const { darkMode } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    if (employee?.id) {
      loadAttendance();
      loadLeaves();
    }
  }, [employee]);

  const loadAttendance = async () => {
    try {
      const res = await api.get("/attendance", { params: { employee_id: employee.id } });
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLeaves = async () => {
    try {
      const res = await api.get("/leaves", { params: { employee_id: employee.id } });
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const presentDays = attendance.filter(a => a.status === "Present").length;
  const absentDays = attendance.filter(a => a.status === "Absent").length;
  const leaveDays = attendance.filter(a => a.status === "Leave").length;
  const pendingLeaves = leaves.filter(l => l.status === "Pending").length;

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const avatarColors = [
    { bg: darkMode ? "#312e81" : "#ede9fe", color: "#7c3aed" },
    { bg: darkMode ? "#1e3a5f" : "#dbeafe", color: "#2563eb" },
    { bg: darkMode ? "#14532d" : "#dcfce7", color: "#16a34a" },
    { bg: darkMode ? "#713f12" : "#fef9c3", color: "#f59e0b" },
  ];

  const stats = [
    { label: "Present Days", value: presentDays, icon: "ti-check", color: "#16a34a" },
    { label: "Absent Days", value: absentDays, icon: "ti-x", color: "#ef4444" },
    { label: "Leave Days", value: leaveDays, icon: "ti-calendar-event", color: "#f59e0b" },
    { label: "Pending Leaves", value: pendingLeaves, icon: "ti-clock-hour-3", color: "#7c3aed" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          backgroundColor: darkMode ? "#1f2937" : "#ffffff",
          borderRadius: 12,
          border: darkMode ? "1px solid #374151" : "1px solid #e2e8f0",
          padding: 24,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: employee?.avatar ? "transparent" : "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
            color: "#ffffff",
            overflow: "hidden",
            position: "relative"
          }}
        >
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
            getInitials(employee?.name)
          )}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: darkMode ? "#f9fafb" : "#1f2937" }}>
            Hello, {employee?.name || "Employee"}!
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 14, color: darkMode ? "#9ca3af" : "#6b7280" }}>
            {employee?.role || "Employee"} • {employee?.department || "No Department"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: darkMode ? "#1f2937" : "#ffffff",
              borderRadius: 12,
              border: darkMode ? "1px solid #374151" : "1px solid #e2e8f0",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: `${stat.color}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: stat.color,
                fontSize: 20,
              }}
            >
              <i className={`ti ${stat.icon}`} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: darkMode ? "#f9fafb" : "#1f2937" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 13, color: darkMode ? "#9ca3af" : "#6b7280" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
            borderRadius: 12,
            border: darkMode ? "1px solid #374151" : "1px solid #e2e8f0",
            padding: 20,
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, color: darkMode ? "#f9fafb" : "#1f2937" }}>
            Recent Attendance
          </h3>
          {attendance.slice(0, 5).map((a) => (
            <div
              key={a.id}
              style={{
                padding: "10px 0",
                borderBottom: darkMode ? "1px solid #374151" : "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: darkMode ? "#d1d5db" : "#374151", fontSize: 14 }}>
                {new Date(a.date).toLocaleDateString()}
              </span>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor:
                    a.status === "Present"
                      ? darkMode ? "#14532d" : "#dcfce7"
                      : a.status === "Absent"
                      ? darkMode ? "#7f1d1d" : "#fee2e2"
                      : darkMode ? "#713f12" : "#fef9c3",
                  color:
                    a.status === "Present"
                      ? "#16a34a"
                      : a.status === "Absent"
                      ? "#ef4444"
                      : "#f59e0b",
                }}
              >
                {a.status}
              </span>
            </div>
          ))}
          {attendance.length === 0 && (
            <p style={{ fontSize: 14, color: darkMode ? "#6b7280" : "#9ca3af", textAlign: "center" }}>
              No attendance records yet
            </p>
          )}
        </div>

        <div
          style={{
            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
            borderRadius: 12,
            border: darkMode ? "1px solid #374151" : "1px solid #e2e8f0",
            padding: 20,
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, color: darkMode ? "#f9fafb" : "#1f2937" }}>
            Recent Leaves
          </h3>
          {leaves.slice(0, 5).map((l) => (
            <div
              key={l.id}
              style={{
                padding: "10px 0",
                borderBottom: darkMode ? "1px solid #374151" : "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: darkMode ? "#d1d5db" : "#374151", fontSize: 14, fontWeight: 500 }}>
                  {l.leave_type}
                </div>
                <div style={{ color: darkMode ? "#6b7280" : "#9ca3af", fontSize: 12 }}>
                  {new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}
                </div>
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor:
                    l.status === "Approved"
                      ? darkMode ? "#14532d" : "#dcfce7"
                      : l.status === "Rejected"
                      ? darkMode ? "#7f1d1d" : "#fee2e2"
                      : darkMode ? "#312e81" : "#ede9fe",
                  color:
                    l.status === "Approved"
                      ? "#16a34a"
                      : l.status === "Rejected"
                      ? "#ef4444"
                      : "#7c3aed",
                }}
              >
                {l.status}
              </span>
            </div>
          ))}
          {leaves.length === 0 && (
            <p style={{ fontSize: 14, color: darkMode ? "#6b7280" : "#9ca3af", textAlign: "center" }}>
              No leave requests yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
