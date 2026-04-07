import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';

type MakeApiEnvelope<T extends string, TValue> = Record<T, TValue>;

export type MakeUser = {
  id: number;
  name: string;
  email: string;
};

export type MakeOrganization = {
  id: number;
  name: string;
  zone: string;
};

export type MakeTeam = {
  id: number;
  name: string;
  organizationId: number;
};

export type MakeScenario = {
  id: number;
  name: string;
  teamId: number;
  folderId: number | null;
  description: string;
  isActive: boolean;
  islinked: boolean;
  scheduling: Record<string, unknown>;
};

export type MakeScenarioFolder = {
  id: number;
  name: string;
  scenariosTotal?: number;
};

export type MakeManagementHealth = {
  user: MakeUser;
  organization: MakeOrganization;
  team: MakeTeam;
  scenarios: MakeScenario[];
};

type MakeScenarioMutationInput = {
  name: string;
  teamId: number;
  blueprint: Record<string, unknown>;
  scheduling?: Record<string, unknown>;
  folderId?: number;
  description?: string;
};

type MakeRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
};

function requireMakeManagementConfig() {
  const { makeApiKey, makeApiBaseUrl, makeOrganizationId, makeTeamId, makeTimeoutMs } =
    getMemoriesConfig();

  if (!makeApiKey) {
    throw new HttpError(503, 'MEMORIES_MAKE_API_KEY is not configured.');
  }

  if (!makeOrganizationId) {
    throw new HttpError(503, 'MEMORIES_MAKE_ORGANIZATION_ID is not configured.');
  }

  if (!makeTeamId) {
    throw new HttpError(503, 'MEMORIES_MAKE_TEAM_ID is not configured.');
  }

  const organizationId = Number(makeOrganizationId);
  const teamId = Number(makeTeamId);

  if (!Number.isInteger(organizationId) || organizationId <= 0) {
    throw new HttpError(500, 'MEMORIES_MAKE_ORGANIZATION_ID must be a positive integer.');
  }

  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new HttpError(500, 'MEMORIES_MAKE_TEAM_ID must be a positive integer.');
  }

  return {
    apiKey: makeApiKey,
    apiBaseUrl: makeApiBaseUrl.replace(/\/$/, ''),
    organizationId,
    teamId,
    timeoutMs: makeTimeoutMs,
  };
}

async function parseResponse(response: Response) {
  const raw = await response.text();
  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new HttpError(502, 'Make management response was not valid JSON.');
  }
}

function assertRecord(value: unknown, message: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(502, message);
  }

  return value as Record<string, unknown>;
}

async function makeManagementRequest<T>(
  path: string,
  envelopeKey: string | null,
  options: MakeRequestOptions = {},
): Promise<T> {
  const { apiKey, apiBaseUrl, timeoutMs } = requireMakeManagementConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const payload = await parseResponse(response);
    if (!response.ok) {
      const detail =
        payload && typeof payload === 'object' && 'detail' in payload && typeof payload.detail === 'string'
          ? payload.detail
          : `Make management request failed with status ${response.status}.`;
      throw new HttpError(response.status, detail);
    }

    if (!envelopeKey) {
      return payload as T;
    }

    const record = assertRecord(payload, 'Make management response was not an object.');
    if (!(envelopeKey in record)) {
      throw new HttpError(502, `Make management response did not include ${envelopeKey}.`);
    }

    return record[envelopeKey] as T;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(502, `Make management request failed for ${path}.`);
  } finally {
    clearTimeout(timeout);
  }
}

function scenarioBlueprint(name: string) {
  return {
    name,
    flow: [
      {
        id: 2,
        module: 'json:ParseJSON',
        version: 1,
        mapper: {},
        metadata: {
          designer: { x: -46, y: 47 },
        },
      },
    ],
    metadata: {
      version: 1,
      scenario: {
        roundtrips: 1,
        maxErrors: 3,
        autoCommit: true,
        autoCommitTriggerLast: true,
        sequential: false,
        confidential: false,
        dataloss: false,
        dlq: false,
        freshVariables: false,
      },
      designer: { orphans: [] },
    },
  };
}

function scenarioScheduling(interval = 900) {
  return { type: 'indefinitely', interval };
}

export function createValidationBlueprint(name: string) {
  return scenarioBlueprint(name);
}

export function createValidationScheduling(interval?: number) {
  return scenarioScheduling(interval);
}

export async function getMakeCurrentUser() {
  const payload = await makeManagementRequest<MakeApiEnvelope<'authUser', MakeUser>>('/users/me', null);
  const record = assertRecord(payload, 'Make users response was not an object.');
  return record.authUser as MakeUser;
}

export async function listMakeOrganizations() {
  const payload = await makeManagementRequest<
    MakeApiEnvelope<'organizations', MakeOrganization[]>
  >('/organizations', null);
  const record = assertRecord(payload, 'Make organizations response was not an object.');
  return Array.isArray(record.organizations) ? (record.organizations as MakeOrganization[]) : [];
}

export async function listMakeTeams(organizationId?: number) {
  const config = requireMakeManagementConfig();
  const payload = await makeManagementRequest<MakeApiEnvelope<'teams', MakeTeam[]>>(
    `/teams?organizationId=${organizationId || config.organizationId}`,
    null,
  );
  const record = assertRecord(payload, 'Make teams response was not an object.');
  return Array.isArray(record.teams) ? (record.teams as MakeTeam[]) : [];
}

export async function listMakeScenarios(teamId?: number) {
  const config = requireMakeManagementConfig();
  const payload = await makeManagementRequest<MakeApiEnvelope<'scenarios', MakeScenario[]>>(
    `/scenarios?teamId=${teamId || config.teamId}`,
    null,
  );
  const record = assertRecord(payload, 'Make scenarios response was not an object.');
  return Array.isArray(record.scenarios) ? (record.scenarios as MakeScenario[]) : [];
}

export async function getMakeScenario(scenarioId: number) {
  return makeManagementRequest<MakeScenario>(`/scenarios/${scenarioId}`, 'scenario');
}

export async function createMakeScenarioFolder(name: string) {
  const config = requireMakeManagementConfig();
  return makeManagementRequest<MakeScenarioFolder>('/scenarios-folders', 'scenarioFolder', {
    method: 'POST',
    body: { name, teamId: config.teamId },
  });
}

export async function deleteMakeScenarioFolder(folderId: number) {
  return makeManagementRequest<number>(`/scenarios-folders/${folderId}`, 'scenarioFolder', {
    method: 'DELETE',
  });
}

export async function createMakeScenario(input: MakeScenarioMutationInput) {
  return makeManagementRequest<MakeScenario>('/scenarios', 'scenario', {
    method: 'POST',
    body: {
      name: input.name,
      teamId: input.teamId,
      folderId: input.folderId,
      description: input.description,
      blueprint: JSON.stringify(input.blueprint),
      scheduling: JSON.stringify(input.scheduling || scenarioScheduling()),
    },
  });
}

export async function updateMakeScenario(
  scenarioId: number,
  patch: {
    name?: string;
    description?: string;
    scheduling?: Record<string, unknown>;
    folderId?: number | null;
  },
) {
  return makeManagementRequest<MakeScenario>(`/scenarios/${scenarioId}`, 'scenario', {
    method: 'PATCH',
    body: {
      ...(patch.name ? { name: patch.name } : {}),
      ...(typeof patch.description === 'string' ? { description: patch.description } : {}),
      ...(patch.scheduling ? { scheduling: JSON.stringify(patch.scheduling) } : {}),
      ...(typeof patch.folderId === 'number' || patch.folderId === null ? { folderId: patch.folderId } : {}),
    },
  });
}

export async function deleteMakeScenario(scenarioId: number) {
  return makeManagementRequest<number>(`/scenarios/${scenarioId}`, 'scenario', {
    method: 'DELETE',
  });
}

export async function validateMakeManagementAccess() {
  const config = requireMakeManagementConfig();
  const [user, organizations, teams, scenarios] = await Promise.all([
    getMakeCurrentUser(),
    listMakeOrganizations(),
    listMakeTeams(config.organizationId),
    listMakeScenarios(config.teamId),
  ]);

  const organization = organizations.find((item) => item.id === config.organizationId);
  const team = teams.find((item) => item.id === config.teamId);

  if (!organization) {
    throw new HttpError(404, `Configured Make organization ${config.organizationId} was not found.`);
  }

  if (!team) {
    throw new HttpError(404, `Configured Make team ${config.teamId} was not found.`);
  }

  return {
    user,
    organization,
    team,
    scenarios,
  } satisfies MakeManagementHealth;
}
