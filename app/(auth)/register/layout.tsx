import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Karibu VMS",
  description: "Create a Karibu VMS workspace request for your organization and start managing visitor entry digitally.",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
