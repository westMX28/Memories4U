# Supabase Cutover Validation - 2026-04-13

## Scope checked

- Repo test suite for the Memories API, canonical store, and Supabase path.
- Live Supabase REST access for the canonical tables this app expects.
- Live Make management access and current scenario inventory for the team.

## Evidence

### 1. Repo validation

Command:

```bash
npm test
```

Result:

- 51 tests passed.
- Included coverage for:
  - Supabase-backed canonical store writes and reads
  - create idempotency via `clientRequestId`
  - checkout, unlock, media, delivery, and operator-status routes
  - Make handoff behavior staying non-canonical
  - Supabase validation helpers and row-shape checks

### 2. Live Supabase validation

Command:

```bash
npm run supabase:validate
```

Result:

- Supabase project responded successfully for:
  - `orders`
  - `generation_jobs`
  - `generated_assets`
  - `event_log`
- Required columns validated, including `orders.client_request_id`.

Observed project:

- `https://vltavhzyqeuyuykdqsof.supabase.co`

### 3. Live Make management validation

Command:

```bash
npm run make:validate
```

Result:

- Make API auth succeeded.
- Organization and team access succeeded.
- Temporary scenario folder and scenario create/patch/delete flow succeeded.

### 4. Live Make scenario inventory

Command:

```bash
curl -H "Authorization: Token $MAKE_API" \
  "https://eu1.make.com/api/v2/scenarios?teamId=$MAKE_TEAM_ID"
```

Observed active scenarios still carrying Google Sheets modules:

- `Checkout` uses `google-sheets`
- `Memories` uses `google-sheets`
- `Memories Store Write` uses `google-sheets`
- `Preview Loop` uses `google-sheets`

This is the decisive blocker for declaring the Supabase cutover complete.

## Conclusion

- The app-side Supabase path is implemented far enough to validate locally and against the live Supabase project.
- The Make control plane is reachable and mutable.
- The live Make scenarios are still Google Sheets-based, so Google Sheets is not yet out of the production critical path.
- Because of that, there is not yet an honest end-to-end production cutover proof for the requested workflow.

## Rollback / safety note

- Current safety comes from the fact that the production Make scenarios still have the pre-cutover Google Sheets path in place.
- After the real Make scenario rewrite lands, the rollback lever should be to restore the prior scenario version or re-enable the prior Google Sheets-backed scenario path before further customer traffic is processed.
- No cleaner production rollback was validated in this pass.

## Next required work

- Rewrite the live Make scenarios so Supabase becomes the canonical state surface and the scenarios use app callbacks instead of Sheets as state storage.
- Re-run a full create -> checkout -> unlock -> generation updates -> delivery validation against the live workflow after that rewrite.
