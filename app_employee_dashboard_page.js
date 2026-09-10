"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { loadData, saveData, todayKey } from "@/lib/storage";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("transport-session") || "{}");
    const db = loadData();
    const emp = db.employees.find((e) => e.id === session.employeeId);
    setEmployee(emp || null);
    setData(db);
  }, []);

  const today = todayKey();

  const todaysBooking = useMemo(() => {
    if (!employee || !data) return null;
    return data.bookings.find((b) => b.employeeId === employee.id && b.date === today) || null;
  }, [employee, data, today]);

  const todaysBoarding = useMemo(() => {
    if (!employee || !data) return null;
    return data.boardings.find((b) => b.employeeId === employee.id && b.date === today) || null;
  }, [employee, data, today]);

  const handleBook = () => {
    const db = loadData();
    const existing = db.bookings.find((b) => b.employeeId === employee.id && b.date === today);
    if (existing) {
      setMessage("You already signed up for transport today.");
      setData(db);
      return;
    }
    db.bookings.push({
      id: `BOOK-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      date: today,
      dropoffPoint: employee.dropoffPoint,
      status: "signed"
    });
    saveData(db);
    setData(db);
    setMessage("Transport signup completed for today.");
  };

  const logout = () => {
    localStorage.removeItem("transport-session");
    window.location.href = "/";
  };

  if (!employee || !data) {
    return (
      <AuthGuard role="employee">
        <main className="page">
          <div className="container">
            <div className="card">
              <h2>Loading dashboard...</h2>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard role="employee">
      <main className="page">
        <div className="container">
          <Header
            title={`Welcome, ${employee.name}`}
            subtitle="Employee daily transport dashboard"
            actions={[
              { label: "Logout", onClick: logout }
            ]}
          />

          <div className="kpi">
            <div className="stat">
              <span className="small">Employee ID</span>
              <strong>{employee.id}</strong>
            </div>
            <div className="stat">
              <span className="small">Department</span>
              <strong>{employee.department}</strong>
            </div>
            <div className="stat">
              <span className="small">Drop-off Point</span>
              <strong>{employee.dropoffPoint}</strong>
            </div>
            <div className="stat">
              <span className="small">Today</span>
              <strong>{today}</strong>
            </div>
          </div>

          <div className="grid two" style={{ marginTop: 18 }}>
            <div className="card">
              <h2>Daily Transport Signup</h2>
              <p className="small">
                Sign up once each day so the admin can estimate vehicle demand and assign enough cars.
              </p>
              {message ? <div className="successBox">{message}</div> : null}
              {todaysBooking ? (
                <div className="listItem">
                  <strong>Status:</strong> <span className="badge green">Signed for today</span>
                  <div className="small" style={{ marginTop: 8 }}>
                    Booking ID: {todaysBooking.id}
                  </div>
                  <div className="small">Drop-off: {todaysBooking.dropoffPoint}</div>
                </div>
              ) : (
                <button className="button primary" onClick={handleBook}>
                  Sign Up for Today&apos;s Transport
                </button>
              )}
            </div>

            <div className="card">
              <h2>Boarding Status</h2>
              {!todaysBoarding ? (
                <div className="listItem">
                  <span className="badge yellow">Pending vendor check-in</span>
                  <p className="small">
                    After you board, the vendor will check you into the assigned car.
                  </p>
                </div>
              ) : (
                <div className="list">
                  <div className="listItem">
                    <strong>Car Plate:</strong> {todaysBoarding.plateNumber}
                  </div>
                  <div className="listItem">
                    <strong>Boarded:</strong>{" "}
                    {todaysBoarding.boarded ? (
                      <span className="badge green">Yes</span>
                    ) : (
                      <span className="badge red">No</span>
                    )}
                  </div>
                  <div className="listItem">
                    <strong>Dropped Off:</strong>{" "}
                    {todaysBoarding.droppedOff ? (
                      <span className="badge green">Yes</span>
                    ) : (
                      <span className="badge yellow">Pending</span>
                    )}
                  </div>
                  <div className="listItem">
                    <strong>Drop-off Point:</strong> {todaysBoarding.dropoffPoint}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}