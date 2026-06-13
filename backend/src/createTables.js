
const pool = require("./db");

const createTables = async () => {
  try {
    // ── Users ──────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        email      VARCHAR(100) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        role       VARCHAR(20) DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Employees ──────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(100) UNIQUE NOT NULL,
        role       VARCHAR(100),
        department VARCHAR(100),
        status     VARCHAR(20) DEFAULT 'Active',
        user_id    INTEGER REFERENCES users(id),
        avatar     TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist for older schemas
    await pool.query(`
      ALTER TABLE employees
        ADD COLUMN IF NOT EXISTS role       VARCHAR(100),
        ADD COLUMN IF NOT EXISTS status     VARCHAR(20) DEFAULT 'Active',
        ADD COLUMN IF NOT EXISTS user_id    INTEGER REFERENCES users(id),
        ADD COLUMN IF NOT EXISTS avatar     TEXT;
    `);

    // ── Departments ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id             SERIAL PRIMARY KEY,
        name           VARCHAR(100) UNIQUE NOT NULL,
        description    TEXT,
        manager        VARCHAR(100),
        employee_count INTEGER DEFAULT 0,
        status         VARCHAR(20) DEFAULT 'Active',
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Attendance ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id          SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        date        DATE NOT NULL,
        status      VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave')),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, date)
      );
    `);

    // ── Leaves ─────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaves (
        id           SERIAL PRIMARY KEY,
        employee_id  INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        leave_type   VARCHAR(50) NOT NULL,
        start_date   DATE NOT NULL,
        end_date     DATE NOT NULL,
        reason       TEXT,
        status       VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Notifications ──────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title       VARCHAR(255) NOT NULL,
        message     TEXT,
        type        VARCHAR(50) DEFAULT 'info',
        is_read     BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Seed data ──────────────────────────────────────────────────────────
    // Seed Admin User
    const adminResult = await pool.query(
      `INSERT INTO users (email, password, role)
       VALUES ('admin@corporateprecision.com', 'admin123', 'admin')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`
    );
    const adminId = adminResult.rows[0]?.id;

    if (adminId) {
      await pool.query(
        `INSERT INTO employees (name, email, role, department, user_id)
         VALUES ('Admin User', 'admin@corporateprecision.com', 'Administrator', 'Management', $1)
         ON CONFLICT (email) DO NOTHING`,
        [adminId]
      );
    }

    // Seed Employee User
    const employeeResult = await pool.query(
      `INSERT INTO users (email, password, role)
       VALUES ('john@corporateprecision.com', 'john123', 'employee')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`
    );
    const employeeId = employeeResult.rows[0]?.id;

    if (employeeId) {
      await pool.query(
        `INSERT INTO employees (name, email, role, department, user_id)
         VALUES ('John Doe', 'john@corporateprecision.com', 'Software Developer', 'Engineering', $1)
         ON CONFLICT (email) DO NOTHING`,
        [employeeId]
      );
    }

    // Seed sample departments
    await pool.query(
      `INSERT INTO departments (name, manager, description)
       VALUES 
         ('Engineering', 'Jane Smith', 'Software development team'),
         ('Management', 'Admin User', 'Company management'),
         ('HR', 'Sarah Wilson', 'Human resources department')
       ON CONFLICT (name) DO NOTHING`
    );

    console.log("✅  All tables ready and seed data inserted.");
  } catch (err) {
    console.error("❌  createTables error:", err);
  }
};

module.exports = createTables;
