import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development" || process.argv.includes("dev");

const nextConfig: NextConfig = {
  // Minimize RAM by purging inactive compiled routes from memory
  onDemandEntries: {
    maxInactiveAge: 20 * 1000,
    pagesBufferLength: 2,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), geolocation=(self), microphone=(), payment=()",
          },
        ],
      },
    ];
  },
};

// In development, skip heavy Sentry instrumentation to save massive memory and avoid freezing
export default isDev
  ? nextConfig
  : withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      webpack: {
        treeshake: {
          removeDebugLogging: true,
        },
        automaticVercelMonitors: true,
      },
    });
