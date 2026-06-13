import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

export default function EmployeeProfile({ employee, setEmployee }) {
  const { darkMode } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "", department: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        role: employee.role || "",
        department: employee.department || "",
      });
      setAvatarPreview(employee.avatar);
    }
  }, [employee]);

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Updating employee with data:", { ...formData, avatar: avatarPreview ? "data URL present" : "null" });
      const res = await api.put(`/employees/${employee.id}`, {
        ...formData,
        avatar: avatarPreview,
      });
      console.log("Response from backend:", res.data);
      setEmployee(res.data);
      localStorage.setItem("cp_employee", JSON.stringify(res.data)); // Save to localStorage
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
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
          width: "100%",
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
          <h2 style={{ margin: 0, color: darkMode ? "#f9fafb" : "#1f2937" }}>My Profile</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: avatarPreview ? "transparent" : "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: 700,
                color: "#ffffff",
                border: `3px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
                overflow: "hidden",
                position: "relative"
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
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
            {editMode && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                    backgroundColor: darkMode ? "#111827" : "#f9fafb",
                    color: darkMode ? "#d1d5db" : "#374151",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Change Photo
                </button>
              </>
            )}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                      backgroundColor: darkMode ? "#111827" : "#ffffff",
                      color: darkMode ? "#f9fafb" : "#1f2937",
                      fontSize: 14,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: darkMode ? "#111827" : "#f3f4f6",
                      color: darkMode ? "#f9fafb" : "#1f2937",
                      fontSize: 14,
                    }}
                  >
                    {employee?.name}
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                      backgroundColor: darkMode ? "#111827" : "#ffffff",
                      color: darkMode ? "#f9fafb" : "#1f2937",
                      fontSize: 14,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: darkMode ? "#111827" : "#f3f4f6",
                      color: darkMode ? "#f9fafb" : "#1f2937",
                      fontSize: 14,
                    }}
                  >
                    {employee?.email}
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Role
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                      backgroundColor: darkMode ? "#111827" : "#ffffff",
                      color: darkMode ? "#f9fafb" : "#1f2937",
                      fontSize: 14,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: darkMode ? "#111827" : "#f3f4f6",
                      color: darkMode ? "#f9fafb" : "#1f2937",
                      fontSize: 14,
                    }}
                  >
                    {employee?.role || "—"}
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: darkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Department
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                      backgroundColor: darkMode ? "#111827" : "#ffffff",
                      color: darkMode ? "#f9fafb" : "#1f2937",
                      fontSize: 14,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: darkMode ? "#111827" : "#f3f4f6",
                      color: darkMode ? "#f9fafb" : "#1f2937",
                      fontSize: 14,
                    }}
                  >
                    {employee?.department || "—"}
                  </div>
                )}
              </div>
            </div>

            {editMode && (
              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleSave}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: "#7c3aed",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}