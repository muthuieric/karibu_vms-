import type { Metadata } from "next";
import { publicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = publicMetadata({
  title: "Sign In | Karibu VMS",
  description: "Access your Karibu VMS security command center. Manage visitor logs, security guards, and active gates.",
  path: "/login",
});

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
