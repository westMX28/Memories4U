import { loadMemoriesRuntimeEnv } from '@/lib/memories/runtime-env';
import { validateSupabaseRestAccess } from '@/lib/memories/supabase-validation';

async function main() {
  loadMemoriesRuntimeEnv();
  console.log(JSON.stringify(await validateSupabaseRestAccess(), null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
