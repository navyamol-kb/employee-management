
import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaCalendarAlt } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

export default function Attendance({ embedded = false }) {
  const { darkMode } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "Present"
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAttendance();
    loadEmployees();
  }, []);

  const loadAttendance = async () => {
    try {
      let url = "/attendance";
      const params = [];
      if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
      }
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const res = await api.get(url);

      // Filter by dates client-side
      let filtered = res.data;
      if (startDate) {
        filtered = filtered.filter(record => new Date(record.date) >= new Date(startDate));
      }
      if (endDate) {
        filtered = filtered.filter(record => new Date(record.date) <= new Date(endDate));
      }
      
      setAttendance(filtered);
    } catch (err) {
      console.error("Failed to load attendance", err);
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

  // Debounce search and date filter
  useEffect(() => {
    const timer = setTimeout(() => loadAttendance(), 300);
    return () => clearTimeout(timer);
  }, [search, startDate, endDate]);

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setFormData({
      employee_id: "",
      date: new Date().toISOString().split("T")[0],
      status: "Present"
    });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (record) => {
    setModalMode("edit");
    setEditingId(record.id);
    setFormData({
      employee_id: record.employee_id,
      date: record.date,
      status: record.status
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (modalMode === "add") {
        const res = await api.post("/attendance", formData);
        setAttendance([res.data, ...attendance]);
      } else {
        const res = await api.put(`/attendance/${editingId}`, formData);
        setAttendance(attendance.map(a => a.id === editingId ? res.data : a));
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/attendance/${deleteTarget.id}`);
      setAttendance(attendance.filter(a => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Present") {
      return { background: darkMode ? "#14532d" : "#dcfce7", color: "#15803d" };
    } else if (status === "Absent") {
      return { background: darkMode ? "#7f1d1d" : "#fee2e2", color: "#dc2626" };
    } else {
      return { background: darkMode ? "#713f12" : "#fef9c3", color: "#a16207" };
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const styles = getStyles(darkMode);

  return (
    <div style={embedded ? {} : styles.page}>
      <div style={embedded ? {} : styles.content}>
        <div style={styles.titleRow}>
          <div>
            <h2 style={styles.heading}>Attendance Management</h2>
            <p style={styles.subtext}>Mark and manage employee attendance</p>
          </div>
          <button style={styles.addBtn} onClick={handleOpenAdd}>
            <FaPlus style={{ marginRight: 8 }} />
            Mark Attendance
          </button>
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
              flex: "none"
            }}
          />
          <input
            type="date"
            placeholder="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              ...styles.search,
              width: 160,
              height: 44,
              boxSizing: "border-box",
              flex: "none"
            }}
          />
          <input
            type="date"
            placeholder="End date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              ...styles.search,
              width: 160,
              height: 44,
              boxSizing: "border-box",
              flex: "none"
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
                background: darkMode ? "#111827" : "#fff",
                color: darkMode ? "#f9fafb" : "#374151",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none"
              }}
            >
              Reset
            </button>
          )}
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={{ ...styles.th, textAlign: "center" }}>Employee</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Date</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Status</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ ...styles.emptyCell, textAlign: "center" }}>Loading...</td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...styles.emptyCell, textAlign: "center" }}>
                    {search ? "No results found" : "No attendance records yet"}
                  </td>
                </tr>
              ) : (
                attendance.map(record => (
                  <tr key={record.id} style={styles.row}>
                    <td style={{ ...styles.td, textAlign: "center", fontWeight: 500 }}>
                      {record.employee_name}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {formatDate(record.date)}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={{ ...styles.badge, ...getStatusStyle(record.status) }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={styles.actionGroup}>
                        <button
                          className="edit-btn"
                          title="Edit"
                          style={styles.iconBtn}
                          onClick={() => handleOpenEdit(record)}
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          className="del-btn"
                          title="Delete"
                          style={styles.iconBtn}
                          onClick={() => setDeleteTarget(record)}
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHead}>
              <h3 style={styles.modalTitle}>
                {modalMode === "add" ? "Mark Attendance" : "Edit Attendance"}
              </h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            {formError && <p style={styles.errMsg}>{formError}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <Field label="Employee *" darkMode={darkMode}>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: parseInt(e.target.value) })}
                  style={styles.input}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date *" darkMode={darkMode}>
                <div style={{ position: "relative" }}>
                  <FaCalendarAlt style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ ...styles.input, paddingLeft: 40 }}
                    required
                  />
                </div>
              </Field>

              <Field label="Status *" darkMode={darkMode}>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </Field>

              <div style={styles.modalFoot}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...styles.addBtn, opacity: saving ? 0.7 : 1 }}
                  disabled={saving}
                >
                  {saving ? "Saving…" : modalMode === "add" ? "Mark Attendance" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div style={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div style={{ ...styles.modal, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHead}>
              <h3 style={styles.modalTitle}>Delete Attendance</h3>
              <button onClick={() => setDeleteTarget(null)} style={styles.closeBtn}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: darkMode ? "#9ca3af" : "#4b5563", margin: "0 0 24px" }}>
              Are you sure you want to delete attendance for <strong>{deleteTarget.employee_name}</strong>?
            </p>
            <div style={styles.modalFoot}>
              <button onClick={() => setDeleteTarget(null)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ ...styles.addBtn, background: "#dc2626", opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, darkMode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: darkMode ? "#d1d5db" : "#374151" }}>{label}</label>
      {children}
    </div>
  );
}

function getStyles(darkMode) {
  return {
    page: { width: "100%", minHeight: "100vh", background: darkMode ? "#0f172a" : "#f8fafc", fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif", colorScheme: darkMode ? "dark" : "light" },
    content: { width: "100%", padding: "2rem 2.5rem", boxSizing: "border-box" },
    titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 },
    heading: { margin: "0 0 4px", fontSize: 22, fontWeight: 600, color: darkMode ? "#f9fafb" : "#111" },
    subtext: { fontSize: 13, color: "#6b7280", margin: 0 },
    addBtn: { background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 500, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center" },
    search: { width: "100%", maxWidth: 300, border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box", color: darkMode ? "#f9fafb" : "#111", background: darkMode ? "#1f2937" : "#fff" },
    tableWrap: { width: "100%", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: 10, overflowX: "auto", background: darkMode ? "#1f2937" : "#fff" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
    theadRow: { background: darkMode ? "#374151" : "#f9fafb" },
    th: { textAlign: "left", padding: "11px 16px", fontWeight: 500, color: "#6b7280", fontSize: 12 },
    row: { borderTop: `1px solid ${darkMode ? "#374151" : "#f1f5f9"}` },
    td: { padding: "13px 16px", color: darkMode ? "#d1d5db" : "#374151" },
    badge: { fontSize: 12, padding: "3px 10px", borderRadius: 6, fontWeight: 500 },
    emptyCell: { padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 },
    actionGroup: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
    iconBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 6, border: `1px solid ${darkMode ? "#4b5563" : "#e5e7eb"}`, background: "none", cursor: "pointer", color: "#6b7280", transition: "all 0.15s" },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modal: { background: darkMode ? "#1f2937" : "#fff", borderRadius: 12, width: "100%", maxWidth: 480, padding: "1.5rem", boxSizing: "border-box", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", margin: "1rem" },
    modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { margin: 0, fontSize: 17, fontWeight: 600, color: darkMode ? "#f9fafb" : "#111" },
    closeBtn: { background: "none", border: "none", fontSize: 16, color: "#9ca3af", cursor: "pointer" },
    form: { display: "flex", flexDirection: "column", gap: 14 },
    input: { border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", background: darkMode ? "#111827" : "#fff", color: darkMode ? "#f9fafb" : "#111", width: "100%", boxSizing: "border-box" },
    errMsg: { fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "8px 12px", marginBottom: 4 },
    modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 },
    cancelBtn: { background: "none", border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`, borderRadius: 8, padding: "9px 16px", fontSize: 14, color: "#6b7280", cursor: "pointer" },
  };
}
