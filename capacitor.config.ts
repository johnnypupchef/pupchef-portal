import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wraps the Vite production build (`dist/`) in native WebViews.
 * Run `npm run mobile:build` after web changes, then open Xcode / Android Studio.
 *
 * Live reload: set CAPACITOR_DEV_SERVER_URL (see `npm run mobile:dev:android` and docs/ANDROID_LIVE_RELOAD.md).
 */
const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "ae.pupchef.portal",
  appName: "PupChef",
  webDir: "dist",
  ios: {
    contentInset: "automatic",
  },
  server: devServerUrl
    ? {
        url: devServerUrl,
        cleartext: true,
        androidScheme: "https",
      }
    : {
        androidScheme: "https",
      },
};

export default config;
