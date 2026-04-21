# Memories Backend API

This app now owns the API boundary for the first product slice. Make and Cloudinary are downstream integrations, not the product API.

## Public endpoints

`POST /api/memories/create`

- Creates a memory job record.
- Accepts either:
  - `application/json` with `email`, `storyPrompt`, and `sourceImages` containing one or two public image URLs, or
  - `multipart/form-data` with `email`, `storyPrompt`, `image1` (required), and `image2` (optional) for direct `png` / `jpg` / `jpeg` uploads.
- Optionally accepts a create idempotency key as either top-level `clientRequestId` or `metadata.clientRequestId` on either input shape. When present, create becomes idempotent for that customer email plus request id and reuses the existing canonical job instead of minting a duplicate.
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

`GET /api/memories/:jobId/operator-status`

- Requires internal auth via `Authorization: Bearer $MEMORIES_INTERNAL_API_SECRET` or `x-memories-internal-secret`.
- Returns the internal operator view for one order:
  - `summary`: order/job id, created/updated timestamps, customer email, and derived order state
  - `payment`: derived payment status plus provider/reference when present
  - `generation`: canonical generation status, unlocked flag, and last error
  - `assets`: preview/final presence booleans plus metadata when present
  - `delivery`: delivery presence plus provider/recipient/reference fields when present
  - `history`: explicitly `current_state_only`; exposes only timestamps and references available on the canonical order without inventing an event timeline

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
- The native Supabase `Checkout` scenario writes the delivered lifecycle directly to Supabase instead of calling this endpoint. This route remains the app-owned internal mutation boundary for any flows that still post delivery updates through the application.

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

- Supabase is the canonical job store when `MEMORIES_SUPABASE_URL` and `MEMORIES_SUPABASE_SERVICE_ROLE_KEY` are configured.
- The app-owned write path persists the current customer/API contract into `orders`, mirrors lifecycle state into `generation_jobs`, mirrors preview/final media into `generated_assets`, and appends lifecycle snapshots into `event_log`.
- The first-pass schema is documented in `docs/supabase-schema.sql`.
- `MEMORIES_DATA_FILE` is only used when `MEMORIES_ALLOW_LOCAL_FILE_STORE=1` is set explicitly for local development or tests.
- Stripe is only used for payment initiation and confirmation. The application state still changes through the existing job lifecycle and unlock logic.
- `MEMORIES_MAKE_WRITE_WEBHOOK_URL` is the preferred worker handoff endpoint for unlock-triggered generation. The app falls back to `MEMORIES_MAKE_WEBHOOK_URL` only when the write-specific endpoint is not configured. Unlock dispatches `{ action: "generate", jobId, status, accessToken, email, customerName, storyPrompt, sourceImage1Url, sourceImage2Url, paymentReference, paymentProvider, createdAt, updatedAt }`.
- Make acknowledgement responses are not treated as canonical row bodies. A `200` or `204` response is enough as long as the scenario later writes lifecycle updates back through `/api/integrations/make/job-update`.
- `/api/integrations/make/job-update`, `/api/memories/:jobId/media`, and `/api/memories/:jobId/delivery` all update the same canonical store boundary behind `src/lib/memories/store.ts`.
- Cloudinary stays visible in the contract as asset metadata (`provider`, `url`, `publicId`, `format`, dimensions) instead of hidden inside free-form webhook payloads.

## Environment

See `.env.example` for the expected variables.

- `MEMORIES_INTERNAL_API_SECRET` is required for internal callbacks and admin mutations.
- `MEMORIES_APP_URL` is optional but recommended as the explicit public base URL for hosted links and checkout redirects. When unset, create/checkout routes fall back to the current request origin.
- `MEMORIES_SUPABASE_URL` and `MEMORIES_SUPABASE_SERVICE_ROLE_KEY` enable the canonical Supabase store.
- `SUPABASE_URL` and `SUPABASE_API` are accepted as production compatibility aliases when the canonical `MEMORIES_*` names are not injected yet.
- `SUPABASE_API` is accepted as the backend secret alias when `MEMORIES_SUPABASE_SERVICE_ROLE_KEY` is not injected yet.
- `MEMORIES_SUPABASE_TIMEOUT_MS` controls timeout/retry budgeting for Supabase REST calls.
- `STRIPE_SECRET_KEY` or `STRIPE_API_KEY`, plus `STRIPE_WEBHOOK_SECRET` and `STRIPE_PRICE_ID`, are required for the hosted checkout flow.
- `MEMORIES_MAKE_WRITE_WEBHOOK_URL` is the preferred generation handoff webhook after unlock.
- `MEMORIES_MAKE_WEBHOOK_URL` remains a compatibility fallback for environments that have not split read/write Make entrypoints yet.
- `MEMORIES_MAKE_API_KEY` carries any shared secret required by that handoff webhook.
- `MEMORIES_MAX_SOURCE_IMAGE_BYTES` caps direct-upload size for the v1 staging path.
- `MEMORIES_MAKE_API_BASE_URL`, `MEMORIES_MAKE_ORGANIZATION_ID`, and `MEMORIES_MAKE_TEAM_ID` enable direct Make management validation from the repo.
- `MEMORIES_DATA_FILE` is now an explicit local-only fallback gated by `MEMORIES_ALLOW_LOCAL_FILE_STORE=1`.
- `MEMORIES_CLOUDINARY_CLOUD_NAME`, `MEMORIES_CLOUDINARY_API_KEY`, and `MEMORIES_CLOUDINARY_API_SECRET` are required for server-side source-image staging.
- `MEMORIES_CLOUDINARY_UPLOAD_FOLDER` optionally overrides the Cloudinary folder prefix for staged source images.

## Make management

- Use `src/lib/memories/make-management.ts` for direct organization, team, and scenario access.
- Use `npm run make:validate` for a disposable end-to-end access check that creates, patches, and deletes temporary Make assets.
- Use `npm run make:migrate-supabase` to back up and rewrite the live `Checkout`, `Preview Loop`, and retired `Memories Store Write` scenarios onto the Supabase-backed shape.
- After the full migration, both `Checkout` and `Preview Loop` read canonical post-payment state directly from Supabase instead of the app-owned compatibility route.
- The validation script loads repo `.env*` files through Next's env loader, but production-style automation still needs the Make management variables injected as secrets instead of committed to the repo.

## Supabase validation

- Use `npm run supabase:validate` for a read-only check that the configured Supabase project exposes the canonical `orders`, `generation_jobs`, `generated_assets`, and `event_log` tables with the key columns this app expects, including `orders.client_request_id`.
- The validation script loads repo `.env*` files through Next's env loader and requires `MEMORIES_SUPABASE_URL` plus `MEMORIES_SUPABASE_SERVICE_ROLE_KEY`.

## Current limitation

The first Supabase integration uses separate REST writes for `orders`, `generation_jobs`, `generated_assets`, and `event_log` instead of a single transactional RPC. `orders` remains canonical, but operators should treat the mirrored tables as eventually consistent until a transactional database function is introduced.

## Operational follow-up

Before pointing production traffic at the Supabase-backed canonical store, the live environment should be checked against this backend contract:

- apply `docs/supabase-schema.sql` to the target Supabase project
- inject `MEMORIES_SUPABASE_URL` and `MEMORIES_SUPABASE_SERVICE_ROLE_KEY` into the runtime
- keep `MEMORIES_DATA_FILE` only for explicitly enabled local fallback; do not rely on it in production
- confirm the Make scenario only performs generation work and calls the app callbacks instead of treating its own rows as source of truth
- validate that canonical `status`, asset URLs, timestamps, and source-image MIME types still satisfy the existing app contract
- coordinate any row-shape changes with the CTO - Technical Manager and Frontend Agent before rollout
