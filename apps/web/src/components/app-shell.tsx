import type { PropsWithChildren } from "react";
import Link from "next/link";

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  links?: Array<{ href: string; label: string }>;
}>;

export function AppShell({ title, subtitle, links = [], children }: AppShellProps) {
  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <p className="section-title__eyebrow">Civic Service System</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <nav>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="btn btn-secondary">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </main>
  );
}
