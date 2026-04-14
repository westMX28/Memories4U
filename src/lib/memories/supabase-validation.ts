import { getMemoriesConfig } from '@/lib/memories/config';

export type SupabaseValidationCheck = {
  table: string;
  select: string;
  ok: boolean;
  status: number;
};

export type SupabaseValidationSummary = {
  ok: boolean;
  supabaseUrl: string;
  checkedTables: string[];
  checks: SupabaseValidationCheck[];
};

export const supabaseValidationSelections = {
  orders: 'id,client_request_id,status,updated_at',
  generation_jobs: 'order_id,status,updated_at',
  generated_assets: 'order_id,kind,url',
  event_log: 'id,order_id,status,created_at',
} as const;

function createSupabaseHeaders(serviceRoleKey: string) {
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    'content-type': 'application/json',
  };
}

async function probeTable(
  fetchImpl: typeof fetch,
  supabaseUrl: string,
  serviceRoleKey: string,
  timeoutMs: number,
  table: string,
  select: string,
): Promise<SupabaseValidationCheck> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=1`,
      {
        method: 'GET',
        headers: createSupabaseHeaders(serviceRoleKey),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Supabase probe failed for ${table} with ${response.status}: ${body.trim() || 'no response body'}`,
      );
    }

    return {
      table,
      select,
      ok: true,
      status: response.status,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateSupabaseRestAccess(fetchImpl: typeof fetch = fetch) {
  const { supabaseUrl, supabaseServiceRoleKey, supabaseTimeoutMs } = getMemoriesConfig();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Supabase validation requires MEMORIES_SUPABASE_URL and MEMORIES_SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  const checks = [];
  for (const [table, select] of Object.entries(supabaseValidationSelections)) {
    checks.push(await probeTable(fetchImpl, supabaseUrl, supabaseServiceRoleKey, supabaseTimeoutMs, table, select));
  }

  return {
    ok: true,
    supabaseUrl,
    checkedTables: Object.keys(supabaseValidationSelections),
    checks,
  } satisfies SupabaseValidationSummary;
}
