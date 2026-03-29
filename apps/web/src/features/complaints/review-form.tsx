"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";

export function ReviewForm({ complaintId, status }: { complaintId: string; status: string }) {
  const [rating, setRating] = useState("5");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  if (status !== "COMPLETED") {
    return <div className="notice">Reviews are available after the complaint is marked completed.</div>;
  }

  async function submit() {
    await apiPost("/reviews", {
      complaintId,
      rating: Number(rating),
      body
    });
    setMessage("Review submitted.");
  }

  return (
    <div className="form-grid">
      <div className="split">
        <div className="form-row">
          <label htmlFor="rating">Rating</label>
          <select id="rating" className="select" value={rating} onChange={(e) => setRating(e.target.value)}>
            {[0, 1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="body">Review Description</label>
        <textarea id="body" className="textarea" maxLength={100} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <button type="button" className="btn btn-primary" onClick={submit}>
        Submit Review
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}

