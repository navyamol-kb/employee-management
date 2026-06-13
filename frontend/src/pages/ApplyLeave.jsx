import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

export default function ApplyLeave({ employee }) {
  const { darkMode } = useTheme();
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/leaves", {
        employee_id: employee.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      setSuccess("Leave request submitted successfully!");
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError("Failed to submit leave request. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const leaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Casual Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Other",
  ];

  const styles = {
    container: {
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      backgroundColor: darkMode ? "#0f172a" : "#f8fafc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      boxSizing: "border-box",
    },
    card: {
      width: "100%",
      maxWidth: "500px",
      backgroundColor: darkMode ? "#1e293b" : "#ffffff",
      borderRadius: "12px",
      boxShadow: darkMode
        ? "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
        : "0 20px 25px -5px rgba(0, 0, 0, 0.08)",
      padding: "40px",
      transition: "box-shadow 0.3s ease",
    },
    header: {
      marginBottom: "32px",
    },
    title: {
      margin: "0 0 8px 0",
      fontSize: "28px",
      fontWeight: "700",
      color: darkMode ? "#f1f5f9" : "#0f172a",
      letterSpacing: "-0.5px",
    },
    subtitle: {
      margin: 0,
      fontSize: "14px",
      color: darkMode ? "#94a3b8" : "#64748b",
      fontWeight: "400",
    },
    alert: {
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "24px",
      fontSize: "14px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      animation: "slideDown 0.3s ease-out",
    },
    successAlert: {
      backgroundColor: darkMode ? "#0c663d" : "#dcfce7",
      color: darkMode ? "#86efac" : "#166534",
      border: `1px solid ${darkMode ? "#16a34a" : "#86efac"}`,
    },
    errorAlert: {
      backgroundColor: darkMode ? "#7f1d1d" : "#fee2e2",
      color: darkMode ? "#fca5a5" : "#991b1b",
      border: `1px solid ${darkMode ? "#dc2626" : "#fca5a5"}`,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "13px",
      fontWeight: "600",
      color: darkMode ? "#cbd5e1" : "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    required: {
      color: "#ef4444",
      fontSize: "16px",
    },
    input: {
      padding: "11px 14px",
      fontSize: "14px",
      borderRadius: "8px",
      border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`,
      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
      color: darkMode ? "#f1f5f9" : "#0f172a",
      fontFamily: "inherit",
      transition: "all 0.2s ease",
      outline: "none",
      "&:focus": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        backgroundColor: darkMode ? "#1e293b" : "#f0f9ff",
      },
    },
    select: {
      padding: "11px 14px",
      fontSize: "14px",
      borderRadius: "8px",
      border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`,
      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
      color: darkMode ? "#f1f5f9" : "#0f172a",
      fontFamily: "inherit",
      cursor: "pointer",
      transition: "all 0.2s ease",
      outline: "none",
      appearance: "none",
      paddingRight: "32px",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${darkMode ? "%23cbd5e1" : "%23475569"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 14px center",
    },
    textarea: {
      padding: "11px 14px",
      fontSize: "14px",
      borderRadius: "8px",
      border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`,
      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
      color: darkMode ? "#f1f5f9" : "#0f172a",
      fontFamily: "inherit",
      resize: "vertical",
      minHeight: "96px",
      transition: "all 0.2s ease",
      outline: "none",
    },
    dateGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end",
      marginTop: "8px",
    },
    buttonReset: {
      padding: "10px 24px",
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "8px",
      border: `1px solid ${darkMode ? "#475569" : "#cbd5e1"}`,
      backgroundColor: darkMode ? "#0f172a" : "#f1f5f9",
      color: darkMode ? "#cbd5e1" : "#475569",
      cursor: "pointer",
      transition: "all 0.2s ease",
      outline: "none",
      "&:hover": {
        backgroundColor: darkMode ? "#1e293b" : "#e2e8f0",
      },
    },
    buttonSubmit: {
      padding: "10px 28px",
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      cursor: "pointer",
      transition: "all 0.2s ease",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      "&:hover": {
        backgroundColor: "#2563eb",
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
      },
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        ${darkMode
          ? `input:focus, select:focus, textarea:focus {
            background-color: #1e293b;
          }`
          : `input:focus, select:focus, textarea:focus {
            background-color: #f0f9ff;
          }`}

        select {
          appearance: none;
        }

        button:active {
          transform: scale(0.98);
        }

        @media (max-width: 480px) {
          div[style*="maxWidth"] {
            padding: 24px;
          }

          h2 {
            font-size: 24px;
          }
        }
      `}</style>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Request Leave</h2>
          <p style={styles.subtitle}>
            Fill in the details below to submit your leave request
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div style={{ ...styles.alert, ...styles.successAlert }}>
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div style={{ ...styles.alert, ...styles.errorAlert }}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Leave Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Leave Type <span style={styles.required}>*</span>
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              required
              style={styles.select}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div style={styles.dateGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Start Date <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                End Date <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Reason */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Reason (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide additional details about your leave request..."
              style={styles.textarea}
            />
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => {
                setLeaveType("");
                setStartDate("");
                setEndDate("");
                setReason("");
                setError("");
              }}
              style={styles.buttonReset}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = darkMode ? "#1e293b" : "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = darkMode ? "#0f172a" : "#f1f5f9";
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.buttonSubmit,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = "#2563eb";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(59, 130, 246, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#3b82f6";
                e.target.style.boxShadow = "none";
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      animation: "spin 1s linear infinite",
                    }}
                  >
                    ⟳
                  </span>
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}