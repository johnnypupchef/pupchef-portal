# Portal magic links → mobile app

## Why `pupchef://` (not only `https://`)

If the magic link uses **`redirect_to=https://my.pupchef.ae/auth/callback`**, Chrome (or the in-app browser) **keeps the whole flow in the browser** after Supabase verifies: the redirect lands on your site **inside the same tab**, so you get logged in on the web, not in the Capacitor app.

The native app therefore requests Supabase with **`emailRedirectTo` = `pupchef://auth/callback`** (override with `VITE_NATIVE_AUTH_REDIRECT`). After verify, Supabase redirects to that custom URL; Android resolves it to your app instead of leaving you in Chrome.

1. **Supabase Dashboard** → Authentication → URL Configuration → **Redirect URLs**: add **`pupchef://auth/callback`** (keep `https://my.pupchef.ae/auth/callback` too if you use web login).

2. **Android** (`AndroidManifest.xml`): intent-filter for `pupchef` → `auth` → path `/callback` is already in this repo.

3. **`/.well-known/assetlinks.json`** (HTTPS App Links): still useful if something opens `https://my.pupchef.ae/auth/...` from outside Chrome’s redirect chain; deploy as before.

4. **SHA-256** in `assetlinks.json`: debug keystore for emulator; add Play signing when you ship. See keytool commands in git history or Android docs.

5. **Custom domain**: If you change `VITE_PORTAL_URL` / HTTPS host, update the HTTPS intent-filter and `assetlinks.json` on that host.

## iOS (optional)

Register the same custom URL scheme in Xcode, or use Universal Links with `apple-app-site-association` and add the HTTPS callback to Supabase.
