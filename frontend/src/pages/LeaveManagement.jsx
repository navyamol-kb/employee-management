
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

export default function LeaveManagement({ embedded = false }) {
  const { darkMode } = useTheme();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaves();
    loadEmployees();
  }, []);

  const loadLeaves = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/leaves", { params });
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to load leaves", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadLeaves(), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const updateLeaveStatus = async (id, status) => {
    try {
      const res = await api.put(`/leaves/${id}`, { status });
      setLeaves(leaves.map(l => l.id === id ? res.data : l));
    } catch (err) {
      console.error("Failed to update leave status", err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return {
          background: darkMode ? "#14532d" : "#dcfce7",
          color: "#15803d",
        };
      case "Rejected":
        return {
          background: darkMode ? "#7f1d1d" : "#fee2e2",
          color: "#dc2626",
        };
      default:
        return {
          background: darkMode ? "#312e81" : "#ede9fe",
          color: "#7c3aed",
        };
    }
  };

  const styles = getStyles(darkMode);

  return (
    <div style={embedded ? {} : styles.page}>
      <div style={embedded ? {} : styles.content}>
        <div style={styles.titleRow}>
          <div>
            <h2 style={styles.heading}>Leave Management</h2>
            <p style={styles.subtext}>Review and manage employee leave requests</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...styles.search,
              width: 260,
              height: 44,
              boxSizing: "border-box",
              flex: "none",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              ...styles.search,
              width: 160,
              height: 44,
              boxSizing: "border-box",
              flex: "none",
            }}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={{ ...styles.th, textAlign: "center" }}>Employee</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Type</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Start Date</th>
                <th style={{ ...styles.th, textAlign: "center" }}>End Date</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Reason</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Status</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ ...styles.emptyCell, textAlign: "center" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ ...styles.emptyCell, textAlign: "center" }}
                  >
                    {search ? "No results found" : "No leave requests yet"}
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} style={styles.row}>
                    <td style={{ ...styles.td, textAlign: "center", fontWeight: 500 }}>
                      {leave.employee_name}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {leave.leave_type}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {new Date(leave.start_date).toLocaleDateString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {new Date(leave.end_date).toLocaleDateString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center", maxWidth: 200 }}>
                      {leave.reason || "—"}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={{ ...styles.badge, ...getStatusStyle(leave.status) }}>
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {leave.status === "Pending" && (
                        <div style={styles.actionGroup}>
                          <button
                            onClick={() => updateLeaveStatus(leave.id, "Approved")}
                            style={{ ...styles.actionBtn, background: "#16a34a", color: "#fff" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(leave.id, "Rejected")}
                            style={{ ...styles.actionBtn, background: "#dc2626", color: "#fff" }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStyles(darkMode) {
  return {
    page: {
      width: "100%",
      minHeight: "100vh",
      background: darkMode ? "#0f172a" : "#f8fafc",
      fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
      colorScheme: darkMode ? "dark" : "light",
    },
    content: { width: "100%", padding: "2rem 2.5rem", boxSizing: "border-box" },
    titleRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 20,
      flexWrap: "wrap",
      gap: 12,
    },
    heading: {
      margin: "0 0 4px",
      fontSize: 22,
      fontWeight: 600,
      color: darkMode ? "#f9fafb" : "#111",
    },
    subtext: { fontSize: 13, color: "#6b7280", margin: 0 },
    search: {
      border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
      borderRadius: 8,
      padding: "10px 12px",
      fontSize: 14,
      outline: "none",
      color: darkMode ? "#f9fafb" : "#111",
      background: darkMode ? "#1f2937" : "#fff",
    },
    tableWrap: {
      width: "100%",
      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
      borderRadius: 10,
      overflowX: "auto",
      background: darkMode ? "#1f2937" : "#fff",
    },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
    theadRow: { background: darkMode ? "#374151" : "#f9fafb" },
    th: {
      textAlign: "left",
      padding: "11px 16px",
      fontWeight: 500,
      color: "#6b7280",
      fontSize: 12,
    },
    row: { borderTop: `1px solid ${darkMode ? "#374151" : "#f1f5f9"}` },
    td: { padding: "13px 16px", color: darkMode ? "#d1d5db" : "#374151" },
    badge: { fontSize: 12, padding: "3px 10px", borderRadius: 6, fontWeight: 500 },
    emptyCell: {
      padding: "32px 16px",
      textAlign: "center",
      color: "#9ca3af",
      fontSize: 14,
    },
    actionGroup: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    actionBtn: {
      padding: "6px 12px",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 500,
    },
  };
}
