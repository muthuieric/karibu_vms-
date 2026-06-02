# Offline guard sync

This branch adds the first offline-registration layer for Karibu VMS.

## What works in this MVP

- The service worker caches the app shell and previously visited pages.
- Failed `POST /api/visitors/register` requests are saved in IndexedDB.
- Saved records are marked as offline pending sync.
- When the browser comes back online, pending records are retried against `/api/visitors/register`.
- The backend remains the final source of truth for restricted visitor checks, host validation, gate validation, and final cloud registration.

## Important limits

- A visitor page must be opened at least once while online before it can be loaded from cache offline.
- Offline mode does not perform live restricted visitor checks. Records become final only after cloud sync succeeds.
- Offline photo/selfie upload is not fully supported yet. If photo upload fails before registration, the form still shows an error instead of saving the image locally.
- Host and department lists depend on the last online load until a fuller offline settings cache is added.
- QR pass generation happens in the backend, so offline registrations do not receive a QR pass until synced.

## Next improvements

1. Cache company rules, gate details, hosts, departments, and custom fields in IndexedDB after every successful online load.
2. Add a visible pending-sync counter for guards/admins.
3. Add an offline records review page with retry/delete controls.
4. Add duplicate protection using local idempotency keys.
5. Add optional offline restricted-hash cache for higher-risk sites, with careful privacy controls.
6. Add offline photo queue support after the text-only registration flow is stable.
