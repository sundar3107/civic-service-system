import { Panel, SectionTitle } from "@civic/ui";
import { AppShell } from "../../../../components/app-shell";
import { AuthorityLoginForm } from "../../../../features/authority/authority-login-form";

export default function AuthorityLoginPage() {
  return (
    <AppShell
      title="Authority portal login"
      subtitle="Restricted municipal access for assigned district and city operations."
      links={[{ href: "/", label: "Citizen Home" }]}
    >
      <Panel>
        <SectionTitle
          eyebrow="Authority Access"
          title="Sign in to your assigned complaint queue"
          description="Authority accounts are seeded and assigned to cities by the administrative setup flow."
        />
        <AuthorityLoginForm />
      </Panel>
    </AppShell>
  );
}

