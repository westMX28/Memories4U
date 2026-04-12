import type { MemoryAsset } from '@/lib/memories/contracts';

type MemoryAssetPreviewProps = {
  asset: MemoryAsset;
  variant: 'final' | 'preview';
  className?: string;
};

export function MemoryAssetPreview({
  asset,
  variant,
  className = '',
}: MemoryAssetPreviewProps) {
  const ratio =
    asset.width && asset.height ? `${asset.width} / ${asset.height}` : '4 / 5';
  const meta = [asset.format?.toUpperCase(), asset.width && asset.height ? `${asset.width} x ${asset.height}` : null]
    .filter(Boolean)
    .join(' • ');

  return (
    <div
      className={`overflow-hidden rounded-[28px] border border-white/80 bg-white/72 shadow-[0_24px_60px_rgba(15,23,42,0.12)] ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/86 px-4 py-3">
        <div>
          <p className="mini-kicker mb-1">{variant === 'final' ? 'finales Asset' : 'Vorschau-Asset'}</p>
          <p className="mb-0 text-sm text-slate-600">
            {variant === 'final'
              ? 'Die fertige Story ist direkt über diese private Statusseite verfügbar.'
              : 'Die aktuelle Vorschau ist bereits verfügbar, während der Auftrag noch finalisiert wird.'}
          </p>
        </div>
        {meta ? (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
            {meta}
          </span>
        ) : null}
      </div>

      <div className="bg-[radial-gradient(circle_at_top,rgba(186,230,253,0.38),transparent_55%),linear-gradient(180deg,rgba(247,251,255,0.96),rgba(232,242,255,0.86))] p-4 sm:p-5">
        <div
          className="overflow-hidden rounded-[22px] border border-sky-100/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          style={{ aspectRatio: ratio }}
        >
          <img
            src={asset.url}
            alt={variant === 'final' ? 'Finales Geburtstags-Story-Asset' : 'Vorschau der Geburtstags-Story'}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
