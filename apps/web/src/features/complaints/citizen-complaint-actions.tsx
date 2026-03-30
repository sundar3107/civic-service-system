"use client";

import { useState } from "react";
import { apiDelete } from "../../lib/api";

export function CitizenComplaintActions({
  complaintId,
  complaintStatus,
  complaintOwnerId,
  currentUserId
}: {
  complaintId: string;
  complaintStatus: string;
  complaintOwnerId: string;
  currentUserId: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);

  const canDelete = currentUserId === complaintOwnerId && complaintStatus === "REMEDIAL_NOT_STARTED";

  async function removeComplaint() {
    try {
      await apiDelete(`/complaints/${complaintId}`);
      setMessage("Complaint deleted successfully.");
      window.location.href = "/home";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  if (!canDelete) {
    return (
      <div className="notice">
        Complaint delete is allowed only for the original reporter and only before the authority accepts the complaint.
      </div>
    );
  }

  return (
    <div className="form-grid">
      <button type="button" className="btn btn-secondary" onClick={removeComplaint}>
        Delete This Complaint
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}

