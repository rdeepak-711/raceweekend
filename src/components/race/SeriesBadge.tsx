import { SERIES_META, type RaceSeries } from '@/lib/constants/series';

export default function SeriesBadge({ series, size = 'sm' }: { series: RaceSeries; size?: 'sm' | 'md' }) {
  const meta = SERIES_META[series];
  const cls = size === 'md'
    ? 'text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider'
    : 'text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider';

  return (
    <span
      className={cls}
      style={{ color: meta.color, backgroundColor: `${meta.color}20`, border: `1px solid ${meta.color}40` }}
    >
      {meta.emoji} {meta.label}
    </span>
  );
}
