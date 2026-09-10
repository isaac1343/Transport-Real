"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ role, children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("transport-session");
    if (!raw) {
      router.replace("/");
      return;
    }
    const session = JSON.parse(raw);
    if (role && session.role !== role) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [role, router]);

  if (!ready) {
    return (
      <div className="page">
        <div className="container">
          <div className="card center">
            <h2>Loading...</h2>
            <p className="small">Checking access permissions.</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}