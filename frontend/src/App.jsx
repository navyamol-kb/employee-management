
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EmployeePortal from "./pages/EmployeePortal";

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("cp_user");
    console.log("App.jsx initial user from localStorage:", stored ? JSON.parse(stored) : null);
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [employee, setEmployeeState] = useState(() => {
    const stored = localStorage.getItem("cp_employee");
    console.log("App.jsx initial employee from localStorage:", stored ? JSON.parse(stored) : null);
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setEmployee = (employeeData) => {
    console.log("App.jsx setEmployee called with:", employeeData);
    if (employeeData) {
      localStorage.setItem("cp_employee", JSON.stringify(employeeData));
      console.log("Saved to localStorage cp_employee:", JSON.parse(localStorage.getItem("cp_employee")));
    } else {
      localStorage.removeItem("cp_employee");
    }
    setEmployeeState(employeeData);
  };

  const handleLogin = (userData, employeeData) => {
    localStorage.setItem("cp_user", JSON.stringify(userData));
    localStorage.setItem("cp_employee", JSON.stringify(employeeData));
    setUser(userData);
    setEmployee(employeeData);
  };

  const handleLogout = () => {
    localStorage.removeItem("cp_user");
    localStorage.removeItem("cp_employee");
    setUser(null);
    setEmployee(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === "employee") {
    return (
      <EmployeePortal
        user={user}
        employee={employee}
        setEmployee={setEmployee}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      employee={employee}
      setEmployee={setEmployee}
      onLogout={handleLogout}
    />
  );
}
