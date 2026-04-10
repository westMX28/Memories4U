'use client';

import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { ImagePlus, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { storeRecentJob } from '@/lib/memories/recent-jobs';

type FormState = {
  customerName: string;
  email: string;
  storyPrompt: string;
  occasion: string;
};

const initialState: FormState = {
  customerName: '',
  email: '',
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

type RecoveryState = {
  jobId: string;
  accessToken: string;
  email: string;
};

const acceptedImageMimeTypes = ['image/png', 'image/jpeg'];
const acceptedImageExtensions = ['.png', '.jpg', '.jpeg'];

function hasAcceptedImageExtension(filename: string) {
  const normalized = filename.trim().toLowerCase();
  return acceptedImageExtensions.some((extension) => normalized.endsWith(extension));
}

function formatFileSize(size: number) {
  if (size < 1_000_000) {
    return `${Math.max(1, Math.round(size / 1000))} KB`;
  }

  return `${(size / 1_000_000).toFixed(1)} MB`;
}

function getUploadValidationMessage(image1: File | null, image2: File | null) {
  if (!image1) {
    return 'Bitte waehle mindestens ein Bild als PNG oder JPG aus.';
  }

  for (const [index, file] of [image1, image2].entries()) {
    if (!file) {
      continue;
    }

    if (!acceptedImageMimeTypes.includes(file.type) || !hasAcceptedImageExtension(file.name)) {
      return `Bild ${index + 1} muss als PNG oder JPG vorliegen.`;
    }
  }

  return null;
}

function getSingleFileValidationMessage(file: File, index: number) {
  if (!acceptedImageMimeTypes.includes(file.type) || !hasAcceptedImageExtension(file.name)) {
    return `Bild ${index} muss als PNG oder JPG vorliegen.`;
  }

  return null;
}

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

type MemoriesIntakeFormProps = {
  orderingAvailable: boolean;
};

export function MemoriesIntakeForm({ orderingAvailable }: MemoriesIntakeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(initialState);
  const [image1File, setImage1File] = useState<File | null>(null);
  const [image2File, setImage2File] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recoveryState, setRecoveryState] = useState<RecoveryState | null>(null);
  const image1InputRef = useRef<HTMLInputElement | null>(null);
  const image2InputRef = useRef<HTMLInputElement | null>(null);

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

  function getStatusHref(jobId: string, accessToken: string) {
    const params = new URLSearchParams({
      jobId,
      accessToken,
    });

    return `/status?${params.toString()}`;
  }

  function resetRecoveryState() {
    setError(null);
    setRecoveryState(null);
  }

  function clearFile(which: 'image1' | 'image2') {
    resetRecoveryState();
    if (which === 'image1') {
      setImage1File(null);
      if (image1InputRef.current) {
        image1InputRef.current.value = '';
      }
      return;
    }

    setImage2File(null);
    if (image2InputRef.current) {
      image2InputRef.current.value = '';
    }
  }

  function handleFileSelection(which: 'image1' | 'image2', file: File | null) {
    resetRecoveryState();

    if (!file) {
      clearFile(which);
      return;
    }

    const validationMessage = getSingleFileValidationMessage(file, which === 'image1' ? 1 : 2);
    if (validationMessage) {
      setError(validationMessage);
      if (which === 'image1') {
        setImage1File(null);
        if (image1InputRef.current) {
          image1InputRef.current.value = '';
        }
      } else {
        setImage2File(null);
        if (image2InputRef.current) {
          image2InputRef.current.value = '';
        }
      }
      return;
    }

    if (which === 'image1') {
      setImage1File(file);
      return;
    }

    setImage2File(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetRecoveryState();

    if (!orderingAvailable) {
      setError('Neue Bestellungen sind aktuell pausiert. Bitte versuche es spaeter erneut.');
      return;
    }

    const uploadValidationMessage = getUploadValidationMessage(image1File, image2File);
    if (uploadValidationMessage) {
      setError(uploadValidationMessage);
      return;
    }

    const payload = new FormData();
    payload.set('email', form.email);
    payload.set('storyPrompt', form.storyPrompt);

    if (form.customerName.trim()) {
      payload.set('customerName', form.customerName.trim());
    }

    if (form.occasion.trim()) {
      payload.set('occasion', form.occasion.trim());
    }

    if (image1File) {
      payload.set('image1', image1File);
    }

    if (image2File) {
      payload.set('image2', image2File);
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/memories/create', {
          method: 'POST',
          body: payload,
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

        setRecoveryState({
          jobId: data.jobId,
          accessToken: data.accessToken,
          email: form.email,
        });

        storeRecentJob({
          jobId: data.jobId,
          accessToken: data.accessToken,
          email: form.email,
          status: 'created',
          updatedAt: new Date().toISOString(),
        });

        try {
          await createCheckout(data.jobId, data.accessToken);
        } catch (checkoutError) {
          const checkoutMessage =
            checkoutError instanceof Error ? checkoutError.message : 'Checkout request failed.';
          throw new Error(
            `Der Auftrag wurde gespeichert, aber die Bezahlung konnte nicht gestartet werden. Wechsle jetzt zur Statusseite, um spaeter mit derselben Bestellung weiterzumachen. ${checkoutMessage}`,
          );
        }
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Request failed.');
      }
    });
  }

  return (
    <Card className="border-white/90 bg-white/82">
      <CardHeader className="space-y-4">
        <Badge className="w-fit">shadcn form shell</Badge>
        <div className="space-y-2">
          <CardTitle className="max-w-[16ch] text-[clamp(2rem,4vw,3rem)]">Tell us just enough to make the gift feel personal.</CardTitle>
          <CardDescription className="max-w-[52ch] text-base">
            The form stays small on purpose: cleaner hierarchy, better spacing, and no extra workflow decisions beyond the current checkout-first flow.
          </CardDescription>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-700">
            <ImagePlus className="mb-3 size-4 text-sky-700" />
            bring one or two image files
          </div>
          <div className="rounded-[24px] border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-700">
            <Mail className="mb-3 size-4 text-sky-700" />
            keep one delivery email
          </div>
          <div className="rounded-[24px] border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-700">
            <LockKeyhole className="mb-3 size-4 text-sky-700" />
            reopen the same order later
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form className="intake-form" onSubmit={handleSubmit}>
          <div>
            <div className="eyebrow">dein briefing</div>
            <h3>Erzaehl uns kurz, wie sich dieser Geburtstag anfuehlen soll.</h3>
            <p className="copy">
              {orderingAvailable
                ? 'Wir speichern deine Angaben sofort und leiten dich danach direkt in die Bezahlung. Fuer den Start brauchst du nur deine Bilder als PNG oder JPG, eine E-Mail und einen kurzen Erinnerungsmoment. Den Stand deiner Bestellung kannst du spaeter jederzeit wieder aufrufen.'
                : 'Neue Bestellungen sind in dieser Umgebung gerade pausiert. Bestehende Auftraege kannst du weiterhin ueber die Statusseite aufrufen.'}
            </p>
          </div>

          {!orderingAvailable ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-950">
              Die Bestellstrecke bleibt gesperrt, bis die Bezahlung wieder verfuegbar ist. Nutze in der Zwischenzeit die Statusseite fuer bestehende Auftraege.
            </div>
          ) : null}

          <div className="grid gap-6 rounded-[30px] border border-sky-100/90 bg-[linear-gradient(180deg,rgba(250,253,255,0.96),rgba(240,247,255,0.9))] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mini-kicker">customer details</div>
                <p className="mb-0 text-sm leading-7 text-slate-600">Enough information to secure the order and keep delivery traceable.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">
                <Sparkles className="size-3.5" />
                minimal friction
              </span>
            </div>

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
            </div>
          </div>

          <div className="grid gap-6 rounded-[30px] border border-sky-100/90 bg-white/82 p-5 sm:p-6">
            <div>
              <div className="mini-kicker">images</div>
              <p className="mb-0 text-sm leading-7 text-slate-600">PNG and JPG are supported. One image is required, a second image is optional.</p>
            </div>

            <div className="upload-grid">
              <label className="upload-field">
                <span className="upload-label">Erstes Bild</span>
                <Input
                  ref={image1InputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(event) => handleFileSelection('image1', event.target.files?.[0] || null)}
                />
                <p className="copy text-sm">Pflichtfeld. Akzeptiert PNG, JPG und JPEG.</p>
                {image1File ? (
                  <div className="upload-file-row">
                    <strong className="upload-file-name">
                      {image1File.name} · {formatFileSize(image1File.size)}
                    </strong>
                    <Button type="button" variant="ghost" size="sm" onClick={() => clearFile('image1')}>
                      Entfernen
                    </Button>
                  </div>
                ) : (
                  <p className="copy text-sm">Noch kein Bild ausgewaehlt.</p>
                )}
              </label>

              <label className="upload-field">
                <span className="upload-label">Zweites Bild (optional)</span>
                <Input
                  ref={image2InputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(event) => handleFileSelection('image2', event.target.files?.[0] || null)}
                />
                <p className="copy text-sm">Optional fuer eine zweite Perspektive oder den anderen Menschen.</p>
                {image2File ? (
                  <div className="upload-file-row">
                    <strong className="upload-file-name">
                      {image2File.name} · {formatFileSize(image2File.size)}
                    </strong>
                    <Button type="button" variant="ghost" size="sm" onClick={() => clearFile('image2')}>
                      Entfernen
                    </Button>
                  </div>
                ) : (
                  <p className="copy text-sm">Optional. Du kannst auch mit nur einem Bild bestellen.</p>
                )}
              </label>
            </div>
          </div>

          <div className="grid gap-6 rounded-[30px] border border-sky-100/90 bg-white/82 p-5 sm:p-6">
            <div>
              <div className="mini-kicker">story direction</div>
              <p className="mb-0 text-sm leading-7 text-slate-600">A small amount of emotional direction is more useful than a complex brief.</p>
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
          </div>

          <Separator className="bg-sky-100/90" />

          {error ? <p className="form-error">{error}</p> : null}

          {recoveryState ? (
            <div className="rounded-[24px] border border-sky-200 bg-sky-50/85 px-5 py-4 text-sm leading-7 text-slate-700">
              <strong className="block text-slate-900">Dein Auftrag ist bereits gespeichert.</strong>
              <span className="block">
                Falls der Checkout nicht geladen hat, kannst du dieselbe Bestellung ueber die Statusseite wieder oeffnen und die Bezahlung spaeter fortsetzen.
              </span>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="secondary">
                  <Link href={getStatusHref(recoveryState.jobId, recoveryState.accessToken)}>
                    Status mit diesem Auftrag oeffnen
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          <div className="btn-row">
            <Button type="submit" disabled={isPending || !orderingAvailable}>
              {!orderingAvailable
                ? 'Bestellung aktuell pausiert'
                : isPending
                  ? 'Weiter zum Checkout...'
                  : 'Weiter zur Bezahlung'}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/status">Bestehende Bestellung ansehen</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
