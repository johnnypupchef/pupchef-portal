# Portal magic links → mobile app (App Links / Universal Links)

The native app requests Supabase magic links with `emailRedirectTo` = **`https://my.pupchef.ae/auth/callback`** (override with `VITE_PORTAL_URL`). That URL must match:

1. **Supabase Dashboard** → Authentication → URL Configuration → **Redirect URLs**: add `https://my.pupchef.ae/auth/callback` (and your staging URL if any).

2. **Deployed portal** (`my.pupchef.ae`): must serve **`/.well-known/assetlinks.json`** from this repo (`public/.well-known/` → Vite `dist`). After deploy, verify:
   - `https://my.pupchef.ae/.well-known/assetlinks.json` returns **200** with `Content-Type: application/json` (no HTML redirect).

3. **SHA-256 fingerprints** in `assetlinks.json`:
   - **Emulator and Android Studio** use the **debug keystore**, not Google Play. Play App Signing only matters after you ship to the store (then add that certificate’s SHA-256 alongside debug if you test release builds).
   - Debug fingerprint:

     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```

   - Copy the **SHA256** line and remove **colons** → 64 hex characters. The repo currently includes **one** debug fingerprint; add more array entries if teammates have different debug keystores or when you add a release signing key.

4. **Android Studio**: uninstall the app, reinstall, then open a magic link again. Google verifies App Links asynchronously; first open may still ask “Open with Chrome or PupChef” until verification succeeds.

5. **Custom domain**: If `VITE_PORTAL_URL` is not `https://my.pupchef.ae`, update **`android/app/src/main/AndroidManifest.xml`** intent-filter `android:host` to match, redeploy `assetlinks.json` on that host, and add the same URL in Supabase.

## iOS (optional)

Add Associated Domains in Xcode (`applinks:my.pupchef.ae`) and host **`/.well-known/apple-app-site-association`** (no extension) with your Team ID and bundle id. Same redirect URL in Supabase.
