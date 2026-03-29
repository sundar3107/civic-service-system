"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";

export function AuthorityLoginForm() {
  const [email, setEmail] = useState("authority@pilotcity.gov");
  const [password, setPassword] = useState("Authority@123");
  const [message, setMessage] = useState<string | null>(null);

  async function login() {
    await apiPost("/auth/login", { email, password });
    setMessage("Authority authenticated. Redirecting to dashboard.");
    window.location.href = "/authority/dashboard";
  }

  return (
    <div className="form-grid">
      <div className="notice">
        Seeded development authority: <strong>authority@pilotcity.gov</strong> / <strong>Authority@123</strong>
      </div>
      <div className="form-row">
        <label htmlFor="authority-email">Authority Email</label>
        <input id="authority-email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="authority-password">Password</label>
        <input
          id="authority-password"
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="button" className="btn btn-primary" onClick={login}>
        Login as Authority
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}

