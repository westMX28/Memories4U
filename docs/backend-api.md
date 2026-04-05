# Memories Backend API

This app now owns the API boundary for the first product slice. Make and Cloudinary are downstream integrations, not the product API.

## Public endpoints

`POST /api/memories/create`

- Creates a memory job record.
- Requires `email`, `storyPrompt`, and `sourceImages`.
- Returns `jobId`, `accessToken`, `status`, and a status URL.

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

## Integration boundary

- The Next.js app persists the canonical job state.
- Make receives `create`, `unlock`, and `generate` events through `MEMORIES_MAKE_WEBHOOK_URL`.
- Make reports progress back through `/api/integrations/make/job-update`.
- Cloudinary stays visible in the contract as asset metadata (`provider`, `url`, `publicId`, `format`, dimensions) instead of hidden inside free-form webhook payloads.

## Environment

See `.env.example` for the expected variables.

- `MEMORIES_INTERNAL_API_SECRET` is required for internal callbacks and admin mutations.
- `MEMORIES_MAKE_WEBHOOK_URL` and `MEMORIES_MAKE_API_KEY` are optional until Make is wired.
- `MEMORIES_CLOUDINARY_CLOUD_NAME` is optional metadata for the current slice.

## Current limitation

The first slice uses a file-backed store at `MEMORIES_DATA_FILE`. That keeps the implementation simple and testable in this repo, but production deployment will need durable storage because Vercel filesystem writes are ephemeral.
