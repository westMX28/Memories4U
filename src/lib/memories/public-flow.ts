import { getMemoriesConfig } from '@/lib/memories/config';

export function isMemoriesOrderingAvailable() {
  const { stripeSecretKey, stripePriceId } = getMemoriesConfig();
  return Boolean(stripeSecretKey && stripePriceId);
}

export function resolvePublicAppUrl(request: Request) {
  const { appUrl } = getMemoriesConfig();
  if (appUrl.trim()) {
    return appUrl.replace(/\/$/, '');
  }

  return new URL(request.url).origin;
}
