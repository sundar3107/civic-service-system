import { Panel, SectionTitle } from "@civic/ui";
import { AppShell } from "../../../../components/app-shell";
import { ReviewForm } from "../../../../features/complaints/review-form";
import { apiGet } from "../../../../lib/api";

export default async function ComplaintDetailPage({ params }: { params: { id: string } }) {
  const complaint = await apiGet<{
    complaintNumber: string;
    description: string;
    creditName: string;
    status: string;
    severityLabel: string;
    issueCategory: { title: string };
    location: { formattedAddress: string | null; source: string } | null;
    statusHistory: Array<{ status: string; note: string | null; createdAt: string }>;
    reviews: Array<{ rating: number; body: string; user: { username: string | null; email: string } }>;
  }>(`/complaints/${params.id}`);

  return (
    <AppShell
      title={complaint.complaintNumber}
      subtitle="Formal complaint card and municipal progress timeline."
      links={[{ href: "/home", label: "Citizen Home" }]}
    >
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
          <ReviewForm complaintId={params.id} status={complaint.status} />
        </Panel>
      </div>
    </AppShell>
  );
}
