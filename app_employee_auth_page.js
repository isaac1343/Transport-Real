"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { employeeLogin, loadData, saveData } from "@/lib/storage";

export default function EmployeeAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({
    employeeId: "",
    password: ""
  });

  const [signupForm, setSignupForm] = useState({
    id: "",
    name: "",
    department: "",
    phone: "",
    password: "",
    dropoffPoint: ""
  });

  const data = typeof window !== "undefined" ? loadData() : { dropoffPoints: [] };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const employee = employeeLogin(loginForm.employeeId, loginForm.password);
    if (!employee) {
      setError("Invalid employee ID or password.");
      return;
    }
    localStorage.setItem(
      "transport-session",
      JSON.stringify({
        role: "employee",
        employeeId: employee.id,
        name: employee.name
      })
    );
    router.push("/employee/dashboard");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const db = loadData();

    if (db.employees.some((emp) => emp.id === signupForm.id.trim())) {
      setError("Employee ID already exists.");
      return;
    }

    if (!signupForm.dropoffPoint) {
      setError("Please select a drop-off point.");
      return;
    }

    db.employees.push({
      id: signupForm.id.trim(),
      name: signupForm.name.trim(),
      department: signupForm.department.trim(),
      phone: signupForm.phone.trim(),
      password: signupForm.password,
      dropoffPoint: signupForm.dropoffPoint
    });
    saveData(db);
    setSuccess("Signup successful. You can now log in.");
    setSignupForm({
      id: "",
      name: "",
      department: "",
      phone: "",
      password: "",
      dropoffPoint: ""
    });
    setMode("login");
  };

  return (
    <main className="page">
      <div className="container">
        <Header title="Employee Access" subtitle="Daily login and signup for transport users" actions={[{ label: "Back Home", href: "/" }]} />
        <div className="grid two">
          <div className="card">
            <div className="sectionTitle">
              <h2>Login</h2>
              <button className="button" onClick={() => setMode("login")}>Use Login</button>
            </div>
            {mode === "login" ? <p className="small">Login with your employee ID and password.</p> : null}
            {error ? <div className="error">{error}</div> : null}
            {success ? <div className="successBox">{success}</div> : null}
            <form onSubmit={handleLogin}>
              <label className="label">Employee ID</label>
              <input
                className="input"
                value={loginForm.employeeId}
                onChange={(e) => setLoginForm({ ...loginForm, employeeId: e.target.value })}
                placeholder="e.g. EMP001"
                required
              />
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Enter password"
                required
              />
              <button className="button primary" type="submit">Login</button>
            </form>
          </div>

          <div className="card">
            <div className="sectionTitle">
              <h2>Signup</h2>
              <button className="button" onClick={() => setMode("signup")}>Use Signup</button>
            </div>
            <p className="small">Register as a transport user so admin and vendor can coordinate pickup plans.</p>
            <form onSubmit={handleSignup}>
              <label className="label">Employee ID</label>
              <input
                className="input"
                value={signupForm.id}
                onChange={(e) => setSignupForm({ ...signupForm, id: e.target.value })}
                required
              />
              <label className="label">Full Name</label>
              <input
                className="input"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                required
              />
              <label className="label">Department</label>
              <input
                className="input"
                value={signupForm.department}
                onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                required
              />
              <label className="label">Phone</label>
              <input
                className="input"
                value={signupForm.phone}
                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                required
              />
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                required
              />
              <label className="label">Drop-off Point</label>
              <select
                className="select"
                value={signupForm.dropoffPoint}
                onChange={(e) => setSignupForm({ ...signupForm, dropoffPoint: e.target.value })}
                required
              >
                <option value="">Select drop-off point</option>
                {data.dropoffPoints.map((point) => (
                  <option key={point} value={point}>
                    {point}
                  </option>
                ))}
              </select>
              <button className="button primary" type="submit">Sign Up</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}