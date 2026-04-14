import { HttpError } from '@/lib/memories/errors';
import { getStripeWebhookSecret, getStripeClient } from '@/lib/memories/stripe';
import { finalizeStripeCheckout } from '@/lib/memories/service';
import { jsonError, jsonOk } from '@/lib/memories/http';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      throw new HttpError(400, 'stripe-signature header is required.');
    }

    const payload = await request.text();
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());

    if (event.type === 'checkout.session.completed') {
      await finalizeStripeCheckout(
        event.data.object as {
          id: string;
          payment_status?: string | null;
          payment_intent?: string | { id?: string | null } | null;
          client_reference_id?: string | null;
          metadata?: Record<string, string> | null;
        },
      );
    }

    return jsonOk({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
