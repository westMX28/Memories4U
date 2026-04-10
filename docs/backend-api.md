# Memories Backend API

This app now owns the API boundary for the first product slice. Make and Cloudinary are downstream integrations, not the product API.

## Public endpoints

`POST /api/memories/create`

- Creates a memory job record.
- Accepts either:
  - `application/json` with `email`, `storyPrompt`, and `sourceImages` containing one or two public image URLs, or
  - `multipart/form-data` with `email`, `storyPrompt`, `image1` (required), and `image2` (optional) for direct `png` / `jpg` / `jpeg` uploads.
- Returns `jobId`, `accessToken`, `status`, a status URL, and the canonical stored `sourceImages` references persisted for downstream processing.
- `statusUrl` uses `MEMORIES_APP_URL` when configured; otherwise it falls back to the incoming request origin.
- Multipart uploads are staged server-side into hosted Cloudinary image URLs before the job record is created, so downstream persistence and Make continue to receive canonical `sourceImages[].url` values.
- Unsupported file types return `400`. Files above `MEMORIES_MAX_SOURCE_IMAGE_BYTES` return `413`.
- If hosted upload staging is not configured, multipart requests return `503` with `{ "error": "Direct image upload is unavailable in this environment.", "code": "UPLOAD_UNAVAILABLE" }`.

`POST /api/memories/:jobId/checkout`

- Creates a Stripe-hosted Checkout Session for an existing `created` job.
- Requires `x-memories-access-token`.
- Returns `checkoutUrl` and `sessionId`.
- If Stripe is not configured in the current environment, returns `503` with `{ "error": "Payment checkout is unavailable in this environment.", "code": "PAYMENT_UNAVAILABLE" }`.

`GET /api/memories/:jobId/status?accessToken=...`

- Returns the current job status, preview/final asset info, delivery info, and last error.
- Intended for the customer status page or polling from the frontend.

`POST /api/memories/:jobId/unlock`

- Marks the job unlocked after payment confirmation.
- Requires internal auth. Customer access tokens cannot unlock or mark a job paid.
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
- Maps the completed Stripe session into the internal payment-confirmation flow idempotently.

## Integration boundary

- When `MEMORIES_MAKE_READ_WEBHOOK_URL` and `MEMORIES_MAKE_WRITE_WEBHOOK_URL` are configured, the Next.js app treats Make + Google Sheets as the canonical job store.
- Stripe is only used for payment initiation and confirmation. The application state still changes through the existing job lifecycle and unlock logic.
- `MEMORIES_MAKE_WEBHOOK_URL` remains a legacy fallback and is used for both read and write paths when the split variables are omitted.
- The app sends a flat JSON control contract to Make:
  - Write hook:
    `create`, `unlock`, and `update` send `{ action, jobId, status, payload }` where `payload` is the serialized canonical row JSON. The row includes `jobId`, `accessToken`, `email`, `customerName`, `storyPrompt`, `sourceImage1Url`, `sourceImage2Url`, `sourceImage1MimeType`, `sourceImage2MimeType`, `sourceImage1Filename`, `sourceImage2Filename`, `sourceImage1Label`, `sourceImage2Label`, `sourceImage1SizeBytes`, `sourceImage2SizeBytes`, `sourceImage1Sha256`, `sourceImage2Sha256`, `status`, `paymentState`, `paymentReference`, `previewAssetUrl`, `finalAssetUrl`, `deliveryEmail`, `lastError`, `createdAt`, and `updatedAt`
  - Read hook:
    `status` sends `{ action, jobId }`
- Make should respond with the canonical row JSON body. For missing `status`, the read hook can return `404` or an empty JSON object.
- Write-hook responses are treated as authoritative canonical rows. `create`, `unlock`, and `update` must return a non-empty JSON row body; `204` or empty write responses are rejected.
- The app validates Make row shape before accepting it into canonical state, including `status`, `createdAt`, `updatedAt`, source-image MIME types, asset URLs, and delivery timestamps.
- `/api/integrations/make/job-update`, `/api/memories/:jobId/media`, and `/api/memories/:jobId/delivery` remain internal write paths, but they now need to flow into that same canonical row store instead of a local production file.
- Cloudinary stays visible in the contract as asset metadata (`provider`, `url`, `publicId`, `format`, dimensions) instead of hidden inside free-form webhook payloads.

## Environment

See `.env.example` for the expected variables.

- `MEMORIES_INTERNAL_API_SECRET` is required for internal callbacks and admin mutations.
- `MEMORIES_APP_URL` is optional but recommended as the explicit public base URL for hosted links and checkout redirects. When unset, create/checkout routes fall back to the current request origin.
- `STRIPE_SECRET_KEY` or `STRIPE_API_KEY`, plus `STRIPE_WEBHOOK_SECRET` and `STRIPE_PRICE_ID`, are required for the hosted checkout flow.
- `MEMORIES_MAKE_READ_WEBHOOK_URL` and `MEMORIES_MAKE_WRITE_WEBHOOK_URL` enable the split Make-backed store.
- `MEMORIES_MAKE_WEBHOOK_URL` remains available as the single-hook fallback.
- `MEMORIES_MAKE_API_KEY` carries any shared secret required by the Make hooks.
- `MEMORIES_MAX_SOURCE_IMAGE_BYTES` caps direct-upload size for the v1 staging path.
- `MEMORIES_MAKE_API_BASE_URL`, `MEMORIES_MAKE_ORGANIZATION_ID`, and `MEMORIES_MAKE_TEAM_ID` enable direct Make management validation from the repo.
- `MEMORIES_DATA_FILE` is now a local development fallback only.
- `MEMORIES_CLOUDINARY_CLOUD_NAME`, `MEMORIES_CLOUDINARY_API_KEY`, and `MEMORIES_CLOUDINARY_API_SECRET` are required for server-side source-image staging.
- `MEMORIES_CLOUDINARY_UPLOAD_FOLDER` optionally overrides the Cloudinary folder prefix for staged source images.

## Make management

- Use `src/lib/memories/make-management.ts` for direct organization, team, and scenario access.
- Use `npm run make:validate` for a disposable end-to-end access check that creates, patches, and deletes temporary Make assets.
- The validation script loads repo `.env*` files through Next's env loader, but production-style automation still needs the Make management variables injected as secrets instead of committed to the repo.

## Current limitation

Production still depends on the board updating the Make scenarios/webhooks to honor the new JSON contract and write the richer Google Sheets schema. Until that live Make side is updated and validated, local tests only verify the app contract and fallback behavior.

## Operational follow-up

Before pointing production traffic at the Make-backed canonical store, the live scenario should be checked against this backend contract:

- `create`, `unlock`, and `update` must always return a non-empty JSON canonical row body.
- `status` may return `404` or an empty JSON object only when the job truly does not exist.
- Canonical row `status` must be one of the backend-supported lifecycle values.
- Canonical row `createdAt`, `updatedAt`, and `delivery.deliveredAt` must be valid timestamps.
- Source-image MIME types must be limited to `image/png` or `image/jpeg`.
- Asset URLs returned in `previewAsset` or `finalAsset` must be valid `http` or `https` URLs.
- Any change to the row shape should be coordinated with the CTO - Technical Manager and Frontend Agent before rollout.
