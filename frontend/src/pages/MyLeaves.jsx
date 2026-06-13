
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

export default function MyLeaves({ employee }) {
  const { darkMode } = useTheme();
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (employee?.id) {
      loadLeaves();
    }
  }, [employee]);

  const loadLeaves = async () => {
    try {
      const params = { employee_id: employee.id };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/leaves", { params });
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return {
          backgroundColor: darkMode ? "#14532d" : "#dcfce7",
          color: "#16a34a",
        };
      case "Rejected":
        return {
          backgroundColor: darkMode ? "#7f1d1d" : "#fee2e2",
          color: "#ef4444",
        };
      case "Pending":
      default:
        return {
          backgroundColor: darkMode ? "#312e81" : "#ede9fe",
          color: "#7c3aed",
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
          <h2 style={{ margin: 0, color: darkMode ? "#f9fafb" : "#1f2937" }}>My Leaves</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
              backgroundColor: darkMode ? "#111827" : "#ffffff",
              color: darkMode ? "#f9fafb" : "#1f2937",
              fontSize: 14,
            }}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
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
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Leave Type
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Start Date
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  End Date
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Reason
                </th>
                <th
                  style={{
                    textAlign: "left",
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
              {leaves.map((l) => (
                <tr
                  key={l.id}
                  style={{
                    borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 14,
                      color: darkMode ? "#d1d5db" : "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {l.leave_type}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 14,
                      color: darkMode ? "#d1d5db" : "#374151",
                    }}
                  >
                    {new Date(l.start_date).toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 14,
                      color: darkMode ? "#d1d5db" : "#374151",
                    }}
                  >
                    {new Date(l.end_date).toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 14,
                      color: darkMode ? "#d1d5db" : "#374151",
                      maxWidth: 200,
                    }}
                  >
                    {l.reason || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        ...getStatusStyle(l.status),
                      }}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      color: darkMode ? "#6b7280" : "#9ca3af",
                      fontSize: 14,
                    }}
                  >
                    No leave requests found
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
