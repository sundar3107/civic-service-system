"use client";

import { useEffect, useState } from "react";
import { Panel, SectionTitle } from "@civic/ui";
import { apiGet } from "../../lib/api";
import { CitizenComplaintActions } from "./citizen-complaint-actions";
import { ReviewForm } from "./review-form";

type ComplaintDetail = {
  id: string;
  complaintNumber: string;
  description: string;
  creditName: string;
  status: string;
  severityLabel: string;
  citizenId: string;
  votes: Array<{ userId: string }>;
  issueCategory: { title: string };
  location: { formattedAddress: string | null; source: string } | null;
  citizen: { id: string; username: string | null; email: string };
  currentUserId?: string | null;
  statusHistory: Array<{ status: string; note: string | null; createdAt: string }>;
  reviews: Array<{ rating: number; body: string; user: { id?: string; username: string | null; email: string } }>;
};

export function ComplaintDetailPage({ complaintId }: { complaintId: string }) {
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<ComplaintDetail>(`/complaints/${complaintId}`);
        setComplaint(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load complaint.");
      }
    }

    void load();
  }, [complaintId]);

  if (error) {
    return <div className="notice">{error}</div>;
  }

  if (!complaint) {
    return <div className="notice">Loading complaint details...</div>;
  }

  return (
    <>
      <div className="split">
        <Panel>
          <SectionTitle eyebrow="Complaint Card" title={complaint.issueCategory.title} description={complaint.description} />
          <div className="meta-list">
            <span>Status: {complaint.status}</span>
            <span>Severity: {complaint.severityLabel}</span>
            <span>Location: {complaint.location?.formattedAddress ?? "Not provided"}</span>
            <span>Geo source: {complaint.location?.source ?? "NONE"}</span>
            <span>Credited to: {complaint.creditName}</span>
          </div>
          <div style={{ marginTop: 18 }}>
            <CitizenComplaintActions
              complaintId={complaint.id}
              complaintStatus={complaint.status}
              complaintOwnerId={complaint.citizenId}
              currentUserId={complaint.currentUserId ?? null}
            />
          </div>
        </Panel>
        <Panel>
          <SectionTitle eyebrow="Timeline" title="Status history" />
          <div className="meta-list">
            {complaint.statusHistory.map((entry) => (
              <span key={`${entry.status}-${entry.createdAt}`}>
                {entry.status} - {entry.note ?? "No note"} - {new Date(entry.createdAt).toLocaleString()}
              </span>
            ))}
          </div>
        </Panel>
      </div>
      <div className="grid" style={{ marginTop: 24 }}>
        <Panel>
          <SectionTitle eyebrow="Public Reviews" title="Post-completion feedback" />
          <div className="meta-list">
            {complaint.reviews.length === 0 ? (
              <span>No reviews yet.</span>
            ) : (
              complaint.reviews.map((review, index) => (
                <span key={`${review.user.email}-${index}`}>
                  {review.user.username ?? review.user.email}: {review.rating}/5 - {review.body}
                </span>
              ))
            )}
          </div>
        </Panel>
        <Panel>
          <SectionTitle eyebrow="Citizen Feedback" title="Review municipal action" />
          <ReviewForm
            complaintId={complaintId}
            status={complaint.status}
            alreadyReviewed={complaint.reviews.some(
              (review) => review.user.id === complaint.currentUserId || review.user.email === complaint.currentUserId
            )}
          />
        </Panel>
      </div>
    </>
  );
}

