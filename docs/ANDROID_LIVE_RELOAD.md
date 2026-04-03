# Android: fast preview (Vite live reload in the app)

The WebView can load your machine’s **Vite dev server** instead of the bundled `dist/`, so UI changes hot-reload without `npm run mobile:copy:android` every time.

## Emulator (Android Studio)

1. **Terminal A** — from `pupchef-portal`:

   ```bash
   npm run dev
   ```

2. **Terminal B** — point the native project at the dev server and sync Capacitor config (`10.0.2.2` is the emulator’s alias for your computer’s localhost):

   ```bash
   npm run mobile:dev:android
   ```

3. **Android Studio** — so Gradle does **not** overwrite the dev config on every Run:
   - **Run → Edit Configurations…** → your app configuration → **Environment variables**
   - Add: `SKIP_CAP_WEB_COPY` = `1`
   - **Apply**, then **Run** the app.

4. Edit React/CSS; Vite should reload the WebView after a save.

**Stop live reload** (back to bundled `dist/`):

- Remove `SKIP_CAP_WEB_COPY` from the Run configuration (or set it to `0`).
- From `pupchef-portal`:

  ```bash
  npm run mobile:copy:android
  ```

- Run the app again so Gradle copies a fresh production bundle.

## Physical Android device (USB / same Wi‑Fi)

1. Find your Mac’s LAN IP (e.g. **System Settings → Network**), e.g. `192.168.1.42`.

2. `npm run dev` (Vite already listens on all interfaces via `host: true` in `vite.config.ts`).

3. Sync with that IP:

   ```bash
   CAPACITOR_DEV_SERVER_URL=http://YOUR_LAN_IP:5173 npx cap sync android
   ```

4. Keep **`SKIP_CAP_WEB_COPY=1`** in the Run configuration while testing live reload.

## iOS (Simulator)

From `pupchef-portal`:

```bash
npm run dev
npm run mobile:dev:ios
```

Open **`ios/App/App.xcworkspace`** in Xcode and Run. Use **`127.0.0.1`** only on the Simulator; a real iPhone needs your LAN IP in `CAPACITOR_DEV_SERVER_URL` like Android above.

## Notes

- **Magic link / auth**: session often survives reloads; sign out or clear app data when you need a clean login test.
- **Production / CI**: never set `CAPACITOR_DEV_SERVER_URL` or `SKIP_CAP_WEB_COPY` for release builds.
