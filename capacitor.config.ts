import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wraps the Vite production build (`dist/`) in native WebViews.
 * Run `npm run mobile:build` after web changes, then open Xcode / Android Studio.
 */
const config: CapacitorConfig = {
  appId: "ae.pupchef.portal",
  appName: "PupChef",
  webDir: "dist",
  ios: {
    contentInset: "automatic",
  },
  server: {
    // For dev: uncomment and run `npm run dev`, then `cap run ios` with live reload (optional).
    // url: "http://YOUR_LAN_IP:5173",
    // cleartext: true,
    androidScheme: "https",
  },
};

export default config;
