"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { loadData, resetData, todayKey } from "@/lib/storage";

export default function HomePage() {
  const [stats, setStats] = useState({
    employees: 0,
    cars: 0,
    bookingsToday: 0,
    boardedToday: 0
  });

  useEffect(() => {
    const data = loadData();
    const today = todayKey();
    setStats({
      employees: data.employees.length,
      cars: data.cars.length,
      bookingsToday: data.bookings.filter((b) => b.date === today).length,
      boardedToday: data.boardings.filter((b) => b.date === today && b.boarded).length
    });
  }, []);

  return (
    <main className="page">
      <div className="container">
        <Header title="Transport Coordination System" subtitle="Employee daily transport signup, vendor boarding, admin planning and reports" />
        <div className="hero">
          <div className="card">
            <h2 className="heroTitle">Plan daily employee transport with one simple system.</h2>
            <p>
              Employees can sign up daily for transport, admins can manage cars and staff,
              and vendors can check employees into specific cars using number plates.
            </p>
            <div className="row" style={{ marginTop: 18 }}>
              <Link className="button primary" href="/employee/auth">
                Employee Login / Signup
              </Link>
              <Link className="button" href="/vendor/login">
                Vendor Login
              </Link>
              <Link className="button" href="/admin/login">
                Admin Login
              </Link>
            </div>
            <p className="footerNote">
              Demo credentials: admin / admin123, vendor / vendor123, employee example: EMP001 / pass123
            </p>
            <button
              className="button warning"
              style={{ marginTop: 10 }}
              onClick={() => {
                resetData();
                window.location.reload();
              }}
            >
              Reset Demo Data
            </button>
          </div>

          <div className="grid">
            <div className="stat">
              <span className="small">Registered Employees</span>
              <strong>{stats.employees}</strong>
            </div>
            <div className="stat">
              <span className="small">Available Cars</span>
              <strong>{stats.cars}</strong>
            </div>
            <div className="stat">
              <span className="small">Today&apos;s Signups</span>
              <strong>{stats.bookingsToday}</strong>
            </div>
            <div className="stat">
              <span className="small">Today&apos;s Boarded</span>
              <strong>{stats.boardedToday}</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}