"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";

export function CitizenLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function requestVerification() {
    const result = await apiPost<{ token: string; email: string }>("/auth/citizen/request-email", { email });
    setMessage(`Development verification token: ${result.token}`);
  }

  async function verifyEmail() {
    await apiPost("/auth/verify-email", { token });
    setMessage("Email verified. Redirecting to one-time onboarding.");
    window.location.href = "/onboarding";
  }

  async function login() {
    const result = await apiPost<{ role: string; profileCompleted: boolean }>("/auth/login", {
      email,
      password
    });

    if (!result.profileCompleted) {
      window.location.href = "/onboarding";
      return;
    }

    window.location.href = result.role === "AUTHORITY" ? "/authority/dashboard" : "/";
  }

  return (
    <div className="form-grid">
      <div className="form-row">
        <label htmlFor="email">Email</label>
        <input id="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div className="split">
        <button type="button" className="btn btn-secondary" onClick={requestVerification}>
          Request Verification
        </button>
        <button type="button" className="btn btn-secondary" onClick={verifyEmail}>
          Verify Token
        </button>
      </div>
      <div className="form-row">
        <label htmlFor="token">Verification Token</label>
        <input id="token" className="input" value={token} onChange={(event) => setToken(event.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <button type="button" className="btn btn-primary" onClick={login}>
        Login
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => (window.location.href = "/onboarding")}>
        Go to Onboarding
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}
