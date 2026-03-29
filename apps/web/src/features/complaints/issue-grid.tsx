import Link from "next/link";
import { Panel, SectionTitle } from "@civic/ui";

type IssueCategory = {
  id: string;
  code: string;
  title: string;
  bannerTitle: string;
  description: string;
};

export function IssueGrid({ categories }: { categories: IssueCategory[] }) {
  return (
    <Panel>
      <SectionTitle
        eyebrow="Issue Categories"
        title="Choose the civic issue you want to report"
        description="Each issue type opens a guided submission page with the relevant supporting fields."
      />
      <div className="issues-grid">
        {categories.map((category) => (
          <Link key={category.id} href={`/report/${category.code}`} className="panel issue-card">
            <span className="issue-card__badge">{category.bannerTitle}</span>
            <h3>{category.title}</h3>
            <p>{category.description}</p>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

