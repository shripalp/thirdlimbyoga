# ThirdLimbYoga (thirdlimbyoga.com) — AGENTS

## Stack
- Next.js (App Router) + Tailwind
- Sanity CMS
- Stripe (subscriptions)
- Auth.js / NextAuth
- Prisma + Neon Postgres
- Deploy: Netlify + GitHub

## Must-not-break flows
- Pricing → Stripe Checkout (subscription)
- Webhook updates membership status
- Members login (Email magic link + Google)
- Members page shows:
  - membership active/inactive
  - class link (only if active)
  - manage/cancel membership (Stripe portal)

## Dev checks after changes
- `npm run lint` (optional)
- `npm run build` (must pass)
- Quick smoke test:
  - /pricing button works
  - /members/login loads (no looping)
  - /members shows status

## Git automation (your preference)
After any change that:
- passes `npm run build`, AND
- you (the user) confirm it looks correct in the browser,
do this automatically:
- `git status`
- `git add -A`
- `git commit -m "<type>: <short summary>"`

Commit message types:
- `feat:` new feature
- `fix:` bug fix
- `ux:` user experience / UI polish
- `chore:` maintenance (deps, config)

Never push — user will push manually.

## Git safety
Never commit generated folders:
- `.next/`
- `.netlify/`
- `node_modules/`

If any of these appear in `git status`, stop and fix `.gitignore`.

## Development workflow

Do NOT run `npm run dev` automatically.

User runs the dev server manually and keeps it running:
- `npm run dev`

After code edits:
1. Run `npm run build`
2. If build passes, user refreshes the browser and confirms it looks correct
3. Then run git automation steps (add + commit)

Restart the dev server ONLY when:
- `.env.local` changes
- auth config/env changes (OAuth IDs, AUTH_URL, AUTH_SECRET)
- a change mentions “restart required” in the commit message or notes