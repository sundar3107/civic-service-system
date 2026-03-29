"use client";

import { useEffect, useState } from "react";
import { Panel, SectionTitle } from "@civic/ui";
import type { AuthorityComplaint } from "../complaints/authority-dashboard";
import { apiGet } from "../../lib/api";
import { AuthorityDashboard } from "../complaints/authority-dashboard";

type AuthorityResponse = {
  displayName: string;
  assignments: Array<{ district: { name: string }; city: { name: string } }>;
};

export function AuthorityDashboardPage() {
  const [authority, setAuthority] = useState<AuthorityResponse | null>(null);
  const [complaints, setComplaints] = useState<AuthorityComplaint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [authorityData, complaintData] = await Promise.all([
          apiGet<AuthorityResponse>("/authorities/me"),
          apiGet<AuthorityComplaint[]>("/complaints/authority/assigned")
        ]);
        setAuthority(authorityData);
        setComplaints(complaintData);
      } catch {
        setError("Authority authentication is required.");
      }
    }

    void load();
  }, []);

  if (error) {
    return <div className="notice">{error}</div>;
  }

  return (
    <>
      <Panel>
        <SectionTitle
          eyebrow="Assigned Jurisdiction"
          title={authority?.displayName ?? "Loading authority assignment"}
          description={
            authority?.assignments?.map((assignment) => `${assignment.city.name}, ${assignment.district.name}`).join(" | ") ??
            "Loading assigned districts and cities."
          }
        />
      </Panel>
      <div style={{ marginTop: 24 }}>
        <AuthorityDashboard complaints={complaints} />
      </div>
    </>
  );
}
