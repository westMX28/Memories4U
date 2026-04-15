# Make Management

This repo already uses Make as a downstream store and workflow engine. The management client adds a second capability: validating API access to the Make organization and exercising scenario create/update/delete paths from the repo itself.

## Environment

Set these variables before using the management client or validation script:

- `MEMORIES_MAKE_API_KEY`
- `MEMORIES_MAKE_API_BASE_URL`
- `MEMORIES_MAKE_ORGANIZATION_ID`
- `MEMORIES_MAKE_TEAM_ID`

For the current account validated in [WES-89](/WES/issues/WES-89):

- Base URL: `https://eu1.make.com/api/v2`
- Organization ID: `6210072`
- Team ID: `794440`

## Validation

Run:

```bash
npm run make:validate
```

The script bootstraps Next.js-style repo env files before it touches the Make client, so `.env.local`, `.env.development.local`, and `.env` values are available during local validation runs.

For unattended backend runs, the same variables still need secure runtime injection. This workspace does not currently contain a checked-in `.env.local`, so validation here still depends on either injected secrets or a local untracked env file.

The script will:

1. Validate user, organization, team, and scenario visibility.
2. Create a temporary scenario folder.
3. Create a disposable scenario with a minimal JSON blueprint.
4. Patch the scenario name, description, and schedule.
5. Delete the scenario and folder.

That gives future runs a safe write-path check without touching the live Memories scenarios.

## Live migration

Run:

```bash
npm run make:migrate-supabase
```

The migration script:

1. Loads the repo `.env*` files through the same runtime env bootstrap as validation.
2. Inventories the live `Checkout`, `Memories`, `Memories Store Write`, and `Preview Loop` scenarios.
3. Writes blueprint backups under `tmp/make-backups/`.
4. Rewrites `Checkout` and `Preview Loop` to read app-owned canonical state through `/api/memories/:jobId/legacy-state`.
5. Retires the legacy `Memories Store Write` Google Sheets sink explicitly after the direct generation webhook cutover.

Additional requirements:

- `MEMORIES_INTERNAL_API_SECRET` must be injected so the rewritten Make HTTP modules can call the internal compatibility route.
- The script derives the live app base URL from the active `Memories` scenario callback rather than requiring a separate migration-only env var.
