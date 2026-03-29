import { Panel, SectionTitle } from "@civic/ui";
import { AppShell } from "../../../components/app-shell";
import { OnboardingForm } from "../../../features/auth/onboarding-form";

export default function OnboardingPage() {
  return (
    <AppShell
      title="First-time profile setup"
      subtitle="This information is collected once and reused in future sessions."
      links={[{ href: "/login", label: "Back to Login" }]}
    >
      <Panel>
        <SectionTitle
          eyebrow="Profile"
          title="Complete your citizen profile"
          description="Use a strong password and accurate contact details for issue acknowledgments and follow-up."
        />
        <OnboardingForm />
      </Panel>
    </AppShell>
  );
}

