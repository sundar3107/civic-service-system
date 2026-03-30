"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";

export function CitizenLoginForm() {
  const [email, setEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function requestVerification() {
    const result = await apiPost<{ token: string; email: string }>("/auth/citizen/request-email", { email: signupEmail });
    setToken(result.token);
    setMessage(`Verification token created for ${result.email}. Use it below to continue first-time setup.`);
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

    window.location.href = result.role === "AUTHORITY" ? "/authority/dashboard" : "/home";
  }

  return (
    <div className="form-grid">
      <div className="auth-grid">
        <section className="auth-card">
          <div>
            <h3>First-time citizen registration</h3>
            <p>Step 1: request an email verification token. Step 2: verify it. Step 3: complete your profile.</p>
          </div>
          <div className="form-row">
            <label htmlFor="signupEmail">Email for registration</label>
            <input
              id="signupEmail"
              className="input"
              value={signupEmail}
              onChange={(event) => setSignupEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <button type="button" className="btn btn-secondary" onClick={requestVerification}>
            Send Verification Token
          </button>
          <div className="form-row">
            <label htmlFor="token">Verification Token</label>
            <input
              id="token"
              className="input"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste the token shown after request"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={verifyEmail}>
            Verify Email And Continue
          </button>
        </section>
        <section className="auth-card">
          <div>
            <h3>Returning citizen login</h3>
            <p>Use the same verified email and the strong password you created during onboarding.</p>
          </div>
          <div className="form-row">
            <label htmlFor="email">Verified Email</label>
            <input
              id="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={login}>
            Login To Dashboard
          </button>
        </section>
      </div>
      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}
