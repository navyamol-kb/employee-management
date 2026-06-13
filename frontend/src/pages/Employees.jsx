import { useEffect, useState } from "react";
import api from "../services/api";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

export default function Employees({ user, onLogout, embedded = false }) {
  const { darkMode, userAvatar } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", department: "", status: "Active" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) { console.error("Failed to load employees", err); }
  };

  const loadDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) { console.error("Failed to load departments", err); }
  };

  const filtered = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const userInitials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase() : "ME";

  // Add
  const openModal = () => {
    setForm({ name: "", email: "", role: "", department: "", status: "Active" });
    setFormError("");
    setShowModal(true);
  };
  const handleFormChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.email.trim()) { setFormError("Name and email are required."); return; }
    setSaving(true);
    try {
      const res = await api.post("/employees", form);
      setEmployees((p) => [...p, res.data]);
      setShowModal(false);
    } catch (err) { setFormError(err.response?.data?.error || "Failed to add employee."); }
    finally { setSaving(false); }
  };

  // Edit
  const openEdit = (emp) => { setEditForm({ ...emp }); setEditError(""); setShowEdit(true); };
  const handleEditChange = (e) => setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError("");
    if (!editForm.name.trim() || !editForm.email.trim()) { setEditError("Name and email are required."); return; }
    setEditSaving(true);
    try {
      const res = await api.put(`/employees/${editForm.id}`, editForm);
      setEmployees((p) => p.map((emp) => emp.id === editForm.id ? res.data : emp));
      setShowEdit(false);
    } catch (err) { setEditError(err.response?.data?.error || "Failed to update employee."); }
    finally { setEditSaving(false); }
  };

  // Delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/employees/${deleteTarget.id}`);
      setEmployees((p) => p.filter((emp) => emp.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) { console.error("Delete failed", err); }
    finally { setDeleting(false); }
  };

  const styles = getStyles(darkMode);

  return (
    <>
      <style>{`
        .edit-btn:hover { background:#eef2ff!important; color:#4f46e5!important; }
        .del-btn:hover  { background:#fef2f2!important; color:#dc2626!important; }
        tr:hover td { background:#fafafa; }
      `}</style>

      <div style={embedded ? {} : styles.page}>

        {/* Standalone header — hidden when embedded in Dashboard */}
        {!embedded && (
          <header style={styles.header}>
            <div style={styles.brandRow}>
              <span style={styles.logoDot} />
              <span style={styles.brandName}>Corporate Precision</span>
            </div>
            <div style={styles.headerRight}>
              <span style={styles.userEmail}>{user?.email}</span>
              <div style={{
                ...styles.avatar,
                background: userAvatar ? "transparent" : "#eef2ff",
                backgroundImage: userAvatar ? `url(${userAvatar})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: userAvatar ? "transparent" : "#4f46e5"
              }}>{userInitials}</div>
              <button onClick={onLogout} style={styles.logoutBtn}>Log out</button>
            </div>
          </header>
        )}

        <div style={embedded ? {} : styles.content}>

          <div style={styles.titleRow}>
            <div>
              <h2 style={styles.heading}>Employees</h2>
              <p style={styles.subtext}>Manage your team members and their roles</p>
            </div>
            <button style={styles.addBtn} onClick={openModal}>+ Add employee</button>
          </div>

          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={{ ...styles.th, textAlign: "center" }}>Name</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Role</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Department</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Status</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...styles.emptyCell, textAlign: "center" }}>No employees found</td></tr>
                ) : (
                  filtered.map((emp) => (
                    <tr key={emp.id} style={styles.row}>
                      <td style={{ ...styles.tdName, textAlign: "center", justifyContent: "center" }}>
                        <span style={styles.smallAvatar}>{getInitials(emp.name)}</span>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontWeight: 500, color: darkMode ? "#f9fafb" : "#111" }}>{emp.name}</div>
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>{emp.email}</div>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>{emp.role || "—"}</td>
                      <td style={{ ...styles.td, textAlign: "center" }}>{emp.department || "—"}</td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <span style={{
                          ...styles.badge,
                          background: emp.status === "Active" ? "#eafff0" : "#fff7e6",
                          color: emp.status === "Active" ? "#15803d" : "#b45309",
                        }}>
                          {emp.status || "Active"}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <div style={styles.actionGroup}>
                          <button className="edit-btn" title="Edit" style={styles.iconBtn} onClick={() => openEdit(emp)}>
                            <FaEdit size={14} />
                          </button>
                          <button className="del-btn" title="Delete" style={styles.iconBtn} onClick={() => setDeleteTarget(emp)}>
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

        {/* Add Modal */}
        {showModal && (
          <div style={styles.overlay} onClick={() => setShowModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHead}>
                <h3 style={styles.modalTitle}>Add Employee</h3>
                <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
              </div>
              {formError && <p style={styles.errMsg}>{formError}</p>}
              <form onSubmit={handleAddEmployee} style={styles.form}>
                <Field label="Full Name *" darkMode={darkMode}>
                  <input name="name" value={form.name} onChange={handleFormChange}
                    placeholder="e.g. Sarah Johnson" style={styles.input} required />
                </Field>
                <Field label="Email *" darkMode={darkMode}>
                  <input name="email" type="email" value={form.email} onChange={handleFormChange}
                    placeholder="e.g. sarah@company.com" style={styles.input} required />
                </Field>
                <div style={styles.twoCol}>
                  <Field label="Role" darkMode={darkMode}>
                    <input name="role" value={form.role} onChange={handleFormChange}
                      placeholder="e.g. Engineer" style={styles.input} />
                  </Field>
                  <Field label="Department" darkMode={darkMode}>
                    <select name="department" value={form.department} onChange={handleFormChange} style={styles.input}>
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Status" darkMode={darkMode}>
                  <select name="status" value={form.status} onChange={handleFormChange} style={styles.input}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </Field>
                <div style={styles.modalFoot}>
                  <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" style={{ ...styles.addBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                    {saving ? "Saving…" : "Add Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEdit && editForm && (
          <div style={styles.overlay} onClick={() => setShowEdit(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHead}>
                <h3 style={styles.modalTitle}>Edit Employee</h3>
                <button onClick={() => setShowEdit(false)} style={styles.closeBtn}>✕</button>
              </div>
              {editError && <p style={styles.errMsg}>{editError}</p>}
              <form onSubmit={handleEditSave} style={styles.form}>
                <Field label="Full Name *" darkMode={darkMode}>
                  <input name="name" value={editForm.name} onChange={handleEditChange} style={styles.input} required />
                </Field>
                <Field label="Email *" darkMode={darkMode}>
                  <input name="email" type="email" value={editForm.email} onChange={handleEditChange} style={styles.input} required />
                </Field>
                <div style={styles.twoCol}>
                  <Field label="Role" darkMode={darkMode}>
                    <input name="role" value={editForm.role || ""} onChange={handleEditChange} style={styles.input} />
                  </Field>
                  <Field label="Department" darkMode={darkMode}>
                    <select name="department" value={editForm.department || ""} onChange={handleEditChange} style={styles.input}>
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Status" darkMode={darkMode}>
                  <select name="status" value={editForm.status || "Active"} onChange={handleEditChange} style={styles.input}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </Field>
                <div style={styles.modalFoot}>
                  <button type="button" onClick={() => setShowEdit(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" style={{ ...styles.addBtn, opacity: editSaving ? 0.7 : 1 }} disabled={editSaving}>
                    {editSaving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteTarget && (
          <div style={styles.overlay} onClick={() => setDeleteTarget(null)}>
            <div style={{ ...styles.modal, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHead}>
                <h3 style={styles.modalTitle}>Delete Employee</h3>
                <button onClick={() => setDeleteTarget(null)} style={styles.closeBtn}>✕</button>
              </div>
              <p style={{ fontSize: 14, color: darkMode ? "#9ca3af" : "#4b5563", margin: "0 0 24px" }}>
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
              <div style={styles.modalFoot}>
                <button onClick={() => setDeleteTarget(null)} style={styles.cancelBtn}>Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  style={{ ...styles.addBtn, background: "#dc2626", opacity: deleting ? 0.7 : 1 }}>
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
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
    header: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 2.5rem", borderBottom: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, background: darkMode ? "#1f2937" : "#fff", boxSizing: "border-box" },
    brandRow: { display: "flex", alignItems: "center", gap: 10 },
    logoDot: { width: 24, height: 24, borderRadius: 6, background: "#aa3bff", display: "inline-block" },
    brandName: { fontWeight: 600, fontSize: 15, color: darkMode ? "#f9fafb" : "#1e293b" },
    headerRight: { display: "flex", alignItems: "center", gap: 12 },
    userEmail: { fontSize: 13, color: "#6b7280" },
    avatar: { width: 32, height: 32, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#4f46e5" },
    logoutBtn: { background: "none", border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`, borderRadius: 6, padding: "5px 12px", fontSize: 13, color: "#6b7280", cursor: "pointer" },
    content: { width: "100%", padding: "2rem 2.5rem", boxSizing: "border-box" },
    titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 },
    heading: { margin: "0 0 4px", fontSize: 22, fontWeight: 600, color: darkMode ? "#f9fafb" : "#111" },
    subtext: { fontSize: 13, color: "#6b7280", margin: 0 },
    addBtn: { background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 500, fontSize: 14, cursor: "pointer" },
    search: { width: "100%", maxWidth: 300, border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box", color: darkMode ? "#f9fafb" : "#111", background: darkMode ? "#1f2937" : "#fff" },
    tableWrap: { width: "100%", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: 10, overflowX: "auto", background: darkMode ? "#1f2937" : "#fff" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
    theadRow: { background: darkMode ? "#374151" : "#f9fafb" },
    th: { textAlign: "left", padding: "11px 16px", fontWeight: 500, color: "#6b7280", fontSize: 12 },
    row: { borderTop: `1px solid ${darkMode ? "#374151" : "#f1f5f9"}` },
    td: { padding: "13px 16px", color: darkMode ? "#d1d5db" : "#374151" },
    tdName: { padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 },
    smallAvatar: { width: 34, height: 34, borderRadius: "50%", background: "#eef2ff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#4f46e5" },
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
    twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    input: { border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", background: darkMode ? "#111827" : "#fff", color: darkMode ? "#f9fafb" : "#111", width: "100%", boxSizing: "border-box" },
    errMsg: { fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "8px 12px", marginBottom: 4 },
    modalFoot: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 },
    cancelBtn: { background: "none", border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`, borderRadius: 8, padding: "9px 16px", fontSize: 14, color: "#6b7280", cursor: "pointer" },
  };
}
