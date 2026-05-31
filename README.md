# Karibu VMS

Karibu VMS is a Next.js visitor management system for public QR check-in, guard workflows, host confirmation, billing, M-Pesa payments, and superadmin operations.

Live website: https://www.karibuvms.com

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

- `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL`: public HTTPS domain, for example `https://www.karibuvms.com`.
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- PayHero: `PAYHERO_API_USERNAME`, `PAYHERO_API_PASSWORD`, `PAYHERO_CHANNEL_ID`, and `PAYHERO_CALLBACK_URL`.
- Resend: `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. `RESEND_FROM_EMAIL` must be a verified sender/domain in Resend.
- Africa's Talking: `AFRICASTALKING_USERNAME`, `AFRICASTALKING_API_KEY`, and optional `AFRICASTALKING_SENDER_ID`.
- Cloudflare R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL` if image uploads use R2.
- Sentry: `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` only when release upload is enabled.

Never prefix backend secrets with `NEXT_PUBLIC_`. PayHero, Resend, Africa's Talking, R2 secret keys, Sentry auth token, and Supabase service role key must stay server-only.

## Supabase Setup

1. Create a Supabase project and apply all files in `supabase/migrations`.
2. Configure Authentication email settings for the production domain.
3. Set RLS policies from the migrations before exposing public check-in.
4. Store only the anon key in public variables. The service role key belongs only in server-side Vercel environment variables.

## Vercel Setup

1. Import the repository into Vercel.
2. Add every variable from `.env.example` using production values.
3. Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, and `PAYHERO_CALLBACK_URL` to the production HTTPS domain.
4. Deploy after adding or changing environment variables.

## PayHero Setup

- Use the production channel ID in `PAYHERO_CHANNEL_ID`.
- Set the PayHero callback URL to `https://www.karibuvms.com/api/payhero/callback`.
- Confirm the callback reaches the live Vercel domain, not a preview deployment.
- Confirm the PayHero/M-Pesa prompt displays the correct expected merchant or collection name before accepting customer payments.
- PayHero callback/status handling marks reversed, refunded, or chargeback statuses as `reversed`, reconciles billing, restores the balance due, and excludes the transaction from revenue.

## Resend Setup

- Verify the sending domain in Resend before launch.
- Set `RESEND_FROM_EMAIL` to the verified sender, for example `Karibu VMS <notifications@send.karibuvms.com>`.
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
- Guard OTP send and confirmation still works.
- PayHero live-domain callback updates transactions.
- Reversed PayHero payments restore balances and prevent accounts from remaining active.
- Superadmin revenue excludes failed, reversed, and cancelled payments.
