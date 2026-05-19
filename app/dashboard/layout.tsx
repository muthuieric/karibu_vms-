import type { Metadata } from "next";
import { privateRouteMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privateRouteMetadata;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
