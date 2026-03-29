"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";

type Category = {
  code: string;
  title: string;
  description: string;
  fieldsJson: Array<{ key: string; label: string; required: boolean }>;
};

export function ReportForm({ category }: { category: Category }) {
  const [description, setDescription] = useState("");
  const [creditName, setCreditName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    if (!photo) {
      setMessage("A complaint photo is required.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("issueCategoryCode", category.code);
    formData.append("description", description);
    formData.append("creditName", creditName);
    formData.append(
      "categoryFields",
      JSON.stringify(
        Object.entries(extraFields).map(([key, value]) => ({
          key,
          value
        }))
      )
    );

    if (latitude && longitude) {
      formData.append(
        "location",
        JSON.stringify({
          latitude: Number(latitude),
          longitude: Number(longitude),
          formattedAddress
        })
      );
    }

    const result = await apiPost<{ duplicateSuggestion?: boolean; complaint?: { id: string; complaintNumber: string } }>(
      "/complaints",
      formData,
      true
    );

    if (result.duplicateSuggestion && result.complaint) {
      setMessage(`Possible duplicate found. Consider upvoting complaint ${result.complaint.complaintNumber}.`);
      return;
    }

    setMessage("Complaint submitted successfully.");
    window.location.href = "/";
  }

  return (
    <div className="form-grid">
      <div className="notice">
        Map pinning is modeled with latitude and longitude fields here. You can upgrade this to a live Leaflet picker next.
      </div>
      <div className="form-row">
        <label htmlFor="photo">Issue Photo</label>
        <input id="photo" type="file" className="input" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      </div>
      <div className="form-row">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          className="textarea"
          value={description}
          maxLength={200}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-row">
        <label htmlFor="creditName">Credit Name</label>
        <input id="creditName" className="input" value={creditName} onChange={(e) => setCreditName(e.target.value)} />
      </div>
      <div className="split">
        <div className="form-row">
          <label htmlFor="latitude">Latitude</label>
          <input id="latitude" className="input" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="longitude">Longitude</label>
          <input id="longitude" className="input" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="formattedAddress">Location details</label>
        <input
          id="formattedAddress"
          className="input"
          value={formattedAddress}
          onChange={(e) => setFormattedAddress(e.target.value)}
        />
      </div>
      {category.fieldsJson.map((field) => (
        <div key={field.key} className="form-row">
          <label htmlFor={field.key}>{field.label}</label>
          <input
            id={field.key}
            className="input"
            value={extraFields[field.key] ?? ""}
            onChange={(e) => setExtraFields((current) => ({ ...current, [field.key]: e.target.value }))}
          />
        </div>
      ))}
      <button type="button" className="btn btn-primary" onClick={submit}>
        Submit Complaint
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}

