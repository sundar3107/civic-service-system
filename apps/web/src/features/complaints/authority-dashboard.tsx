"use client";

import { useEffect, useState } from "react";
import { ComplaintStatus } from "@civic/types";
import { Panel, SectionTitle } from "@civic/ui";
import { apiPatch } from "../../lib/api";

export type AuthorityComplaint = {
  id: string;
  complaintNumber: string;
  description: string;
  status: ComplaintStatus;
  issueCategory: { title: string };
  location: { formattedAddress: string | null } | null;
  citizen: { email: string; username: string | null };
};

export function AuthorityDashboard({ complaints }: { complaints: AuthorityComplaint[] }) {
  const [items, setItems] = useState(complaints);

  useEffect(() => {
    setItems(complaints);
  }, [complaints]);

  async function updateStatus(complaintId: string, status: ComplaintStatus) {
    await apiPatch(`/complaints/${complaintId}/status`, { status });
    setItems((current) => current.map((item) => (item.id === complaintId ? { ...item, status } : item)));
  }

  return (
    <Panel>
      <SectionTitle
        eyebrow="Authority Queue"
        title="Assigned municipal complaints"
        description="Update the complaint lifecycle and keep citizens informed in real time."
      />
      <div className="card-grid">
        {items.map((complaint) => (
          <div className="panel issue-card" key={complaint.id}>
            <span className="status-pill">{complaint.status.replaceAll("_", " ")}</span>
            <h3>{complaint.complaintNumber}</h3>
            <p>{complaint.issueCategory.title}</p>
            <div className="meta-list">
              <span>{complaint.location?.formattedAddress ?? "No location provided"}</span>
              <span>Reporter: {complaint.citizen.username ?? complaint.citizen.email}</span>
            </div>
            <div className="grid">
              <button type="button" className="btn btn-secondary" onClick={() => updateStatus(complaint.id, ComplaintStatus.ACCEPTED)}>
                Mark Accepted
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => updateStatus(complaint.id, ComplaintStatus.ONGOING)}>
                Mark Ongoing
              </button>
              <button type="button" className="btn btn-primary" onClick={() => updateStatus(complaint.id, ComplaintStatus.COMPLETED)}>
                Mark Completed
              </button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
