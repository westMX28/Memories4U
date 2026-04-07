'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { storeRecentJob } from '@/lib/memories/recent-jobs';

type FormState = {
  customerName: string;
  email: string;
  imageUrl1: string;
  imageUrl2: string;
  storyPrompt: string;
  occasion: string;
};

const initialState: FormState = {
  customerName: '',
  email: '',
  imageUrl1: '',
  imageUrl2: '',
  storyPrompt: '',
  occasion: 'birthday',
};

type CreateMemoryResponse = {
  jobId: string;
  accessToken: string;
  status: string;
  statusUrl: string;
};

type CheckoutSessionResponse = {
  checkoutUrl: string;
  sessionId: string;
};

function isCreateMemoryResponse(value: unknown): value is CreateMemoryResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.jobId === 'string' &&
    typeof candidate.accessToken === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.statusUrl === 'string'
  );
}

export function MemoriesIntakeForm() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createCheckout(jobId: string, accessToken: string) {
    const response = await fetch(`/api/memories/${encodeURIComponent(jobId)}/checkout`, {
      method: 'POST',
      headers: {
        'x-memories-access-token': accessToken,
      },
    });

    const data = (await response.json()) as unknown;
    if (!response.ok) {
      const message =
        data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
          ? data.error
          : 'Checkout request failed.';
      throw new Error(message);
    }

    if (
      !data ||
      typeof data !== 'object' ||
      typeof (data as CheckoutSessionResponse).checkoutUrl !== 'string'
    ) {
      throw new Error('Checkout response was missing redirect data.');
    }

    window.location.assign((data as CheckoutSessionResponse).checkoutUrl);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      email: form.email,
      customerName: form.customerName || undefined,
      storyPrompt: form.storyPrompt,
      sourceImages: [form.imageUrl1, form.imageUrl2]
        .filter((value) => value.trim().length > 0)
        .map((url, index) => ({
          url,
          label: index === 0 ? 'customer' : 'recipient',
        })),
      metadata: {
        occasion: form.occasion,
      },
    };

    startTransition(async () => {
      try {
        const response = await fetch('/api/memories/create', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as unknown;
        if (!response.ok) {
          const message =
            data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
              ? data.error
              : 'Request failed.';
          throw new Error(message);
        }

        if (!isCreateMemoryResponse(data)) {
          throw new Error('API response was missing job tracking data.');
        }

        storeRecentJob({
          jobId: data.jobId,
          accessToken: data.accessToken,
          email: form.email,
          status: 'created',
          updatedAt: new Date().toISOString(),
        });

        await createCheckout(data.jobId, data.accessToken);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Request failed.');
      }
    });
  }

  return (
    <Card className="border-white/90 bg-white/82">
      <CardContent className="p-6 sm:p-8">
        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="eyebrow">dein briefing</div>
          <h3>Erzaehl uns kurz, wie sich dieser Geburtstag anfuehlen soll.</h3>
          <p className="copy">
            Wir speichern deine Angaben sofort und leiten dich danach direkt in die Bezahlung. Den Stand deiner Bestellung kannst du spaeter jederzeit wieder aufrufen.
          </p>

          <div className="form-grid">
            <label className="field">
              <span>Name fuer diesen Anlass</span>
              <Input
                value={form.customerName}
                onChange={(event) => updateField('customerName', event.target.value)}
                placeholder="z. B. Nina fuer Leo"
              />
            </label>

            <label className="field">
              <span>E-Mail fuer die Zustellung</span>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="du@example.com"
              />
            </label>

            <label className="field">
              <span>Erster Bild-Link</span>
              <Input
                type="url"
                required
                value={form.imageUrl1}
                onChange={(event) => updateField('imageUrl1', event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="field">
              <span>Zweiter Bild-Link</span>
              <Input
                type="url"
                value={form.imageUrl2}
                onChange={(event) => updateField('imageUrl2', event.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          <label className="field">
            <span>Gemeinsamer Moment</span>
            <Textarea
              required
              rows={5}
              value={form.storyPrompt}
              onChange={(event) => updateField('storyPrompt', event.target.value)}
              placeholder="Was sollen wir spuerbar machen?"
            />
          </label>

          <label className="field">
            <span>Wofuer ist die Story gedacht?</span>
            <Input
              value={form.occasion}
              onChange={(event) => updateField('occasion', event.target.value)}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="btn-row">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Weiter zum Checkout...' : 'Weiter zur Bezahlung'}
            </Button>
            <Button asChild variant="secondary">
              <a href="/status">Bestehende Bestellung ansehen</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
