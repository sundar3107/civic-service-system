"use client";

import { useState } from "react";
import { apiPatch } from "../../lib/api";

type FormState = {
  fullName: string;
  age: string;
  phoneNumber: string;
  addressLine: string;
  pincode: string;
  username: string;
  password: string;
};

const initialState: FormState = {
  fullName: "",
  age: "",
  phoneNumber: "",
  addressLine: "",
  pincode: "",
  username: "",
  password: ""
};

export function OnboardingForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [message, setMessage] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    await apiPatch("/users/me/profile", {
      ...form,
      age: Number(form.age)
    });
    setMessage("Profile saved. Redirecting to citizen home.");
    window.location.href = "/";
  }

  return (
    <div className="form-grid">
      <div className="split">
        <div className="form-row">
          <label htmlFor="fullName">Name</label>
          <input id="fullName" className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="age">Age</label>
          <input id="age" className="input" value={form.age} onChange={(e) => update("age", e.target.value)} />
        </div>
      </div>
      <div className="split">
        <div className="form-row">
          <label htmlFor="phoneNumber">Phone number</label>
          <input
            id="phoneNumber"
            className="input"
            value={form.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="pincode">Pincode</label>
          <input id="pincode" className="input" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="addressLine">Address</label>
        <textarea
          id="addressLine"
          className="textarea"
          value={form.addressLine}
          onChange={(e) => update("addressLine", e.target.value)}
        />
      </div>
      <div className="split">
        <div className="form-row">
          <label htmlFor="username">Username</label>
          <input id="username" className="input" value={form.username} onChange={(e) => update("username", e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="password">Strong Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>
      </div>
      <button type="button" className="btn btn-primary" onClick={submit}>
        Save Profile
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}

