
import { useState, useEffect, useCallback } from "react";

import { 
  FaBuilding, 
  FaCheckCircle, 
  FaUsers, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes,
  FaExclamationCircle
} from "react-icons/fa";

import { useTheme } from "../contexts/ThemeContext";

const API = "http://localhost:5000";

const EMPTY_FORM = {
  name: "",
  description: "",
  manager: "",
  employee_count: "",
  status: "Active",
};

function StatCard({ icon: Icon, label, value, color, darkMode }) {
  const colors = {
    purple: { bg: darkMode ? "#312e81" : "#F5EAFF", text: "#AA3BFF" },
    green: { bg: darkMode ? "#14532d" : "#EAF3DE", text: "#3B6D11" },
    blue: { bg: darkMode ? "#1e3a5f" : "#E6F1FB", text: "#185FA5" },
  };

  const c = colors[color] || colors.purple;

  return (
    <div style={getStatCardStyles(darkMode)}>
      <div style={{ ...getStatIconStyles(), background: c.bg }}>
        <Icon />
      </div>
      <div>
        <p style={getStatLabelStyles(darkMode)}>{label}</p>
        <p style={getStatValueStyles(darkMode)}>{value}</p>
      </div>
    </div>
  );
}

function Badge({ status, darkMode }) {
  const active = status === "Active";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 500,
        background: active ? (darkMode ? "#14532d" : "#EAF3DE") : (darkMode ? "#78350f" : "#F1EFE8"),
        color: active ? "#3B6D11" : "#5F5E5A",
      }}
    >
      {status}
    </span>
  );
}

function Modal({ onClose, children, darkMode }) {
  return (
    <div style={getOverlayStyles(darkMode)} onClick={(e) => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
}

function DeptModal({ mode, initial, onSave, onClose, darkMode }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Department name is required.");
    if (!form.manager.trim()) return setError("Manager name is required.");
    setError("");
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} darkMode={darkMode}>
      <div style={getModalStyles(darkMode)}>
        <div style={getModalHeadStyles(darkMode)}>
          <h2 style={getModalTitleStyles(darkMode)}>
            {mode === "add" ? "Add New Department" : "Edit Department"}
          </h2>
          <button style={getIconBtnStyles(darkMode)} onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div style={getModalBodyStyles(darkMode)}>
          {error && <p style={getFormErrorStyles(darkMode)}>{error}</p>}
          <div style={getFormRowStyles(darkMode)}>
            <label style={getLabelStyles(darkMode)}>Department Name *</label>
            <input
              style={getInputStyles(darkMode)}
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Engineering"
            />
          </div>
          <div style={getFormRowStyles(darkMode)}>
            <label style={getLabelStyles(darkMode)}>Description</label>
            <textarea
              style={{ ...getInputStyles(darkMode), minHeight: 80, resize: "vertical" }}
              value={form.description}
              onChange={set("description")}
              placeholder="Brief description of this department"
            />
          </div>
          <div style={getFormRowStyles(darkMode)}>
            <label style={getLabelStyles(darkMode)}>Manager *</label>
            <input
              style={getInputStyles(darkMode)}
              value={form.manager}
              onChange={set("manager")}
              placeholder="Manager's full name"
            />
          </div>
          <div style={getFormRowStyles(darkMode)}>
            <label style={getLabelStyles(darkMode)}>Employee Count</label>
            <input
              style={getInputStyles(darkMode)}
              type="number"
              min="0"
              value={form.employee_count}
              onChange={set("employee_count")}
              placeholder="0"
            />
          </div>
          <div style={getFormRowStyles(darkMode)}>
            <label style={getLabelStyles(darkMode)}>Status</label>
            <select style={getInputStyles(darkMode)} value={form.status} onChange={set("status")}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div style={getModalFootStyles(darkMode)}>
          <button style={getBtnGhostStyles(darkMode)} onClick={onClose}>Cancel</button>
          <button style={getBtnPrimaryStyles(darkMode)} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : mode === "add" ? "Create Department" : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteModal({ dept, onConfirm, onClose, darkMode }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} darkMode={darkMode}>
      <div style={getConfirmModalStyles(darkMode)}>
        <div style={getConfirmIconStyles(darkMode)}>
          <FaTrash />
        </div>
        <h2 style={getConfirmTitleStyles(darkMode)}>
          Delete Department
        </h2>
        <p style={getConfirmTextStyles(darkMode)}>
          Are you sure you want to delete <strong>{dept.name}</strong>? This
          action cannot be undone and will remove all associated data.
        </p>
        <div style={getConfirmBtnContainerStyles(darkMode)}>
          <button style={getBtnGhostStyles(darkMode)} onClick={onClose}>Cancel</button>
          <button style={getBtnDangerStyles(darkMode)} onClick={handleConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete Department"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Departments() {
  const { darkMode } = useTheme();
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [apiError, setApiError] = useState("");

  const fetchDepts = useCallback(async (q = "") => {
    try {
      const url = q
        ? `${API}/departments?search=${encodeURIComponent(q)}`
        : `${API}/departments`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDepts(data);
      setApiError("");
    } catch {
      setApiError("Could not load departments. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepts();
  }, [fetchDepts]);

  useEffect(() => {
    const t = setTimeout(() => fetchDepts(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchDepts]);

  const handleAdd = async (form) => {
    const res = await fetch(`${API}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        employee_count: parseInt(form.employee_count) || 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create");
    await fetchDepts(search);
  };

  const handleEdit = async (form) => {
    const res = await fetch(`${API}/departments/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        employee_count: parseInt(form.employee_count) || 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    await fetchDepts(search);
  };

  const handleDelete = async () => {
    const res = await fetch(`${API}/departments/${selected.id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete");
    await fetchDepts(search);
  };

  const openEdit = (dept) => {
    setSelected(dept);
    setModal("edit");
  };

  const openDelete = (dept) => {
    setSelected(dept);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const totalDepts = depts.length;
  const activeDepts = depts.filter((d) => d.status === "Active").length;
  const totalEmployees = depts.reduce((s, d) => s + (d.employee_count || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div style={getPageStyles(darkMode)}>
      <div style={getPageHeaderStyles(darkMode)}>
        <div>
          <h1 style={getPageTitleStyles(darkMode)}>Departments</h1>
          <p style={getPageSubtitleStyles(darkMode)}>Manage your organization's departments and teams</p>
        </div>
        <button style={getBtnPrimaryStyles(darkMode)} onClick={() => setModal("add")}>
          <FaPlus /> Add Department
        </button>
      </div>

      {apiError && (
        <div style={getApiErrorStyles(darkMode)}>
          <FaExclamationCircle /> {apiError}
        </div>
      )}

      <div style={getCardsGridStyles(darkMode)}>
        <StatCard icon={FaBuilding} label="Total Departments" value={totalDepts} color="purple" darkMode={darkMode} />
        <StatCard icon={FaCheckCircle} label="Active Departments" value={activeDepts} color="green" darkMode={darkMode} />
        <StatCard icon={FaUsers} label="Total Employees" value={totalEmployees} color="blue" darkMode={darkMode} />
      </div>

      <div style={getTableCardStyles(darkMode)}>
        <div style={getToolbarStyles(darkMode)}>
          <div style={getSearchBoxStyles(darkMode)}>
            <FaSearch style={{ color: "#9ca3af", fontSize: 14 }} />
            <input
              style={getSearchInputStyles(darkMode)}
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
                onClick={() => setSearch("")}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            {depts.length} department{depts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={getTableStyles(darkMode)}>
            <colgroup>
              <col style={{ width: 160 }} />
              <col style={{ width: 220 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 90 }} />
            </colgroup>
            <thead>
              <tr>
                {["Department Name", "Description", "Manager", "Employees", "Status", "Created Date", "Actions"].map(
                  (col) => (
                    <th key={col} style={{ ...getThStyles(darkMode), textAlign: "center" }}>{col}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ ...getEmptyCellStyles(darkMode), textAlign: "center" }}>Loading departments...</td>
                </tr>
              ) : depts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...getEmptyCellStyles(darkMode), textAlign: "center" }}>
                    {search ? `No departments matching "${search}"` : "No departments found. Add your first one!"}
                  </td>
                </tr>
              ) : (
                depts.map((dept) => (
                  <tr key={dept.id} style={getTrStyles(darkMode)}>
                    <td style={{ ...getTdStyles(darkMode), fontWeight: 500, textAlign: "center" }}>{dept.name}</td>
                    <td style={{ ...getTdStyles(darkMode), color: "#6b7280", fontSize: 13, textAlign: "center" }}>
                      {dept.description || "—"}
                    </td>
                    <td style={{ ...getTdStyles(darkMode), textAlign: "center" }}>{dept.manager}</td>
                    <td style={{ ...getTdStyles(darkMode), textAlign: "center" }}>
                      {dept.employee_count ?? 0}
                    </td>
                    <td style={{ ...getTdStyles(darkMode), textAlign: "center" }}>
                      <Badge status={dept.status} darkMode={darkMode} />
                    </td>
                    <td style={{ ...getTdStyles(darkMode), color: "#6b7280", fontSize: 13, textAlign: "center" }}>
                      {formatDate(dept.created_at)}
                    </td>
                    <td style={{ ...getTdStyles(darkMode), textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        <button
                          style={getEditBtnStyles(darkMode)}
                          onClick={() => openEdit(dept)}
                          title="Edit"
                          aria-label={`Edit ${dept.name}`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          style={getDeleteBtnStyles(darkMode)}
                          onClick={() => openDelete(dept)}
                          title="Delete"
                          aria-label={`Delete ${dept.name}`}
                        >
                          <FaTrash />
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

      {modal === "add" && (
        <DeptModal mode="add" initial={EMPTY_FORM} onSave={handleAdd} onClose={closeModal} darkMode={darkMode} />
      )}

      {modal === "edit" && selected && (
        <DeptModal
          mode="edit"
          initial={{
            name: selected.name,
            description: selected.description || "",
            manager: selected.manager,
            employee_count: selected.employee_count ?? "",
            status: selected.status,
          }}
          onSave={handleEdit}
          onClose={closeModal}
          darkMode={darkMode}
        />
      )}

      {modal === "delete" && selected && (
        <DeleteModal dept={selected} onConfirm={handleDelete} onClose={closeModal} darkMode={darkMode} />
      )}
    </div>
  );
}

function getStatCardStyles(darkMode) {
  return {
    background: darkMode ? "#1f2937" : "#fff",
    border: `0.5px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
    borderRadius: 12,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16,
  };
}

function getStatIconStyles(bg) {
  return {
    width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 };
}

function getStatLabelStyles(darkMode) {
  return { fontSize: 12, color: "#9ca3af", marginBottom: 4 };
}

function getStatValueStyles(darkMode) {
  return { fontSize: 22, fontWeight: 500, color: darkMode ? "#f9fafb" : "#111" };
}

function getOverlayStyles(darkMode) {
  return { position: "fixed", inset: 0, background: "rgba(37, 99, 235, 0.15)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
}

function getModalStyles(darkMode) {
  return { background: darkMode ? "#1f2937" : "#fff", borderRadius: 12, width: 460, maxWidth: "90vw", border: `0.5px solid ${darkMode ? "#374151" : "#e5e7eb"}`, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" };
}

function getModalHeadStyles(darkMode) {
  return { padding: "20px 24px 16px", borderBottom: `0.5px solid ${darkMode ? "#374151" : "#e5e7eb"}`, display: "flex", alignItems: "center", justifyContent: "space-between" };
}

function getModalTitleStyles(darkMode) {
  return { margin: 0, fontSize: 16, fontWeight: 500, color: darkMode ? "#f9fafb" : "#111" };
}

function getModalBodyStyles(darkMode) {
  return { padding: "20px 24px" };
}

function getModalFootStyles(darkMode) {
  return { padding: "16px 24px", borderTop: `0.5px solid ${darkMode ? "#374151" : "#e5e7eb"}`, display: "flex", justifyContent: "flex-end", gap: 10 };
}

function getIconBtnStyles(darkMode) {
  return { width: 30, height: 30, borderRadius: 6, border: `0.5px solid ${darkMode ? "#4b5563" : "#e5e7eb"}`, background: darkMode ? "#111827" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#9ca3af" };
}

function getFormRowStyles(darkMode) {
  return { marginBottom: 16 };
}

function getLabelStyles(darkMode) {
  return { display: "block", fontSize: 12.5, fontWeight: 500, color: darkMode ? "#d1d5db" : "#374151", marginBottom: 6 };
}

function getInputStyles(darkMode) {
  return { width: "100%", padding: "9px 12px", border: `0.5px solid ${darkMode ? "#4b5563" : "#d1d5db"}`, borderRadius: 8, fontSize: 13.5, color: darkMode ? "#f9fafb" : "#111", outline: "none", boxSizing: "border-box", background: darkMode ? "#111827" : "#fff" };
}

function getFormErrorStyles(darkMode) {
  return { color: "#E24B4A", fontSize: 13, marginBottom: 12, background: darkMode ? "#7f1d1d" : "#FCEBEB", padding: "8px 12px", borderRadius: 6, border: "1px solid #fecaca" };
}

function getConfirmModalStyles(darkMode) {
  return { background: darkMode ? "#1f2937" : "#fff", borderRadius: 12, width: 380, maxWidth: "90vw", border: `0.5px solid ${darkMode ? "#374151" : "#e5e7eb"}`, padding: "28px 24px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" };
}

function getConfirmIconStyles(darkMode) {
  return { width: 52, height: 52, borderRadius: "50%", background: darkMode ? "#7f1d1d" : "#FCEBEB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, color: "#E24B4A" };
}

function getConfirmTitleStyles(darkMode) {
  return { margin: 0, fontSize: 16, fontWeight: 500, color: darkMode ? "#f9fafb" : "#111", marginBottom: 8 };
}

function getConfirmTextStyles(darkMode) {
  return { fontSize: 13.5, color: "#9ca3af", lineHeight: 1.6, marginBottom: 20 };
}

function getConfirmBtnContainerStyles(darkMode) {
  return { display: "flex", gap: 10, justifyContent: "center" };
}

function getBtnPrimaryStyles(darkMode) {
  return { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: "pointer", border: "none", background: "#7c3aed", color: "#fff" };
}

function getBtnGhostStyles(darkMode) {
  return { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: "pointer", background: "transparent", color: darkMode ? "#9ca3af" : "#374151", border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}` };
}

function getBtnDangerStyles(darkMode) {
  return { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: "pointer", border: "none", background: "#E24B4A", color: "#fff" };
}

function getPageStyles(darkMode) {
  return { padding: 24, fontFamily: "Inter, sans-serif" };
}

function getPageHeaderStyles(darkMode) {
  return { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 };
}

function getPageTitleStyles(darkMode) {
  return { fontSize: 20, fontWeight: 500, color: darkMode ? "#f9fafb" : "#111" };
}

function getPageSubtitleStyles(darkMode) {
  return { fontSize: 13, color: "#9ca3af", marginTop: 4 };
}

function getApiErrorStyles(darkMode) {
  return {
    background: darkMode ? "#7f1d1d" : "#FCEBEB", border: `0.5px solid #F09595`, borderRadius: 8, padding: "10px 16px", fontSize: 13, color: darkMode ? "#fca5a5" : "#A32D2D", marginBottom: 16, display: "flex", alignItems: "center", gap: 8
  };
}

function getCardsGridStyles(darkMode) {
  return { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 };
}

function getTableCardStyles(darkMode) {
  return { background: darkMode ? "#1f2937" : "#fff", border: `0.5px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: 12, overflow: "hidden" };
}

function getToolbarStyles(darkMode) {
  return { display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: `0.5px solid ${darkMode ? "#374151" : "#e5e7eb"}` };
}

function getSearchBoxStyles(darkMode) {
  return { display: "flex", alignItems: "center", gap: 8, background: darkMode ? "#374151" : "#F9FAFB", border: `0.5px solid ${darkMode ? "#4b5563" : "#e5e7eb"}`, borderRadius: 8, padding: "7px 12px", width: 280 };
}

function getSearchInputStyles(darkMode) {
  return { background: "none", border: "none", outline: "none", fontSize: 13, color: darkMode ? "#f9fafb" : "#111", flex: 1 };
}

function getTableStyles(darkMode) {
  return { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
}

function getThStyles(darkMode) {
  return { padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#9ca3af", background: darkMode ? "#374151" : "#F9FAFB", borderBottom: `0.5px solid ${darkMode ? "#374151" : "#e5e7eb"}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
}

function getTrStyles(darkMode) {
  return { borderBottom: `0.5px solid ${darkMode ? "#374151" : "#e5e7eb"}`, transition: "background 0.1s" };
}

function getTdStyles(darkMode) {
  return { padding: "12px 16px", fontSize: 13.5, color: darkMode ? "#d1d5db" : "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
}

function getEmptyCellStyles(darkMode) {
  return { padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 };
}

function getEditBtnStyles(darkMode) {
  return { width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${darkMode ? "#4b5563" : "#e5e7eb"}`, background: darkMode ? "#111827" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#9ca3af", transition: "all 0.15s" };
}

function getDeleteBtnStyles(darkMode) {
  return { width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${darkMode ? "#4b5563" : "#e5e7eb"}`, background: darkMode ? "#111827" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#9ca3af", transition: "all 0.15s" };
}
