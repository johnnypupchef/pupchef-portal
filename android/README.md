# Android (Capacitor)

The WebView loads files from `app/src/main/assets/public/` (copied from the Vite `dist/` build).

**Android Studio “Run”** triggers a Gradle `preBuild` step that runs `npm run mobile:copy:android` in the parent `pupchef-portal` folder (`vite build` + **`cap copy android`** only). It does **not** run `cap sync` during the Gradle build — `cap sync` can rewrite native projects **mid-build** and delete files such as `aar-metadata.properties` or merged manifests.

Use full sync when you add/change native plugins or Capacitor config (from `pupchef-portal`):

```bash
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

## Magic link opens the app (App Links)

See **`docs/PORTAL_APP_LINKS.md`** — deploy `/.well-known/assetlinks.json`, set `VITE_PORTAL_URL`, add the redirect URL in Supabase, and replace the SHA-256 placeholder in `public/.well-known/assetlinks.json`.
