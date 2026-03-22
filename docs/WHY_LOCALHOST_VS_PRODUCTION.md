# Why login looks different on localhost vs my.pupchef.ae

## The short version

**Your laptop runs the code in this folder.**  
**my.pupchef.ae runs whatever was last deployed to Vercel** (a separate copy).

If you did **not** `git push` and **redeploy** the **pupchef-portal** project after we changed login, production is still an **older build** — for example the old “DEV MODE” box and the old flow that did not send Supabase emails.

## What to do

1. Commit and push `pupchef-portal` to the branch Vercel uses (usually `main`).
2. Vercel → **pupchef-portal** → confirm a new deployment finished.
3. **Environment variables** on that project must include `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (production PupOps URL). Redeploy after any change (Vite bakes env at build time).
4. Hard-refresh `https://my.pupchef.ae` (or open in a private window).

## After deploy, you should see

- Login copy like “If an account exists… we sent a login link” — **no** green DEV box (that UI is not in the current repo).
- Magic link emails from **Supabase** (if SMTP is set in Supabase), assuming the live portal calls `signInWithOtp`.

## pup-ops

Deploy **pup-ops** too when its API changed (`/api/portal/magic-link`, Supabase env, etc.). The portal’s `VITE_API_URL` must point at that deployment.
