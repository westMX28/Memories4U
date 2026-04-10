import Stripe from 'stripe';

import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';

let stripeClient: Stripe | null = null;

export function getStripeConfigurationStatus() {
  const { stripeSecretKey, stripePriceId } = getMemoriesConfig();

  if (!stripeSecretKey) {
    return {
      available: false as const,
      reason: 'STRIPE_SECRET_KEY or STRIPE_API_KEY is not configured.',
    };
  }

  if (!stripePriceId) {
    return {
      available: false as const,
      reason: 'STRIPE_PRICE_ID is not configured.',
    };
  }

  return {
    available: true as const,
  };
}

export function assertStripeConfigured() {
  const status = getStripeConfigurationStatus();

  if (!status.available) {
    throw new HttpError(
      503,
      'Payment checkout is unavailable in this environment.',
      'PAYMENT_UNAVAILABLE',
    );
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
