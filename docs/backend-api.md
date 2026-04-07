# Memories Backend API

This app now owns the API boundary for the first product slice. Make and Cloudinary are downstream integrations, not the product API.

## Public endpoints

`POST /api/memories/create`

- Creates a memory job record.
- Requires `email`, `storyPrompt`, and `sourceImages`.
- Returns `jobId`, `accessToken`, `status`, and a status URL.

`POST /api/memories/:jobId/checkout`

- Creates a Stripe-hosted Checkout Session for an existing `created` job.
- Requires `x-memories-access-token`.
- Returns `checkoutUrl` and `sessionId`.

`GET /api/memories/:jobId/status?accessToken=...`

- Returns the current job status, preview/final asset info, delivery info, and last error.
- Intended for the customer status page or polling from the frontend.

`POST /api/memories/:jobId/unlock`

- Marks the job unlocked after payment confirmation.
- Accepts either internal auth or `x-memories-access-token` for the first slice.
- If a Make webhook is configured, unlock also dispatches the workflow handoff.

## Internal endpoints

`POST /api/memories/:jobId/media`

- Requires `Authorization: Bearer $MEMORIES_INTERNAL_API_SECRET`.
- Commands:
  - `request_generation`
  - `mark_processing`
  - `mark_preview_ready`
  - `mark_completed`
  - `mark_failed`

`POST /api/memories/:jobId/delivery`

- Requires internal auth.
- Records delivery confirmation and marks the job as `delivered`.

`POST /api/integrations/make/job-update`

- Requires internal auth.
- Lets Make update a job with one of:
  - `queued`
  - `processing`
  - `preview_ready`
  - `completed`
  - `failed`
  - `delivered`

`POST /api/integrations/stripe/webhook`

- Verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET`.
- Accepts `checkout.session.completed`.
- Maps the completed Stripe session back into the existing `/unlock` business boundary by calling the same unlock service idempotently.

## Integration boundary

- When `MEMORIES_MAKE_READ_WEBHOOK_URL` and `MEMORIES_MAKE_WRITE_WEBHOOK_URL` are configured, the Next.js app treats Make + Google Sheets as the canonical job store.
- Stripe is only used for payment initiation and confirmation. The application state still changes through the existing job lifecycle and unlock logic.
- `MEMORIES_MAKE_WEBHOOK_URL` remains a legacy fallback and is used for both read and write paths when the split variables are omitted.
- The app sends a flat JSON control contract to Make:
  - Write hook:
    `create`, `unlock`, and `update` send `{ action, jobId, status, payload }` where `payload` is the serialized canonical row JSON. The row includes `jobId`, `accessToken`, `email`, `customerName`, `storyPrompt`, `sourceImage1Url`, `sourceImage2Url`, `status`, `paymentState`, `paymentReference`, `previewAssetUrl`, `finalAssetUrl`, `deliveryEmail`, `lastError`, `createdAt`, and `updatedAt`
  - Read hook:
    `status` sends `{ action, jobId }`
- Make should respond with the canonical row JSON body. For missing `status`, the read hook can return `404` or an empty JSON object.
- `/api/integrations/make/job-update`, `/api/memories/:jobId/media`, and `/api/memories/:jobId/delivery` remain internal write paths, but they now need to flow into that same canonical row store instead of a local production file.
- Cloudinary stays visible in the contract as asset metadata (`provider`, `url`, `publicId`, `format`, dimensions) instead of hidden inside free-form webhook payloads.

## Environment

See `.env.example` for the expected variables.

- `MEMORIES_INTERNAL_API_SECRET` is required for internal callbacks and admin mutations.
- `STRIPE_SECRET_KEY` or `STRIPE_API_KEY`, plus `STRIPE_WEBHOOK_SECRET` and `STRIPE_PRICE_ID`, are required for the hosted checkout flow.
- `MEMORIES_MAKE_READ_WEBHOOK_URL` and `MEMORIES_MAKE_WRITE_WEBHOOK_URL` enable the split Make-backed store.
- `MEMORIES_MAKE_WEBHOOK_URL` remains available as the single-hook fallback.
- `MEMORIES_MAKE_API_KEY` carries any shared secret required by the Make hooks.
- `MEMORIES_MAKE_API_BASE_URL`, `MEMORIES_MAKE_ORGANIZATION_ID`, and `MEMORIES_MAKE_TEAM_ID` enable direct Make management validation from the repo.
- `MEMORIES_DATA_FILE` is now a local development fallback only.
- `MEMORIES_CLOUDINARY_CLOUD_NAME` is optional metadata for the current slice.

## Make management

- Use `src/lib/memories/make-management.ts` for direct organization, team, and scenario access.
- Use `npm run make:validate` for a disposable end-to-end access check that creates, patches, and deletes temporary Make assets.
- The validation script loads repo `.env*` files through Next's env loader, but production-style automation still needs the Make management variables injected as secrets instead of committed to the repo.

## Current limitation

Production still depends on the board updating the Make scenarios/webhooks to honor the new JSON contract and write the richer Google Sheets schema. Until that live Make side is updated and validated, local tests only verify the app contract and fallback behavior.
