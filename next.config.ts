import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const baseConfig: NextConfig = {
  // Required for Next 16 (because Turbopack is default)
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.slingacademy.com",
        port: "",
      },
    ],
  },

  transpilePackages: ["geist"],

  // ❌ Remove ESLint config — not supported in Next 16
  // eslint: { ignoreDuringBuilds: true },  ← REMOVE THIS COMPLETELY
};

// Enable Sentry safely (works with Turbopack)
let configWithPlugins = baseConfig;

if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  configWithPlugins = withSentryConfig(
    configWithPlugins,
    {
      org: process.env.NEXT_PUBLIC_SENTRY_ORG,
      project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
      silent: true,
      tunnelRoute: "/monitoring",
      disableLogger: true,
      telemetry: false,
    },
    {
      // Required to avoid Webpack-related issues in Next 16
      disableWebpackPlugin: true,
      disableLogger: true,
    }
  );
}

export default configWithPlugins;
