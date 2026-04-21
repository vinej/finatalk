import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  CRYPTOS,
  CRYPTO_CATEGORY_ORDER,
  type CryptoCategory,
  type CryptoDef,
} from "@/lib/crypto";

export const Route = createFileRoute("/_auth/dashboard_/crypto")({
  component: CryptoPage,
});

function CryptoPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<CryptoCategory | "all">("all");

  const visible = useMemo(
    () =>
      activeCategory === "all"
        ? CRYPTOS
        : CRYPTOS.filter((c) => c.category === activeCategory),
    [activeCategory],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("crypto.title")}</h1>
        <p className="text-sm text-[var(--color-muted-fg)]">{t("crypto.subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] pb-2">
        <CategoryTab
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
          label={t("crypto.category.all")}
        />
        {CRYPTO_CATEGORY_ORDER.map((cat) => (
          <CategoryTab
            key={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            label={t(`crypto.category.${cat}`)}
          />
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-accent)]/20 text-left text-xs uppercase tracking-wide text-[var(--color-muted-fg)]">
                <tr>
                  <th className="px-3 py-2">{t("crypto.colSymbol")}</th>
                  <th className="px-3 py-2">{t("crypto.colName")}</th>
                  <th className="px-3 py-2 hidden md:table-cell">{t("crypto.colCategory")}</th>
                  <th className="px-3 py-2 text-right">{t("crypto.colLast")}</th>
                  <th className="px-3 py-2 text-right">{t("crypto.colDayChange")}</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">{t("crypto.colMonthChange")}</th>
                  <th className="px-3 py-2 hidden lg:table-cell">{t("crypto.colTrend")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <CryptoRow key={c.symbol} def={c} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-md px-3 py-1.5 text-sm transition-colors " +
        (active
          ? "bg-[var(--color-accent)] font-semibold text-[var(--color-fg)]"
          : "text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]/40")
      }
    >
      {label}
    </button>
  );
}

function CryptoRow({ def }: { def: CryptoDef }) {
  const { t } = useTranslation();
  const query = trpc.market.candles.useQuery(
    { symbol: def.symbol, range: "1mo", interval: "1d" },
    { retry: false, staleTime: 5 * 60_000 },
  );

  const candles = query.data?.candles ?? [];
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const first = candles[0];

  const dayChangePct =
    last && prev && prev.close !== 0 ? ((last.close - prev.close) / prev.close) * 100 : null;
  const monthChangePct =
    last && first && first.close !== 0 ? ((last.close - first.close) / first.close) * 100 : null;

  return (
    <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-accent)]/40">
      <td className="px-3 py-2 font-mono font-semibold">
        <Link
          to="/dashboard/analysis"
          search={{ symbol: def.symbol }}
          className="text-[var(--color-primary)] hover:underline"
        >
          {def.symbol}
        </Link>
      </td>
      <td className="px-3 py-2">{t(def.nameKey)}</td>
      <td className="px-3 py-2 text-[var(--color-muted-fg)] hidden md:table-cell">
        {t(`crypto.category.${def.category}`)}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums">
        {query.isPending ? "…" : last ? formatPrice(last.close) : "—"}
      </td>
      <td
        className={`px-3 py-2 text-right font-mono tabular-nums ${changeTone(dayChangePct)}`}
      >
        {formatPercent(dayChangePct)}
      </td>
      <td
        className={`px-3 py-2 text-right font-mono tabular-nums hidden sm:table-cell ${changeTone(monthChangePct)}`}
      >
        {formatPercent(monthChangePct)}
      </td>
      <td className="px-3 py-2 hidden lg:table-cell">
        <Sparkline candles={candles} />
      </td>
    </tr>
  );
}

function changeTone(change: number | null): string {
  if (change == null) return "text-[var(--color-muted-fg)]";
  if (change > 0) return "text-emerald-600 dark:text-emerald-400";
  if (change < 0) return "text-red-600 dark:text-red-400";
  return "text-[var(--color-muted-fg)]";
}

function formatPercent(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatPrice(v: number): string {
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (v >= 1) return v.toFixed(2);
  if (v >= 0.01) return v.toFixed(4);
  return v.toPrecision(4);
}

function Sparkline({ candles }: { candles: { close: number }[] }) {
  if (candles.length < 2) return <span className="text-[var(--color-muted-fg)]">—</span>;
  const values = candles.map((c) => c.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 120;
  const h = 28;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const up = values[values.length - 1]! >= values[0]!;
  const color = up ? "#10b981" : "#ef4444";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
