import { Panel, SectionTitle } from "@civic/ui";
import { AppShell } from "../../../components/app-shell";
import { CitizenLoginForm } from "../../../features/auth/citizen-login-form";

export default function LoginPage() {
  return (
    <AppShell
      title="Citizen login"
      subtitle="Verify your email, complete onboarding once, then track and manage your civic reports."
      links={[{ href: "/", label: "Back to Home" }]}
    >
      <Panel>
        <SectionTitle
          eyebrow="Authentication"
          title="Sign in with a verified email"
          description="For development, the email verification token is displayed after request so you can continue the flow."
        />
        <CitizenLoginForm />
      </Panel>
    </AppShell>
  );
}

