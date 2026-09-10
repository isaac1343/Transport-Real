"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { staffLogin } from "@/lib/storage";

export default function VendorLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const user = staffLogin(form.username, form.password);
    if (!user || user.role !== "vendor") {
      setError("Invalid vendor credentials.");
      return;
    }
    localStorage.setItem(
      "transport-session",
      JSON.stringify({
        role: "vendor",
        username: user.username,
        name: user.name
      })
    );
    router.push("/vendor/dashboard");
  };

  return (
    <main className="page">
      <div className="container">
        <Header title="Vendor Login" subtitle="Check employees into assigned transport cars" actions={[{ label: "Back Home", href: "/" }]} />
        <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
          {error ? <div className="error">{error}</div> : null}
          <form onSubmit={handleSubmit}>
            <label className="label">Username</label>
            <input
              className="input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button className="button primary" type="submit">Login as Vendor</button>
          </form>
        </div>
      </div>
    </main>
  );
}