import { AppShell } from "../../../../components/app-shell";
import { AuthorityDashboardPage } from "../../../../features/authority/authority-dashboard-page";

export default function AuthorityDashboardRoute() {
  return (
    <AppShell
      title="Authority dashboard"
      subtitle="Review, validate, and close civic complaints assigned to your municipality."
      links={[
        { href: "/", label: "Citizen Home" },
        { href: "/authority/login", label: "Authority Login" }
      ]}
    >
      <AuthorityDashboardPage />
    </AppShell>
  );
}
