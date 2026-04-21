import type { MemoryAsset, MemoryStatusResponse } from '@/lib/memories/contracts';

export type SuccessAssetPresentation = {
  badge: string;
  title: string;
  detail: string;
  ctaLabel: string;
  asset: MemoryAsset;
  variant: 'preview' | 'final';
  download: boolean;
};

export function getSuccessLeadCopy(
  paymentConfirmed: boolean,
  liveStatus: MemoryStatusResponse | null,
) {
  if (!paymentConfirmed) {
    return 'Das Briefing ist gespeichert. Wenn die Zahlung nicht abgeschlossen wurde, kannst du denselben Auftrag über die Statusseite wieder öffnen, ohne neu zu beginnen.';
  }

  if (!liveStatus) {
    return 'Diese Seite bestätigt die erfolgreiche Übergabe. Von hier an ist die Statusroute der zentrale Ort für Fortschritt und finale Zustellung.';
  }

  switch (liveStatus.status) {
    case 'unlocked':
      return 'Die Zahlung ist bestätigt. Dein Auftrag ist freigegeben und wechselt als Nächstes in die laufende Bearbeitung.';
    case 'queued':
    case 'processing':
    case 'preview_ready':
      return 'Die Zahlung ist bestätigt, und dein Auftrag befindet sich jetzt in Bearbeitung. Die Statusseite bleibt der Ort für Fortschritt, Vorschau und finale Bereitstellung.';
    case 'completed':
      return 'Die Zahlung ist bestätigt, und deine finale Story ist bereits verfügbar.';
    case 'delivered':
      return 'Die Zahlung ist bestätigt, deine finale Story ist verfügbar, und die Zustellung wurde bereits erfasst.';
    case 'failed':
      return 'Die Zahlung ist bestätigt, aber der Auftrag braucht Aufmerksamkeit. Nutze weiter diese Statusseite statt einen neuen Auftrag zu starten.';
    default:
      return 'Diese Seite bestätigt die erfolgreiche Übergabe. Von hier an ist die Statusroute der zentrale Ort für Fortschritt und finale Zustellung.';
  }
}

export function getSuccessAssetPresentation(
  liveStatus: MemoryStatusResponse | null,
): SuccessAssetPresentation | null {
  if (!liveStatus) {
    return null;
  }

  if (liveStatus.status === 'preview_ready' && liveStatus.previewAsset) {
    return {
      badge: 'In Bearbeitung',
      title: 'Eine Vorschau ist schon als Zwischenstand verfügbar.',
      detail:
        'Die Vorschau zeigt Fortschritt innerhalb der Bearbeitung. Die finale Story und ihre Zustellung laufen noch separat weiter.',
      ctaLabel: 'Vorschau öffnen',
      asset: liveStatus.previewAsset,
      variant: 'preview',
      download: false,
    };
  }

  if (liveStatus.status === 'completed' && liveStatus.finalAsset) {
    return {
      badge: 'Fertig',
      title: 'Deine finale Story ist jetzt verfügbar.',
      detail:
        'Das finale Asset kann hier schon abrufbar sein, auch wenn die Zustellbestätigung noch nicht separat erfasst wurde.',
      ctaLabel: 'Story herunterladen',
      asset: liveStatus.finalAsset,
      variant: 'final',
      download: true,
    };
  }

  if (liveStatus.status === 'delivered' && liveStatus.finalAsset) {
    return {
      badge: 'Fertig',
      title: 'Deine finale Story ist verfügbar und wurde zugestellt.',
      detail: liveStatus.delivery
        ? `Die Zustellung wurde an ${liveStatus.delivery.recipient} erfasst. Das finale Asset bleibt hier weiterhin direkt erreichbar.`
        : 'Die Zustellung wurde erfasst, und das finale Asset bleibt hier weiterhin direkt erreichbar.',
      ctaLabel: 'Story herunterladen',
      asset: liveStatus.finalAsset,
      variant: 'final',
      download: true,
    };
  }

  return null;
}

export function getSuccessNextStepCopy(
  paymentConfirmed: boolean,
  liveStatus: MemoryStatusResponse | null,
) {
  if (!paymentConfirmed) {
    return 'Der Checkout kann später über die Statusroute erneut geöffnet werden.';
  }

  if (!liveStatus) {
    return 'Produktion und finale Zustellung laufen außerhalb dieser Seite weiter.';
  }

  switch (liveStatus.status) {
    case 'unlocked':
      return 'Die Zahlung ist erledigt. Als Nächstes wechselt der Auftrag in die laufende Bearbeitung.';
    case 'queued':
    case 'processing':
    case 'preview_ready':
      return 'Die Bearbeitung läuft. Vorschau und finale Story erscheinen nur dann, wenn die jeweiligen Assets wirklich schon vorliegen.';
    case 'completed':
      return 'Die finale Story ist bereit. Die Zustellbestätigung kann noch separat nachlaufen, ohne den finalen Zugriff zu blockieren.';
    case 'delivered':
      return 'Die finale Story wurde zugestellt und bleibt zusätzlich über diese Seite erreichbar.';
    case 'failed':
      return 'Der Auftrag braucht Aufmerksamkeit. Bewahre diesen privaten Statuslink auf und starte keinen zweiten Auftrag.';
    default:
      return 'Produktion und finale Zustellung laufen außerhalb dieser Seite weiter.';
  }
}

export type StatusActionPresentation = {
  badge: string;
  title: string;
  detail: string;
  primaryLabel: string;
  primaryHref: string;
  primaryDownload: boolean;
  primaryKind: 'preview' | 'final-download';
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryDownload?: boolean;
};

export function getStatusAssetActionPresentation(
  result: MemoryStatusResponse,
): StatusActionPresentation | null {
  if (result.status === 'preview_ready' && result.previewAsset) {
    return {
      badge: 'In Bearbeitung',
      title: 'Eine Vorschau ist als Zwischenstand verfügbar.',
      detail:
        'Du kannst die Vorschau jetzt ansehen, während die finale Version noch vorbereitet wird.',
      primaryLabel: 'Vorschau öffnen',
      primaryHref: result.previewAsset.url,
      primaryDownload: false,
      primaryKind: 'preview',
    };
  }

  if (result.status === 'completed' && result.finalAsset) {
    return {
      badge: 'Fertig',
      title: 'Die finale Story ist jetzt verfügbar.',
      detail:
        'Direkter Zugriff und Zustellbestätigung werden getrennt erfasst. Deshalb kann die finale Story hier schon erreichbar sein, bevor ein Zustellereignis erscheint.',
      primaryLabel: 'Finale Story herunterladen',
      primaryHref: result.finalAsset.url,
      primaryDownload: true,
      primaryKind: 'final-download',
      secondaryLabel: 'Finale Story öffnen',
      secondaryHref: result.finalAsset.url,
      secondaryDownload: false,
    };
  }

  if (result.status === 'delivered' && result.finalAsset) {
    return {
      badge: 'Fertig',
      title: 'Die finale Story bleibt hier erreichbar.',
      detail: result.delivery
        ? `Die Zustellung wurde an ${result.delivery.recipient} erfasst. Du kannst die finale Story hier weiterhin direkt öffnen oder herunterladen.`
        : 'Die Zustellung wurde erfasst. Du kannst die finale Story hier weiterhin direkt öffnen oder herunterladen.',
      primaryLabel: 'Finale Story herunterladen',
      primaryHref: result.finalAsset.url,
      primaryDownload: true,
      primaryKind: 'final-download',
      secondaryLabel: 'Finale Story öffnen',
      secondaryHref: result.finalAsset.url,
      secondaryDownload: false,
    };
  }

  return null;
}

export function getStatusInfoNote(result: MemoryStatusResponse) {
  if (result.status === 'delivered' && result.delivery) {
    return `Zugestellt an ${result.delivery.recipient} am ${new Date(result.delivery.deliveredAt).toLocaleString('de-DE')}.`;
  }

  if (result.status === 'completed' && result.finalAsset) {
    return 'Das finale Asset ist über diese Seite verfügbar, auch wenn die Zustellbestätigung noch nicht erfasst wurde.';
  }

  if (result.status === 'delivered' && result.finalAsset) {
    return 'Das zugestellte finale Asset ist über diese Seite weiterhin verfügbar.';
  }

  if (result.status === 'preview_ready' && result.previewAsset) {
    return 'Eine Vorschau ist verfügbar, während die finale Version noch finalisiert wird.';
  }

  return null;
}
