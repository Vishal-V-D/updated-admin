import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Base Next.js config
const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],

  // ⚡ ESLint: ignore warnings/errors during builds (Netlify-friendly)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

let configWithPlugins = baseConfig;

// Conditionally enable Sentry
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    org: process.env.NEXT_PUBLIC_SENTRY_ORG,
    project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    reactComponentAnnotation: { enabled: true },
    tunnelRoute: '/monitoring',
    disableLogger: true,
    telemetry: false,
  });
}

export default configWithPlugins;
