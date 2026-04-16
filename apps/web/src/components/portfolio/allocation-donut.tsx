const PALETTE = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
] as const;

export function colorFor(symbol: string, index: number): string {
  const base = PALETTE[index % PALETTE.length]!;
  if (index < PALETTE.length) return base;
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 65% 55%)`;
}

export type DonutSegment = { label: string; value: number; color: string };

export function AllocationDonut({
  segments,
  size = 180,
  thickness = 24,
  formatValue,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  formatValue?: (value: number, share: number) => string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const share = total > 0 ? seg.value / total : 0;
    const dash = share * C;
    const node = (
      <circle
        key={seg.label}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={seg.color}
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    offset += dash;
    return { node, share };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {total > 0 ? (
        <svg width={size} height={size} role="img" aria-label="Allocation">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={thickness}
          />
          {arcs.map((a) => a.node)}
        </svg>
      ) : (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded-full border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted-fg)]"
        >
          —
        </div>
      )}
      <ul className="w-full flex flex-col gap-1 text-xs">
        {segments.map((seg, i) => {
          const share = total > 0 ? seg.value / total : 0;
          return (
            <li key={seg.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 truncate">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: seg.color }}
                  aria-hidden
                />
                <span className="truncate">{seg.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-[var(--color-muted-fg)]">
                {formatValue
                  ? formatValue(seg.value, share)
                  : `${(share * 100).toFixed(1)}%`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
