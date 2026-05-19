# Karibu VMS

Karibu VMS is a Next.js visitor management system for public QR check-in, guard workflows, host confirmation, billing, M-Pesa payments, and superadmin operations.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Use `.env.example` as the template. Keep real secrets in Vercel Project Settings or a local `.env.local` file only. Do not commit production values.

Required groups:

- `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL`: public HTTPS domain, for example `https://example.com`.
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- PayHero: `PAYHERO_API_USERNAME`, `PAYHERO_API_PASSWORD`, `PAYHERO_CHANNEL_ID`, and `PAYHERO_CALLBACK_URL`.
- Resend: `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. `RESEND_FROM_EMAIL` must be a verified sender/domain in Resend.
- Africa's Talking: `AFRICASTALKING_USERNAME` and `AFRICASTALKING_API_KEY`.
- Cloudflare R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL`.
- `CRON_SECRET`: long random token used by Vercel Cron to authorize PayHero rechecks.
- Sentry: `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` when release upload is enabled.

## Supabase Setup

1. Create a Supabase project and apply all files in `supabase/migrations`.
2. Configure Authentication email settings for the production domain.
3. Set RLS policies from the migrations before exposing public check-in.
4. Store only the anon key in public variables. The service role key belongs only in server-side Vercel environment variables.

## Vercel Setup

1. Import the repository into Vercel.
2. Add every variable from `.env.example` using production values.
3. Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, and `PAYHERO_CALLBACK_URL` to the production HTTPS domain.
4. Keep `vercel.json` enabled. It runs `/api/payhero/recheck` every 30 minutes so recent PayHero transactions are rechecked for reversals.
5. Set `CRON_SECRET`; Vercel Cron includes it as a bearer token when invoking the cron route.

## PayHero Setup

- Use the production channel ID in `PAYHERO_CHANNEL_ID`.
- Set the PayHero callback URL to `https://your-domain.example/api/payhero/callback`.
- Confirm the callback reaches the live Vercel domain, not a preview deployment.
- The app also rechecks PayHero `pending`, `paid`, `success`, and `completed` transactions from the previous 48 hours through `/api/payhero/recheck`.
- Reversed, refunded, or chargeback statuses are marked `reversed`, billing is reconciled, the balance due is restored, and revenue excludes the transaction.

## Resend Setup

- Verify the sending domain in Resend before launch.
- Set `RESEND_FROM_EMAIL` to the verified sender, for example `Karibu VMS <notifications@example.com>`.
- Host notification requests must send only `visitorId` and `companyId`; the API fetches visitor, host, and company details server-side.

## Africa's Talking Setup

- Add `AFRICASTALKING_USERNAME` and `AFRICASTALKING_API_KEY` in Vercel.
- Confirm the SMS sender and account balance before testing guard OTP.
- The OTP route should be tested on the production domain after deployment.

## Production Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --audit-level=high
```

Manual checks before launch:

- Public visitor registration creates a pending visitor.
- Public host list returns only `id`, `name`, and `department_id`.
- Host notification email sends from `RESEND_FROM_EMAIL`.
- Guard OTP send and confirmation still work.
- PayHero live-domain callback updates transactions.
- Reversed PayHero payments restore balances and prevent accounts from remaining active.
- Superadmin revenue excludes failed, reversed, and cancelled payments.
