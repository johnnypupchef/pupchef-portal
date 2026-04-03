# Android (Capacitor)

The WebView loads files from `app/src/main/assets/public/` (copied from the Vite `dist/` build).

**Android Studio “Run”** triggers a Gradle `preBuild` step that runs `npm run mobile:build:android` in the parent `pupchef-portal` folder, so the latest web bundle is copied before the APK is built.

If you ever disable that hook or build from CI without Node:

```bash
cd ..   # pupchef-portal
npm run mobile:build:android
```

Then build in Android Studio.

If the UI still looks old: **uninstall** the app from the emulator/device, then Run again (clears WebView cache).
