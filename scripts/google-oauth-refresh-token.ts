import { loadMemoriesRuntimeEnv } from '@/lib/memories/runtime-env';

type CliOptions = {
  authCode?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scope?: string;
};

type TokenSuccess = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
};

function readOption(args: string[], ...names: string[]) {
  for (let index = 0; index < args.length; index += 1) {
    const candidate = args[index];
    if (!names.includes(candidate)) {
      continue;
    }

    return args[index + 1];
  }

  return undefined;
}

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function parseOptions(argv: string[]): CliOptions {
  return {
    authCode: readOption(argv, '--auth-code', '--code'),
    clientId: readOption(argv, '--client-id'),
    clientSecret: readOption(argv, '--client-secret'),
    redirectUri: readOption(argv, '--redirect-uri'),
    scope: readOption(argv, '--scope', '--scopes'),
  };
}

function requiredValue(value: string, message: string) {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

function buildAuthorizationUrl(clientId: string, redirectUri: string, scope: string) {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('scope', scope);
  return url.toString();
}

async function exchangeAuthorizationCode(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  authCode: string,
) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Google token exchange failed (${response.status}): ${raw}`);
  }

  return JSON.parse(raw) as TokenSuccess;
}

async function validateRefreshToken(clientId: string, clientSecret: string, refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Google refresh-token validation failed (${response.status}): ${raw}`);
  }

  return JSON.parse(raw) as TokenSuccess;
}

async function main() {
  loadMemoriesRuntimeEnv();

  const options = parseOptions(process.argv.slice(2));
  const clientId = options.clientId || readEnv('GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_0AUTH_CLIENT_ID');
  const clientSecret =
    options.clientSecret || readEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_0AUTH_CLIENT_SECRET');
  const redirectUri = options.redirectUri || readEnv('GOOGLE_OAUTH_REDIRECT_URI') || 'http://localhost';
  const scope = options.scope || readEnv('GOOGLE_OAUTH_SCOPE');

  requiredValue(
    clientId,
    'Missing Google OAuth client id. Set GOOGLE_OAUTH_CLIENT_ID or GOOGLE_0AUTH_CLIENT_ID.',
  );
  requiredValue(
    clientSecret,
    'Missing Google OAuth client secret. Set GOOGLE_OAUTH_CLIENT_SECRET or GOOGLE_0AUTH_CLIENT_SECRET.',
  );

  if (!options.authCode) {
    requiredValue(
      scope,
      'Missing Google OAuth scope. Pass --scope or set GOOGLE_OAUTH_SCOPE before generating the auth URL.',
    );

    console.log(
      JSON.stringify(
        {
          step: 'authorize',
          authorizationUrl: buildAuthorizationUrl(clientId, redirectUri, scope),
          redirectUri,
          scope,
          note: 'Open the authorizationUrl, complete consent, then rerun with --auth-code "<code>".',
        },
        null,
        2,
      ),
    );
    return;
  }

  const exchanged = await exchangeAuthorizationCode(
    clientId,
    clientSecret,
    redirectUri,
    options.authCode,
  );

  if (!exchanged.refresh_token) {
    throw new Error(
      'Google returned no refresh_token. Re-run consent with access_type=offline and prompt=consent.',
    );
  }

  const validated = await validateRefreshToken(clientId, clientSecret, exchanged.refresh_token);

  console.log(
    JSON.stringify(
      {
        step: 'exchanged',
        redirectUri,
        grantedScope: exchanged.scope || scope,
        refreshToken: exchanged.refresh_token,
        refreshValidation: {
          accessToken: validated.access_token,
          expiresInSeconds: validated.expires_in,
          tokenType: validated.token_type,
        },
        suggestedEnv: {
          GOOGLE_OAUTH_CLIENT_ID: clientId,
          GOOGLE_OAUTH_CLIENT_SECRET: '[already configured]',
          GOOGLE_OAUTH_REFRESH_TOKEN: exchanged.refresh_token,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
