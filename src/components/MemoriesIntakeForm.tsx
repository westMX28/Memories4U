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
    return 'Bitte wähle mindestens ein Bild als PNG oder JPG aus.';
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
      setError('Neue Bestellungen sind aktuell pausiert. Bitte versuche es später erneut.');
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
            `Der Auftrag wurde gespeichert, aber die Bezahlung konnte nicht gestartet werden. Wechsle jetzt zur Statusseite, um später mit derselben Bestellung weiterzumachen. ${checkoutMessage}`,
          );
        }
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'Request failed.');
      }
    });
  }

  return (
    <Card className="border-white/70 bg-white/80 shadow-lg">
      <CardHeader className="space-y-7 pb-6">
        <Badge className="w-fit accent-chip">Dein Briefing</Badge>
        <div className="space-y-3">
          <CardTitle className="max-w-[18ch] text-[clamp(2.2rem,5vw,3.2rem)] font-display">
            Erzähl uns das, das Geschenk braucht.
          </CardTitle>
          <CardDescription className="max-w-[55ch] text-base leading-relaxed">
            Keine langen Formulare. Keine komplexen Felder. Einfach Bilder, deine E-Mail, und eine kurze emotionale Richtung.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {!orderingAvailable ? (
            <div className="rounded-[28px] border border-amber-200 bg-amber-50/85 px-6 py-5 text-sm leading-7 text-amber-950">
              <strong className="block mb-1">Bestellungen sind derzeit pausiert.</strong>
              <p className="mb-0">Bestehende Aufträge kannst du über die Statusseite weiterhin verfolgen.</p>
            </div>
          ) : null}

          {/* Personal Details Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-display text-xl leading-tight text-slate-900">Deine Kontaktdaten</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Damit wir den Auftrag zuordnen und dir die private Statusseite schicken können.
              </p>
            </div>

            <div className="grid gap-5 sm:gap-4">
              <label className="field">
                <span className="block text-sm font-semibold text-slate-900 mb-2">Name für diesen Anlass</span>
                <Input
                  value={form.customerName}
                  onChange={(event) => updateField('customerName', event.target.value)}
                  placeholder="z. B. Tina für Leo"
                  className="text-base"
                />
                <p className="text-xs text-slate-500 mt-2">Optional, macht die Bestellung persönlicher.</p>
              </label>

              <label className="field">
                <span className="block text-sm font-semibold text-slate-900 mb-2">E-Mail für die Zustellung</span>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="du@example.com"
                  className="text-base"
                />
                <p className="text-xs text-slate-500 mt-2">Hier kommt dein privater Statuslink an.</p>
              </label>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* Image Upload Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-display text-xl leading-tight text-slate-900">Deine Bilder</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                PNG oder JPG. Ein Bild ist genug, zwei sind auch okay.
              </p>
            </div>

            <div className="space-y-5">
              <label className="upload-field rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50/80 to-white/80">
                <span className="upload-label text-sm font-semibold text-slate-900">Erstes Bild</span>
                <Input
                  ref={image1InputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(event) => handleFileSelection('image1', event.target.files?.[0] || null)}
                  className="mt-3 text-sm cursor-pointer"
                />
                {image1File ? (
                  <div className="upload-file-row mt-3 flex items-center justify-between gap-3">
                    <strong className="upload-file-name text-xs text-slate-700">
                      ✓ {image1File.name} ({formatFileSize(image1File.size)})
                    </strong>
                    <Button type="button" variant="ghost" size="sm" onClick={() => clearFile('image1')} className="text-xs">
                      Entfernen
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">Noch nicht ausgewählt</p>
                )}
              </label>

              <label className="upload-field rounded-[24px] border border-slate-200 bg-white/70">
                <span className="upload-label text-sm font-semibold text-slate-900">Zweites Bild (optional)</span>
                <Input
                  ref={image2InputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(event) => handleFileSelection('image2', event.target.files?.[0] || null)}
                  className="mt-3 text-sm cursor-pointer"
                />
                {image2File ? (
                  <div className="upload-file-row mt-3 flex items-center justify-between gap-3">
                    <strong className="upload-file-name text-xs text-slate-700">
                      ✓ {image2File.name} ({formatFileSize(image2File.size)})
                    </strong>
                    <Button type="button" variant="ghost" size="sm" onClick={() => clearFile('image2')} className="text-xs">
                      Entfernen
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">Optional. Eine andere Perspektive oder Person.</p>
                )}
              </label>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* Story Direction Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-display text-xl leading-tight text-slate-900">Das Gefühl für die Story</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Ein Satz oder zwei. Was soll diese Geschichte spürbar machen?
              </p>
            </div>

            <label className="field space-y-2">
              <span className="block text-sm font-semibold text-slate-900">Eine Erinnerung oder ein Gefühl</span>
              <Textarea
                required
                rows={4}
                value={form.storyPrompt}
                onChange={(event) => updateField('storyPrompt', event.target.value)}
                placeholder="Z. B.: Das Lachen wenn wir Witze reißen. Oder: Das Gefühl von Geborgenheit mit dieser Person."
                className="text-base rounded-[20px] border-slate-200 bg-white/90 placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-500">Das ist der emotionale Kern, aus dem alles wächst.</p>
            </label>

            <label className="field space-y-2">
              <span className="block text-sm font-semibold text-slate-900">Anlass (optional)</span>
              <Input
                value={form.occasion}
                onChange={(event) => updateField('occasion', event.target.value)}
                placeholder="z. B. Geburtstag, Hochzeitstag, Abschied"
                className="text-base"
              />
              <p className="text-xs text-slate-500 mt-2">Optional. Hilft beim Kontext.</p>
            </label>
          </div>

          {/* Messaging & Actions */}
          <Separator className="bg-slate-200 my-2" />

          {error ? (
            <div className="rounded-[24px] border border-red-200 bg-red-50/85 px-6 py-5 text-sm leading-6 text-red-900">
              <strong className="block mb-1">Ein Problem ist aufgetreten:</strong>
              <p className="mb-0">{error}</p>
            </div>
          ) : null}

          {recoveryState ? (
            <div className="rounded-[24px] border border-blue-200 bg-blue-50/80 px-6 py-5 text-sm leading-6">
              <strong className="block text-slate-900 mb-2">✓ Dein Auftrag ist gespeichert und sicher.</strong>
              <p className="text-slate-700 mb-4">
                Falls die Bezahlung unterbrochen wurde, kehre über deine private Statusseite zurück und zahle jederzeit.
                Der Auftrag wartet. Nichts ist verloren.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm" className="text-xs">
                  <Link href={getStatusHref(recoveryState.jobId, recoveryState.accessToken)}>
                    Zur Statusseite
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          {/* Submit Section */}
          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              disabled={isPending || !orderingAvailable}
              size="lg"
              className="w-full h-12 text-base font-semibold"
            >
              {!orderingAvailable
                ? 'Bestellungen sind gerade pausiert'
                : isPending
                  ? 'Dein Auftrag wird gespeichert...'
                  : 'Zum Bezahlen'}
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full h-12 text-base"
            >
              <Link href="/status">Bestehende Bestellung öffnen</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
