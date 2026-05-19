import type { Metadata } from "next";
import { publicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = publicMetadata({
  title: "Register | Karibu VMS",
  description: "Create a Karibu VMS workspace request for your organization and start managing visitor entry digitally.",
  path: "/register",
});

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
