"use client";

import { useState } from "react";
import Link from "next/link";
import type { ComplaintCard } from "@civic/types";
import { Panel, SectionTitle } from "@civic/ui";
import { apiPost } from "../../lib/api";

export function ComplaintFeed({ complaints }: { complaints: ComplaintCard[] }) {
  const [items, setItems] = useState(complaints);
  const [search, setSearch] = useState("");

  const filteredItems = items.filter((item) => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return true;
    }

    return (
      item.complaintNumber.toLowerCase().includes(term) ||
      item.issueType.toLowerCase().includes(term) ||
      item.locationLabel.toLowerCase().includes(term)
    );
  });

  async function upvote(complaintId: string) {
    await apiPost("/votes", { complaintId });
    setItems((current) =>
      current.map((item) => (item.id === complaintId ? { ...item, voteCount: item.voteCount + 1 } : item))
    );
  }

  return (
    <Panel>
      <SectionTitle
        eyebrow="Live Complaints"
        title="Track civic issues across your area"
        description="Users can upvote existing complaints instead of creating duplicates."
      />
      <div className="form-row" style={{ marginBottom: 18 }}>
        <label htmlFor="complaint-search">Search complaint number, issue type, or location</label>
        <input
          id="complaint-search"
          className="input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Example: CIV-2026-000001"
        />
      </div>
      <div className="card-grid">
        {filteredItems.map((complaint) => (
          <div key={complaint.id} className="panel issue-card">
            <span className="status-pill">{complaint.status.replaceAll("_", " ")}</span>
            <h3>{complaint.complaintNumber}</h3>
            <p>{complaint.locationLabel}</p>
            <div className="meta-list">
              <span>Type: {complaint.issueType}</span>
              <span>Severity: {complaint.severityLabel}</span>
              <span>Votes: {complaint.voteCount}</span>
            </div>
            <div className="split">
              <button type="button" className="btn btn-secondary" onClick={() => upvote(complaint.id)}>
                Upvote
              </button>
              <Link href={`/complaints/${complaint.id}`} className="btn btn-primary">
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
