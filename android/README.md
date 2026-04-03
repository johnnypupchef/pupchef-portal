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

## `aar-metadata.properties (No such file or directory)`

Gradle removed intermediate files (e.g. after **Clean**) but the IDE or a task still referenced an old path. Fix:

1. In a terminal from `pupchef-portal/android`:

   ```bash
   ./gradlew clean
   ./gradlew :app:assembleDebug
   ```

2. In Android Studio: **Build → Clean Project**, then **Build → Rebuild Project**, then **Run**.

3. If it still fails: **File → Invalidate Caches… → Invalidate and Restart**.

After `./gradlew clean`, the first build **must** finish fully before Run — don’t interrupt it.
