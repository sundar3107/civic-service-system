import type { ComplaintCard } from "@civic/types";
import { AppShell } from "../components/app-shell";
import { apiGet } from "../lib/api";
import { ComplaintFeed } from "../features/complaints/complaint-feed";
import { IssueGrid } from "../features/complaints/issue-grid";

export default async function CitizenHomePage() {
  const [categories, complaints] = await Promise.all([
    apiGet<Array<{ id: string; code: string; title: string; bannerTitle: string; description: string }>>("/issue-categories"),
    apiGet<ComplaintCard[]>("/complaints")
  ]);

  return (
    <AppShell
      title="Citizen reporting dashboard"
      subtitle="Report civic issues, track municipal progress, and support existing complaints with upvotes."
      links={[
        { href: "/login", label: "Citizen Login" },
        { href: "/authority/login", label: "Authority Portal" }
      ]}
    >
      <div className="hero">
        <div className="panel">
          <p className="section-title__eyebrow">Purpose</p>
          <h2>Structured reporting for real municipal action</h2>
          <p>
            Capture complaints with evidence, route them to the right local authority, and keep status visibility formal
            and traceable.
          </p>
        </div>
        <div className="stats-row">
          <div className="stat">
            <strong>{categories.length}</strong>
            <p>Issue categories</p>
          </div>
          <div className="stat">
            <strong>{complaints.length}</strong>
            <p>Visible complaints</p>
          </div>
          <div className="stat">
            <strong>Pilot</strong>
            <p>Municipality-ready</p>
          </div>
        </div>
      </div>
      <div className="grid" style={{ marginTop: 24 }}>
        <IssueGrid categories={categories} />
        <ComplaintFeed complaints={complaints} />
      </div>
    </AppShell>
  );
}
