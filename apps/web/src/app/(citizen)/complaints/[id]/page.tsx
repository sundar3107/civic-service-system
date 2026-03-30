import { AppShell } from "../../../../components/app-shell";
import { ComplaintDetailPage } from "../../../../features/complaints/complaint-detail-page";

export default async function ComplaintDetailRoute({ params }: { params: { id: string } }) {
  return (
    <AppShell
      title="Complaint Detail"
      subtitle="Formal complaint card and municipal progress timeline."
      links={[{ href: "/home", label: "Citizen Home" }]}
    >
      <ComplaintDetailPage complaintId={params.id} />
    </AppShell>
  );
}
