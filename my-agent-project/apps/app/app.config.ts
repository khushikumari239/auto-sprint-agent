/**
 * Application Configuration
 *
 * Single source of truth for app identity. Used by:
 * - capacitor.config.ts (mobile builds)
 * - vite.config.ts and src/main.tsx (web builds)
 * - Electrobun desktop shell (via ELIZA_APP_NAME / ELIZA_APP_ID env vars)
 *
 * To create a new app: copy this file and change the values below.
 *
 * Scaffold placeholders are replaced by `elizaos create` at project
 * creation time. Edit any value below to change app identity.
 */
import type { AppConfig } from "@elizaos/app-core";

interface AppWebConfig {
  shortName: string;
  themeColor: string;
  backgroundColor: string;
  shareImagePath: string;
}

const config = {
  appName: "My Agent Project",
  appId: "com.example.myagentproject",
  orgName: "your-org",
  repoName: "my-agent-project",
  cliName: "my-agent-project",
  description: "An elizaOS app",
  // Sourced from cliName when unset; downstream tooling normalizes to UPPER_SNAKE.
  envPrefix: "my-agent-project",
  namespace: "my-agent-project",
  defaultApps: [],

  desktop: {
    bundleId: "com.example.myagentproject",
    urlScheme: "my-agent-project",
  },

  web: {
    shortName: "My Agent Project",
    themeColor: "#08080a",
    backgroundColor: "#0a0a0a",
    shareImagePath: "/og-image.png",
  },

  branding: {
    appName: "My Agent Project",
    orgName: "your-org",
    repoName: "my-agent-project",
    docsUrl: "https://example.com/my-agent-project/docs",
    appUrl: "https://example.com/my-agent-project",
    bugReportUrl: "https://github.com/your-org/my-agent-project/issues/new",
    hashtag: "#MyAgentProject",
    fileExtension: ".my-agent-project.agent",
    packageScope: "myagentproject",
  },
} satisfies AppConfig & { web: AppWebConfig };

export default config;
