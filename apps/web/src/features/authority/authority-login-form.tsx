"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";
import { LocationSelects } from "../locations/location-selects";

export function AuthorityLoginForm() {
  const [districtId, setDistrictId] = useState("");
  const [cityId, setCityId] = useState("");
  const [email, setEmail] = useState("authority.vellore@tn.gov");
  const [password, setPassword] = useState("Authority@123");
  const [message, setMessage] = useState<string | null>(null);

  async function login() {
    try {
      await apiPost("/auth/login", { email, password, districtId, cityId });
      setMessage("Authority authenticated. Redirecting to dashboard.");
      window.location.href = "/authority/dashboard";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authority login failed.");
    }
  }

  return (
    <div className="form-grid">
      <div className="notice">
        For now use <strong>authority.vellore@tn.gov</strong> with district <strong>Vellore</strong> and city
        <strong> Katpadi</strong>. Password: <strong>Authority@123</strong>
      </div>
      <LocationSelects
        districtId={districtId}
        cityId={cityId}
        onDistrictChange={setDistrictId}
        onCityChange={setCityId}
        labelPrefix="authority-"
      />
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
        Login for Selected District and City
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}
