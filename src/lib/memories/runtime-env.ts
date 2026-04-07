import { loadEnvConfig } from '@next/env';

let runtimeEnvLoaded = false;

export function loadMemoriesRuntimeEnv() {
  if (runtimeEnvLoaded) {
    return;
  }

  loadEnvConfig(process.cwd());
  runtimeEnvLoaded = true;
}
