
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

export default function EmployeeAttendance({ employee }) {
  const { darkMode } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (employee?.id) {
      loadAttendance();
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

  const filteredAttendance = attendance.filter((a) => {
    const matchesDate =
      (!startDate || new Date(a.date) >= new Date(startDate)) &&
      (!endDate || new Date(a.date) <= new Date(endDate));
    return matchesDate;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return {
          backgroundColor: darkMode ? "#14532d" : "#dcfce7",
          color: "#16a34a",
        };
      case "Absent":
        return {
          backgroundColor: darkMode ? "#7f1d1d" : "#fee2e2",
          color: "#ef4444",
        };
      case "Leave":
        return {
          backgroundColor: darkMode ? "#713f12" : "#fef9c3",
          color: "#f59e0b",
        };
      default:
        return {
          backgroundColor: darkMode ? "#374151" : "#f3f4f6",
          color: darkMode ? "#9ca3af" : "#6b7280",
        };
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0, color: darkMode ? "#f9fafb" : "#1f2937" }}>My Attendance</h2>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
              backgroundColor: darkMode ? "#111827" : "#ffffff",
              color: darkMode ? "#f9fafb" : "#1f2937",
              fontSize: 14,
              width: 180,
              height: 44,
              boxSizing: "border-box",
            }}
          />
          <input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
              backgroundColor: darkMode ? "#111827" : "#ffffff",
              color: darkMode ? "#f9fafb" : "#1f2937",
              fontSize: 14,
              width: 180,
              height: 44,
              boxSizing: "border-box",
            }}
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              style={{
                padding: "0 20px",
                height: 44,
                border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
                backgroundColor: darkMode ? "#111827" : "#ffffff",
                color: darkMode ? "#f9fafb" : "#374151",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Reset
            </button>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: darkMode ? "#111827" : "#f9fafb",
                }}
              >
                <th
                  style={{
                    textAlign: "center",
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((a) => (
                <tr
                  key={a.id}
                  style={{
                    borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 14,
                      color: darkMode ? "#d1d5db" : "#374151",
                      textAlign: "center"
                    }}
                  >
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        ...getStatusStyle(a.status),
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      color: darkMode ? "#6b7280" : "#9ca3af",
                      fontSize: 14,
                    }}
                  >
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
