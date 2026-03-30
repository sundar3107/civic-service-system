"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";
import { LocationPicker } from "./location-picker";

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
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    formattedAddress: string;
  } | null>(null);
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    try {
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

      if (location) {
        formData.append(
          "location",
          JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            formattedAddress: location.formattedAddress
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
      window.location.href = "/home";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Complaint submission failed.");
    }
  }

  return (
    <div className="form-grid">
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
      <div className="form-row">
        <label>Issue Location</label>
        <LocationPicker value={location} onChange={setLocation} />
      </div>
      <div className="form-row">
        <label htmlFor="formattedAddress">Selected location</label>
        <input
          id="formattedAddress"
          className="input"
          value={location?.formattedAddress ?? ""}
          readOnly
          placeholder="Select a location from the map"
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
