
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./src/db");
const createTables = require("./src/createTables");

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload size limit to 10MB

// Initialize tables on startup
createTables();

app.get("/", (req, res) => res.json({ message: "CorpPulse API Running" }));

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

app.post("/register", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { name, email, password, role = "employee" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const userResult = await client.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *",
      [email, password, role]
    );
    const user = userResult.rows[0];

    const empResult = await client.query(
      "INSERT INTO employees (name, email, user_id) VALUES ($1, $2, $3) RETURNING *",
      [name, email, user.id]
    );
    const employee = empResult.rows[0];

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Registration successful",
      user: { id: user.id, email: user.email, role: user.role },
      employee,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    const user = userResult.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
    const empResult = await pool.query("SELECT * FROM employees WHERE email = $1", [email]);
    const employee = empResult.rows[0];
    res.json({
      success: true,
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role },
      employee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ─────────────────────────────────────────────
// EMPLOYEES
// ─────────────────────────────────────────────

// Get all employees
app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// Get single employee
app.get("/employees/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// Add employee
app.post("/employees", async (req, res) => {
  try {
    const name       = req.body.name?.trim()       || null;
    const email      = req.body.email?.trim()      || null;
    const role       = req.body.role?.trim()       || null;
    const department = req.body.department?.trim() || null;
    const status     = req.body.status?.trim()     || "Active";

    const result = await pool.query(
      `INSERT INTO employees (name, email, role, department, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, role, department, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505")
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: "Database Error" });
  }
});

// Update employee
app.put("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("=== BACKEND UPDATE EMPLOYEE ===");
    console.log("Received update request for employee ID:", id);
    console.log("Request body (avatar):", req.body.avatar ? "Data URL present" : "null/undefined");
    console.log("Full request body:", { ...req.body, avatar: req.body.avatar ? "DATA_URL" : null });

    const name       = req.body.name?.trim()       || null;
    const email      = req.body.email?.trim()      || null;
    const role       = req.body.role?.trim()       || null;
    const department = req.body.department?.trim() || null;
    const status     = req.body.status?.trim()     || "Active";
    const avatar     = req.body.avatar             || null;

    console.log("Prepared update values:", { name, email, role, department, status, avatar: avatar ? "DATA_URL" : null });

    const result = await pool.query(
      `UPDATE employees
       SET name=$1, email=$2, role=$3, department=$4, status=$5, avatar=$6
       WHERE id=$7 RETURNING *`,
      [name, email, role, department, status, avatar, id]
    );
    console.log("Update result row count:", result.rowCount);
    console.log("Returned employee data:", { ...result.rows[0], avatar: result.rows[0]?.avatar ? "DATA_URL" : null });

    // Verify by selecting from DB again
    const verifyResult = await pool.query("SELECT * FROM employees WHERE id = $1", [id]);
    console.log("Verified employee from DB after update:", { ...verifyResult.rows[0], avatar: verifyResult.rows[0]?.avatar ? "DATA_URL" : null });

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Employee not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating employee:", err);
    if (err.code === "23505")
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: "Database Error" });
  }
});

// Delete employee
app.delete("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM employees WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// ─────────────────────────────────────────────
// DEPARTMENTS
// ─────────────────────────────────────────────

// Get all departments
app.get("/departments", async (req, res) => {
  try {
    const { search } = req.query;
    let query, params;
    if (search && search.trim()) {
      query = `SELECT * FROM departments WHERE name ILIKE $1 OR manager ILIKE $1 OR description ILIKE $1 ORDER BY id`;
      params = [`%${search.trim()}%`];
    } else {
      query = "SELECT * FROM departments ORDER BY id";
      params = [];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// Create department
app.post("/departments", async (req, res) => {
  try {
    const name           = req.body.name?.trim()           || null;
    const description    = req.body.description?.trim()    || null;
    const manager        = req.body.manager?.trim()        || null;
    const employee_count = parseInt(req.body.employee_count) || 0;
    const status         = req.body.status?.trim()         || "Active";
    if (!name) return res.status(400).json({ error: "Department name is required" });
    if (!manager) return res.status(400).json({ error: "Manager name is required" });

    const result = await pool.query(
      `INSERT INTO departments (name, description, manager, employee_count, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, manager, employee_count, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return res.status(409).json({ error: "Department name already exists" });
    res.status(500).json({ error: "Database Error" });
  }
});

// Update department
app.put("/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const name           = req.body.name?.trim()           || null;
    const description    = req.body.description?.trim()    || null;
    const manager        = req.body.manager?.trim()        || null;
    const employee_count = parseInt(req.body.employee_count) || 0;
    const status         = req.body.status?.trim()         || "Active";
    if (!name) return res.status(400).json({ error: "Department name is required" });
    if (!manager) return res.status(400).json({ error: "Manager name is required" });

    const result = await pool.query(
      `UPDATE departments
       SET name=$1, description=$2, manager=$3, employee_count=$4, status=$5
       WHERE id=$6 RETURNING *`,
      [name, description, manager, employee_count, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Department not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return res.status(409).json({ error: "Department name already exists" });
    res.status(500).json({ error: "Database Error" });
  }
});

// Delete department
app.delete("/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query("SELECT id FROM departments WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Department not found" });
    await pool.query("DELETE FROM departments WHERE id = $1", [id]);
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────

app.get("/attendance", async (req, res) => {
  try {
    const { search, employee_id } = req.query;
    let query = `SELECT a.*, e.name as employee_name FROM attendance a JOIN employees e ON a.employee_id = e.id`;
    const params = [];
    const conditions = [];

    if (employee_id) {
      conditions.push(`a.employee_id = $${params.length + 1}`);
      params.push(employee_id);
    }
    if (search && search.trim()) {
      conditions.push(`e.name ILIKE $${params.length + 1}`);
      params.push(`%${search.trim()}%`);
    }
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    query += ` ORDER BY a.date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

app.post("/attendance", async (req, res) => {
  try {
    const { employee_id, date, status } = req.body;
    if (!employee_id || !date || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      `INSERT INTO attendance (employee_id, date, status)
       VALUES ($1, $2, $3) RETURNING *`,
      [employee_id, date, status]
    );
    const empResult = await pool.query("SELECT name FROM employees WHERE id = $1", [employee_id]);
    res.status(201).json({ ...result.rows[0], employee_name: empResult.rows[0].name });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return res.status(409).json({ error: "Attendance already marked for this employee on this date" });
    if (err.code === "23503") return res.status(404).json({ error: "Employee not found" });
    res.status(500).json({ error: "Database Error" });
  }
});

app.put("/attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, date, status } = req.body;
    if (!employee_id || !date || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      `UPDATE attendance
       SET employee_id = $1, date = $2, status = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [employee_id, date, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Attendance record not found" });
    const empResult = await pool.query("SELECT name FROM employees WHERE id = $1", [employee_id]);
    res.json({ ...result.rows[0], employee_name: empResult.rows[0].name });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return res.status(409).json({ error: "Attendance already marked for this employee on this date" });
    res.status(500).json({ error: "Database Error" });
  }
});

app.delete("/attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query("SELECT id FROM attendance WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Attendance record not found" });
    await pool.query("DELETE FROM attendance WHERE id = $1", [id]);
    res.json({ success: true, message: "Attendance record deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// ─────────────────────────────────────────────
// LEAVES
// ─────────────────────────────────────────────

app.get("/leaves", async (req, res) => {
  try {
    const { employee_id, status, search } = req.query;
    let query = `SELECT l.*, e.name as employee_name FROM leaves l JOIN employees e ON l.employee_id = e.id`;
    const params = [];
    const conditions = [];

    if (employee_id) {
      conditions.push(`l.employee_id = $${params.length + 1}`);
      params.push(employee_id);
    }
    if (status) {
      conditions.push(`l.status = $${params.length + 1}`);
      params.push(status);
    }
    if (search && search.trim()) {
      conditions.push(`e.name ILIKE $${params.length + 1}`);
      params.push(`%${search.trim()}%`);
    }
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

app.post("/leaves", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { employee_id, leave_type, start_date, end_date, reason } = req.body;
    if (!employee_id || !leave_type || !start_date || !end_date) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const result = await client.query(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [employee_id, leave_type, start_date, end_date, reason]
    );
    const leave = result.rows[0];
    const empResult = await client.query("SELECT name, user_id FROM employees WHERE id = $1", [employee_id]);
    const employee = empResult.rows[0];

    // Create notification for admin
    const adminResult = await client.query("SELECT id FROM users WHERE role = 'admin'");
    if (adminResult.rows.length > 0) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, 'info')`,
        [adminResult.rows[0].id, "New Leave Request", `${employee.name} has requested ${leave_type} leave`]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ ...leave, employee_name: employee.name });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  } finally {
    client.release();
  }
});

app.put("/leaves/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Status is required" });
    }

    const result = await client.query(
      `UPDATE leaves SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Leave request not found" });
    }
    const leave = result.rows[0];
    const empResult = await client.query("SELECT name, user_id FROM employees WHERE id = $1", [leave.employee_id]);
    const employee = empResult.rows[0];

    // Create notification for employee
    if (employee.user_id) {
      const notificationType = status === "Approved" ? "success" : "warning";
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
        [employee.user_id, `Leave ${status}`, `Your ${leave.leave_type} leave request has been ${status.toLowerCase()}`, notificationType]
      );
    }

    await client.query("COMMIT");
    res.json({ ...leave, employee_name: employee.name });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  } finally {
    client.release();
  }
});

app.delete("/leaves/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM leaves WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

app.get("/notifications", async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = `SELECT * FROM notifications`;
    const params = [];
    if (user_id) {
      query += ` WHERE user_id = $1`;
      params.push(user_id);
    }
    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

app.post("/notifications", async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, title, message, type || "info"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

app.put("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Notification not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅  Server running on port ${PORT}`));
