# Portal magic links → mobile app

## Why `auth/native-handoff.html` (not `/auth/callback`)

If **`redirect_to`** is **`https://…/auth/callback`**, the **full React app** loads in Chrome, **`AuthCallbackPage`** runs, and you are **logged in on the web** first. Chrome may then show an “Open in app” bar. That is the wrong order.

The native flow uses **`emailRedirectTo` = `https://my.pupchef.ae/auth/native-handoff.html`** (override with `VITE_NATIVE_AUTH_REDIRECT`). That file is **only** a few lines: it **immediately** navigates to **`pupchef://auth/callback` + the same URL hash** (tokens). No bundle, no session in the browser.

1. **Supabase** → Authentication → URL Configuration → **Redirect URLs**: add **`https://my.pupchef.ae/auth/native-handoff.html`** (use your real origin if different). Keep **`https://my.pupchef.ae/auth/callback`** for normal **web** login. You can keep **`pupchef://auth/callback`** if you added it earlier; it does not hurt.

2. **Android** (`AndroidManifest.xml`): intent-filter for **`pupchef`** → **`auth`** → **`/callback`** (already in this repo).

3. **`/.well-known/assetlinks.json`**: optional for other HTTPS entry points; deploy as before.

4. **SHA-256** in `assetlinks.json`: debug keystore for emulator; add Play signing when you ship.

Chrome may still show a **brief** system UI the first time it hands off to a **custom scheme**; that is separate from loading the account UI in the browser. On the device: **Settings → Apps → PupChef → Open by default** and enable supported links if you want the OS to prefer the app.

## iOS (optional)

Register the **`pupchef`** URL scheme in Xcode, or use Universal Links; add the same Supabase redirect URLs.
