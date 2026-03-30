import { notFound } from "next/navigation";
import { Panel, SectionTitle } from "@civic/ui";
import { AppShell } from "../../../../components/app-shell";
import { ReportForm } from "../../../../features/complaints/report-form";
import { apiGet } from "../../../../lib/api";

export default async function ReportPage({ params }: { params: { category: string } }) {
  const categories = await apiGet<Array<{ code: string; title: string; description: string; fieldsJson: Array<{ key: string; label: string; required: boolean }> }>>(
    "/issue-categories"
  );
  const category = categories.find((item) => item.code === params.category);

  if (!category) {
    notFound();
  }

  return (
    <AppShell
      title={`Report ${category.title}`}
      subtitle="Submit photo evidence, describe the issue, and provide location details when available."
      links={[
        { href: "/home", label: "Citizen Home" },
        { href: "/login", label: "Login" }
      ]}
    >
      <Panel>
        <SectionTitle eyebrow="Complaint Submission" title={category.title} description={category.description} />
        <ReportForm category={category} />
      </Panel>
    </AppShell>
  );
}
