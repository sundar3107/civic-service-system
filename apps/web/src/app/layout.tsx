import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civic Service System",
  description: "Citizen reporting and authority action platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

