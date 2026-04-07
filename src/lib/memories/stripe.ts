import Stripe from 'stripe';

import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';

let stripeClient: Stripe | null = null;

export function assertStripeConfigured() {
  const { stripeSecretKey, stripePriceId } = getMemoriesConfig();

  if (!stripeSecretKey) {
    throw new HttpError(503, 'STRIPE_SECRET_KEY or STRIPE_API_KEY is not configured.');
  }

  if (!stripePriceId) {
    throw new HttpError(503, 'STRIPE_PRICE_ID is not configured.');
  }
}

export function getStripeClient() {
  const { stripeSecretKey } = getMemoriesConfig();

  if (!stripeSecretKey) {
    throw new HttpError(503, 'STRIPE_SECRET_KEY or STRIPE_API_KEY is not configured.');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey);
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const { stripeWebhookSecret } = getMemoriesConfig();

  if (!stripeWebhookSecret) {
    throw new HttpError(503, 'STRIPE_WEBHOOK_SECRET is not configured.');
  }

  return stripeWebhookSecret;
}

export function setStripeClientForTests(client: Stripe | null) {
  stripeClient = client;
}
