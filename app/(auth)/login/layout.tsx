import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Karibu VMS",
  description: "Access your Karibu VMS security command center. Manage visitor logs, security guards, and active gates.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
