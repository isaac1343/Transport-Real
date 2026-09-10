"use client";

import Link from "next/link";

export default function Header({ title, subtitle, actions = [] }) {
  return (
    <div className="header">
      <div className="brand">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="nav">
        <Link href="/">Home</Link>
        {actions.map((action) =>
          action.href ? (
            <Link key={action.label} href={action.href}>
              {action.label}
            </Link>
          ) : (
            <button key={action.label} onClick={action.onClick}>
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}