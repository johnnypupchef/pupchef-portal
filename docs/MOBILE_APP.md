# PupChef customer app (Capacitor)

The portal is a **Vite + React** web app. **Capacitor** wraps the production build (`dist/`) in native **iOS** and **Android** WebViews so customers get the **same** account experience in the browser and in the stores.

## What you need on your machine

### Everyone

- **Node.js** (same as for the portal web app)
- After pulling: `npm install`

### iOS (Mac only)

- **Xcode** from the Mac App Store (not only Command Line Tools)
- Point the active developer directory at Xcode:

  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```

- **CocoaPods**: `sudo gem install cocoapods` (or Homebrew: `brew install cocoapods`)

### Android (Mac, Windows, or Linux)

- **Android Studio** (install Android SDK + platform tools)
- **JDK 17** (Android Studio usually bundles one)

### Store accounts (when you ship)

- **Apple Developer Program** (99 USD/year) — TestFlight, then App Store
- **Google Play Console** (one-time fee) — internal testing, then production

## Daily workflow

1. Build the web app and copy assets into the native projects:

   ```bash
   npm run mobile:build
   ```

   This runs `vite build` and `cap sync`.

2. Open a native IDE:

   ```bash
   npm run mobile:ios       # Xcode (macOS only)
   npm run mobile:android   # Android Studio
   ```

3. Run the app on a simulator or device from the IDE.

## First-time iOS (after `cap sync`)

If CocoaPods was not run yet (e.g. fresh clone):

```bash
cd ios/App
pod install
cd ../..
npm run mobile:ios
```

Open **`App.xcworkspace`** (not `.xcodeproj`) if you open the project manually.

## Environment / API URLs

The app loads the same **`VITE_*`** variables baked in at **build time** (see `.env.example`). Use production Supabase and PupOps URLs for store builds.

## Troubleshooting

- **`cap sync` fails on “pod install” / Xcode**  
  Install full Xcode, run `xcode-select` as above, install CocoaPods, then `cd ios/App && pod install`.

- **Stale UI in the app**  
  Run `npm run mobile:build` again after any web change; native projects do not auto-rebuild the SPA.

- **Live reload (optional)**  
  Uncomment `server.url` in `capacitor.config.ts` to point at your dev machine’s LAN IP + Vite port; use only on trusted networks.

## Further reading

- [Capacitor workflow](https://capacitorjs.com/docs/basics/workflow)
- Architecture: **Phase 12** (Capacitor + portal) in `PupChef_Architecture/PupChef_Architecture_Plan.md`
