# Karibu VMS Security Test Checklist

Use local or staging data only. Do not call production PayHero, Supabase, SMS, or email providers during abuse testing.

## Threat Model

- Unauthenticated visitor: can view public pages and public QR check-in data only.
- QR visitor: can submit visitor registration but cannot read restricted visitors, dashboards, transactions, or company private data.
- Guard: can operate within their assigned company and cannot access company admin or superadmin APIs.
- Company admin: can manage only their own company resources and cannot access another company by changing IDs.
- Malicious company admin: may modify frontend JavaScript, request bodies, query params, plan values, or billing data.
- Superadmin compromise: highest-impact account; requires strong auth, audit logging, and production MFA outside this codebase.
- Payment attacker: may replay callbacks, alter amounts, initiate duplicate payments, or use another companyId.

## Manual Authorization Tests

- `GET /api/billing/current?companyId=<other-company-id>` with company admin token: expect `403`.
- `POST /api/payhero/initiate` with another companyId: expect `403`.
- `POST /api/companies/update-plan` as company admin for another company: expect `403`.
- `POST /api/companies/update-plan` as company admin with `trial_basic` or `trial_premium`: expect `403`.
- `GET /api/superadmin/stats` as company admin or guard: expect `403`.
- `GET /api/superadmin/guards-count` as company admin or guard: expect `403`.
- `POST /api/admins` as company admin or guard: expect `403`.
- `POST`, `PUT`, `DELETE` for `/api/departments`, `/api/hosts`, `/api/gates`, `/api/red-flags` with another company's resource id: expect `403`.
- Protected API request with no `Authorization` header: expect `401`.
- Protected API request with an invalid bearer token: expect `401`.

## Payment Abuse Tests

- Send `amount`, `plan`, `balance`, or `status` fields to `/api/payhero/initiate`: backend should ignore them.
- Initiate payment with invalid phone: expect `400`.
- Initiate payment while balance is zero: expect `400`.
- Initiate payment while trial is active: expect `400`.
- Initiate payment while company is hard locked: expect `403`.
- Initiate repeated payments within one minute: expect `429`.
- Replay the same successful PayHero callback twice: company credit should only be applied once.
- Callback with successful status and wrong amount: transaction should be marked failed and company should not be credited.
- Callback without a matching pending transaction/reference: expect `400`.

## Trial Abuse Tests

- Register public workspace with `trial_basic` or `trial_premium` in request body: stored plan should be `basic` unless server-side superadmin assigns a trial.
- Company admin direct API plan change to trial: expect `403`.
- Active trial billing summary: `currentBalance` should be `0`.
- Expired trial billing summary: backend should convert to the base plan and calculate paid billing.

## Data Leak Checks

- Company admin billing UI should not fetch `raw_callback_payload`, `raw_initiate_response`, full phone numbers, provider references, or checkout request IDs.
- Public QR flow should not fetch `/api/red-flags`; restricted visitor matching happens server-side in `/api/visitors/register`.
- Search frontend bundle for `SUPABASE_SERVICE_ROLE_KEY`, `PAYHERO_API_PASSWORD`, `AFRICASTALKING_API_KEY`, `RESEND_API_KEY`, and private callback payload fields.

## XSS Tests

Use harmless payload text such as `<script>alert("xss-test")</script>` in:

- Company name
- Visitor name
- ID number
- Vehicle registration
- Visit purpose
- Custom fields
- Host and department names
- Gate names
- Support subject and description
- Restricted visitor reason

Expected result: text is escaped; no script executes.

## Production Readiness

- Run with Node `>=20.9.0`.
- Run `npm run lint`.
- Run `npx tsc --noEmit`.
- Run `npm run build`.
- Run `npm audit --audit-level=high`.
- Confirm `.env.local` is not committed.
- Confirm `.env.example` contains placeholders only.
- Confirm private routes are `noindex`, robots blocks dashboard/API routes, and sitemap contains only public routes.
