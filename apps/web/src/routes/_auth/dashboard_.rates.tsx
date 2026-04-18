import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import type { RouterOutputs } from "@finatalk/trpc";

export const Route = createFileRoute("/_auth/dashboard_/rates")({
  component: RatesPage,
});

type YieldCurvePoint = RouterOutputs["rates"]["getYieldCurve"][number];
type TreasurySpreadPoint = RouterOutputs["rates"]["getTreasurySpread"][number];
type OecdPolicyRatePoint = RouterOutputs["rates"]["getOecdPolicyRate"][number];

type CentralBankRateKey = "effr" | "sofr" | "ecb" | "sonia" | "estr";
type Country = "us" | "ca";

const US_POLICY_RATES: CentralBankRateKey[] = ["effr", "sofr", "ecb", "sonia", "estr"];

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function RatesPage() {
  const { t } = useTranslation();
  const [country, setCountry] = useState<Country>("us");

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("rates.title")}</h1>
        <p className="text-sm text-[var(--color-muted-fg)]">{t("rates.subtitle")}</p>
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
        <CountryTab active={country === "us"} onClick={() => setCountry("us")} label={t("rates.tab.us")} />
        <CountryTab active={country === "ca"} onClick={() => setCountry("ca")} label={t("rates.tab.ca")} />
      </div>

      {country === "us" ? <UsPanel /> : <CaPanel />}
    </div>
  );
}

function CountryTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
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

function UsPanel() {
  const { t } = useTranslation();
  const [showOverlays, setShowOverlays] = useState(true);

  const todayQuery = trpc.rates.getYieldCurve.useQuery(
    { country: "us" },
    { retry: false, staleTime: 60 * 60_000 },
  );
  const monthAgoQuery = trpc.rates.getYieldCurve.useQuery(
    { country: "us", date: daysAgoIso(30) },
    { retry: false, staleTime: 60 * 60_000, enabled: showOverlays },
  );
  const sixMonthsAgoQuery = trpc.rates.getYieldCurve.useQuery(
    { country: "us", date: daysAgoIso(180) },
    { retry: false, staleTime: 60 * 60_000, enabled: showOverlays },
  );
  const yearAgoQuery = trpc.rates.getYieldCurve.useQuery(
    { country: "us", date: daysAgoIso(365) },
    { retry: false, staleTime: 60 * 60_000, enabled: showOverlays },
  );

  const spread3mQuery = trpc.rates.getTreasurySpread.useQuery(
    { maturity: "3m", startDate: daysAgoIso(365 * 3) },
    { retry: false, staleTime: 60 * 60_000 },
  );
  const spread2yQuery = trpc.rates.getTreasurySpread.useQuery(
    { maturity: "2y", startDate: daysAgoIso(365 * 3) },
    { retry: false, staleTime: 60 * 60_000 },
  );

  return (
    <div className="space-y-4">
      <YieldCurveCard
        titleKey="rates.yieldCurve.titleUs"
        today={todayQuery.data ?? []}
        monthAgo={showOverlays ? (monthAgoQuery.data ?? []) : []}
        sixMonthsAgo={showOverlays ? (sixMonthsAgoQuery.data ?? []) : []}
        yearAgo={showOverlays ? (yearAgoQuery.data ?? []) : []}
        loading={todayQuery.isPending}
        error={todayQuery.error?.message ?? null}
        showOverlays={showOverlays}
        onToggleOverlays={setShowOverlays}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SpreadCard
          title={t("rates.spreads.spread10y3m")}
          description={t("rates.spreads.desc10y3m")}
          data={spread3mQuery.data ?? []}
          loading={spread3mQuery.isPending}
          error={spread3mQuery.error?.message ?? null}
        />
        <SpreadCard
          title={t("rates.spreads.spread10y2y")}
          description={t("rates.spreads.desc10y2y")}
          data={spread2yQuery.data ?? []}
          loading={spread2yQuery.isPending}
          error={spread2yQuery.error?.message ?? null}
        />
      </div>

      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">{t("rates.policy.title")}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {US_POLICY_RATES.map((rate) => (
              <CentralBankRateCard key={rate} rate={rate} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CaPanel() {
  const { t } = useTranslation();
  const [showOverlays, setShowOverlays] = useState(true);

  const todayQuery = trpc.rates.getYieldCurve.useQuery(
    { country: "ca" },
    { retry: false, staleTime: 60 * 60_000 },
  );
  const monthAgoQuery = trpc.rates.getYieldCurve.useQuery(
    { country: "ca", date: daysAgoIso(30) },
    { retry: false, staleTime: 60 * 60_000, enabled: showOverlays },
  );
  const sixMonthsAgoQuery = trpc.rates.getYieldCurve.useQuery(
    { country: "ca", date: daysAgoIso(180) },
    { retry: false, staleTime: 60 * 60_000, enabled: showOverlays },
  );
  const yearAgoQuery = trpc.rates.getYieldCurve.useQuery(
    { country: "ca", date: daysAgoIso(365) },
    { retry: false, staleTime: 60 * 60_000, enabled: showOverlays },
  );

  const bocQuery = trpc.rates.getOecdPolicyRate.useQuery(
    { country: "ca", duration: "immediate", startDate: daysAgoIso(365 * 3) },
    { retry: false, staleTime: 60 * 60_000 },
  );
  const ca10yQuery = trpc.rates.getOecdPolicyRate.useQuery(
    { country: "ca", duration: "long", startDate: daysAgoIso(365 * 3) },
    { retry: false, staleTime: 60 * 60_000 },
  );

  const curveData = todayQuery.data ?? [];
  const ca10Y = curveData.find((p) => p.maturityYears === 10);
  const ca2Y = curveData.find((p) => p.maturityYears === 2);
  const caSpread = ca10Y && ca2Y ? ca10Y.rate - ca2Y.rate : null;

  return (
    <div className="space-y-4">
      <YieldCurveCard
        titleKey="rates.yieldCurve.titleCa"
        today={todayQuery.data ?? []}
        monthAgo={showOverlays ? (monthAgoQuery.data ?? []) : []}
        sixMonthsAgo={showOverlays ? (sixMonthsAgoQuery.data ?? []) : []}
        yearAgo={showOverlays ? (yearAgoQuery.data ?? []) : []}
        loading={todayQuery.isPending}
        error={todayQuery.error?.message ?? null}
        showOverlays={showOverlays}
        onToggleOverlays={setShowOverlays}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <OecdPolicyCard
          title={t("rates.ca.bocLabel")}
          description={t("rates.ca.bocDesc")}
          region={t("rates.ca.region")}
          data={bocQuery.data ?? []}
          loading={bocQuery.isPending}
          error={bocQuery.error?.message ?? null}
        />
        <OecdPolicyCard
          title={t("rates.ca.goc10yLabel")}
          description={t("rates.ca.goc10yDesc")}
          region={t("rates.ca.region")}
          data={ca10yQuery.data ?? []}
          loading={ca10yQuery.isPending}
          error={ca10yQuery.error?.message ?? null}
        />
      </div>

      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">{t("rates.ca.curveHighlights")}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          {todayQuery.isPending ? (
            <div className="text-sm text-[var(--color-muted-fg)]">…</div>
          ) : curveData.length === 0 ? (
            <div className="text-sm text-[var(--color-muted-fg)]">{t("rates.yieldCurve.noData")}</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <HighlightTile label={t("rates.ca.tile2y")} value={ca2Y?.rate ?? null} />
              <HighlightTile label={t("rates.ca.tile10y")} value={ca10Y?.rate ?? null} />
              <HighlightTile
                label={t("rates.ca.tile10y2ySpread")}
                value={caSpread}
                tone={caSpread == null ? "neutral" : caSpread < 0 ? "bad" : "good"}
                unit="pp"
              />
              <HighlightTile
                label={t("rates.ca.tileAsOf")}
                valueText={curveData[0]?.date ?? "—"}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HighlightTile({
  label,
  value,
  valueText,
  tone,
  unit,
}: {
  label: string;
  value?: number | null;
  valueText?: string;
  tone?: "good" | "bad" | "neutral";
  unit?: string;
}) {
  const toneClass =
    tone === "bad"
      ? "text-red-600 dark:text-red-400"
      : tone === "good"
        ? "text-emerald-600 dark:text-emerald-400"
        : "";
  const display =
    valueText != null
      ? valueText
      : value != null && Number.isFinite(value)
        ? `${value >= 0 && tone ? "+" : ""}${value.toFixed(2)}${unit ? ` ${unit}` : "%"}`
        : "—";
  return (
    <div className="rounded-md border border-[var(--color-border)] p-3">
      <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted-fg)]">{label}</div>
      <div className={`font-mono text-xl tabular-nums ${toneClass}`}>{display}</div>
    </div>
  );
}

function YieldCurveCard({
  titleKey,
  today,
  monthAgo,
  sixMonthsAgo,
  yearAgo,
  loading,
  error,
  showOverlays,
  onToggleOverlays,
}: {
  titleKey: string;
  today: YieldCurvePoint[];
  monthAgo: YieldCurvePoint[];
  sixMonthsAgo: YieldCurvePoint[];
  yearAgo: YieldCurvePoint[];
  loading: boolean;
  error: string | null;
  showOverlays: boolean;
  onToggleOverlays: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t(titleKey)}</CardTitle>
          <label className="flex items-center gap-1.5 text-xs text-[var(--color-muted-fg)]">
            <input
              type="checkbox"
              checked={showOverlays}
              onChange={(e) => onToggleOverlays(e.target.checked)}
            />
            {t("rates.yieldCurve.showHistorical")}
          </label>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        {error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : (
          <YieldCurveChart
            today={today}
            monthAgo={monthAgo}
            sixMonthsAgo={sixMonthsAgo}
            yearAgo={yearAgo}
            loading={loading}
            empty={!loading && today.length === 0}
          />
        )}
      </CardContent>
    </Card>
  );
}

function YieldCurveChart({
  today,
  monthAgo,
  sixMonthsAgo,
  yearAgo,
  loading,
  empty,
}: {
  today: YieldCurvePoint[];
  monthAgo: YieldCurvePoint[];
  sixMonthsAgo: YieldCurvePoint[];
  yearAgo: YieldCurvePoint[];
  loading: boolean;
  empty: boolean;
}) {
  const { t } = useTranslation();

  const series = useMemo(() => {
    const list = [
      { label: t("rates.yieldCurve.today"), points: today, color: "#2563eb", width: 2 },
      { label: t("rates.yieldCurve.oneMonthAgo"), points: monthAgo, color: "#60a5fa", width: 1 },
      { label: t("rates.yieldCurve.sixMonthsAgo"), points: sixMonthsAgo, color: "#a78bfa", width: 1 },
      { label: t("rates.yieldCurve.oneYearAgo"), points: yearAgo, color: "#9ca3af", width: 1 },
    ];
    return list.filter((s) => s.points.length > 0);
  }, [today, monthAgo, sixMonthsAgo, yearAgo, t]);

  const allPoints = series.flatMap((s) => s.points);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-sm text-[var(--color-muted-fg)]">…</div>;
  }
  if (empty || allPoints.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--color-muted-fg)]">
        {t("rates.yieldCurve.noData")}
      </div>
    );
  }

  const maturities = Array.from(new Set(allPoints.map((p) => p.maturityYears))).sort((a, b) => a - b);

  const minRate = Math.min(...allPoints.map((p) => p.rate));
  const maxRate = Math.max(...allPoints.map((p) => p.rate));
  const pad = (maxRate - minRate) * 0.1 || 0.5;
  const yMin = Math.max(0, minRate - pad);
  const yMax = maxRate + pad;

  const width = 720;
  const height = 280;
  const padL = 44;
  const padR = 16;
  const padT = 12;
  const padB = 32;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const xOf = (years: number) => {
    const idx = maturities.indexOf(years);
    return padL + (idx / Math.max(1, maturities.length - 1)) * plotW;
  };
  const yOf = (rate: number) => padT + (1 - (rate - yMin) / (yMax - yMin)) * plotH;

  const yTicks: number[] = [];
  const tickCount = 4;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(yMin + ((yMax - yMin) * i) / tickCount);
  }

  const todayByYears = new Map(today.map((p) => [p.maturityYears, p.rate]));
  const y10 = todayByYears.get(10);
  const y2 = todayByYears.get(2);
  const y3mMat = todayByYears.get(0.25) ?? todayByYears.get(0.0833);
  const inverted10y2y = y10 != null && y2 != null && y10 < y2;
  const inverted10y3m = y10 != null && y3mMat != null && y10 < y3mMat;

  return (
    <div className="space-y-2">
      {(inverted10y2y || inverted10y3m) && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          {t("rates.yieldCurve.inversionWarning")}
        </div>
      )}
      <div className="overflow-x-auto">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-xs">
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padL}
                x2={width - padR}
                y1={yOf(tick)}
                y2={yOf(tick)}
                stroke="currentColor"
                strokeOpacity={0.1}
              />
              <text
                x={padL - 6}
                y={yOf(tick) + 4}
                textAnchor="end"
                fill="currentColor"
                fillOpacity={0.6}
              >
                {tick.toFixed(2)}
              </text>
            </g>
          ))}
          {maturities.map((m) => {
            const pt = today.find((p) => p.maturityYears === m);
            const label = pt?.maturity ?? formatMaturityLabel(m);
            return (
              <text
                key={m}
                x={xOf(m)}
                y={height - padB + 16}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity={0.6}
              >
                {label}
              </text>
            );
          })}
          {series.map((s) => {
            const sorted = [...s.points].sort((a, b) => a.maturityYears - b.maturityYears);
            const pts = sorted
              .filter((p) => maturities.includes(p.maturityYears))
              .map((p) => `${xOf(p.maturityYears).toFixed(1)},${yOf(p.rate).toFixed(1)}`)
              .join(" ");
            return (
              <polyline
                key={s.label}
                fill="none"
                stroke={s.color}
                strokeWidth={s.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pts}
              />
            );
          })}
          {today.map((p) => (
            <circle
              key={`t-${p.maturityYears}`}
              cx={xOf(p.maturityYears)}
              cy={yOf(p.rate)}
              r={3}
              fill="#2563eb"
            />
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: s.color, height: s.width * 2 }}
            />
            <span className="text-[var(--color-muted-fg)]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMaturityLabel(years: number): string {
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months}M`;
  }
  return `${years}Y`;
}

function SpreadCard({
  title,
  description,
  data,
  loading,
  error,
}: {
  title: string;
  description: string;
  data: TreasurySpreadPoint[];
  loading: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  const last = data[data.length - 1];
  const latest = last?.rate ?? null;
  const inverted = latest != null && latest < 0;

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-[var(--color-muted-fg)]">{description}</p>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        {error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : loading ? (
          <div className="text-sm text-[var(--color-muted-fg)]">…</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-[var(--color-muted-fg)]">{t("rates.spreads.noData")}</div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl tabular-nums ${
                  inverted ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {latest != null ? `${latest >= 0 ? "+" : ""}${latest.toFixed(2)}` : "—"}
              </span>
              <span className="text-xs text-[var(--color-muted-fg)]">
                {t("rates.spreads.percentagePoints")}
              </span>
            </div>
            {inverted && (
              <div className="text-xs text-red-600 dark:text-red-400">
                {t("rates.spreads.invertedSignal")}
              </div>
            )}
            <SpreadSparkline data={data} />
            {last?.date && (
              <div className="text-xs text-[var(--color-muted-fg)]">
                {t("rates.spreads.asOf")} {last.date}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SpreadSparkline({ data }: { data: TreasurySpreadPoint[] }) {
  if (data.length < 2) return null;
  const values = data.map((d) => d.rate);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const w = 360;
  const h = 64;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const zeroY = h - ((0 - min) / range) * h;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <line x1={0} x2={w} y1={zeroY} y2={zeroY} stroke="currentColor" strokeOpacity={0.25} strokeDasharray="2 3" />
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function CentralBankRateCard({ rate }: { rate: CentralBankRateKey }) {
  const { t } = useTranslation();
  const query = trpc.rates.getCentralBankRate.useQuery(
    { rate, startDate: daysAgoIso(365 * 2) },
    { retry: false, staleTime: 60 * 60_000 },
  );
  const data = query.data ?? [];
  const last = data[data.length - 1];
  const prev = data.length > 30 ? data[data.length - 31] : undefined;
  const change = last && prev ? last.rate - prev.rate : null;

  return (
    <div className="rounded-md border border-[var(--color-border)] p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold">{t(`rates.policy.${rate}.label`)}</span>
        <span className="text-[10px] uppercase text-[var(--color-muted-fg)]">
          {t(`rates.policy.${rate}.region`)}
        </span>
      </div>
      <p className="mb-2 text-[11px] text-[var(--color-muted-fg)]">
        {t(`rates.policy.${rate}.desc`)}
      </p>
      {query.error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] text-red-700 dark:text-red-300">
          {query.error.message}
        </div>
      ) : query.isPending ? (
        <div className="text-sm text-[var(--color-muted-fg)]">…</div>
      ) : !last ? (
        <div className="text-sm text-[var(--color-muted-fg)]">{t("rates.policy.noData")}</div>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl tabular-nums">{last.rate.toFixed(2)}%</span>
            {change != null && change !== 0 && (
              <span
                className={`text-xs tabular-nums ${
                  change > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {change > 0 ? "+" : ""}
                {(change * 100).toFixed(0)} bps {t("rates.policy.vs1MonthAgo")}
              </span>
            )}
          </div>
          {last.upper != null && last.lower != null && (
            <div className="mt-1 text-xs text-[var(--color-muted-fg)]">
              {t("rates.policy.targetRange")} {last.lower.toFixed(2)}–{last.upper.toFixed(2)}%
            </div>
          )}
          {last.date && (
            <div className="mt-1 text-[10px] text-[var(--color-muted-fg)]">
              {t("rates.policy.asOf")} {last.date}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OecdPolicyCard({
  title,
  description,
  region,
  data,
  loading,
  error,
}: {
  title: string;
  description: string;
  region: string;
  data: OecdPolicyRatePoint[];
  loading: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  const last = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : undefined;
  const change = last && prev ? last.rate - prev.rate : null;

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <span className="text-[10px] uppercase text-[var(--color-muted-fg)]">{region}</span>
        </div>
        <p className="text-xs text-[var(--color-muted-fg)]">{description}</p>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        {error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : loading ? (
          <div className="text-sm text-[var(--color-muted-fg)]">…</div>
        ) : !last ? (
          <div className="text-sm text-[var(--color-muted-fg)]">{t("rates.policy.noData")}</div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl tabular-nums">{last.rate.toFixed(2)}%</span>
              {change != null && change !== 0 && (
                <span
                  className={`text-xs tabular-nums ${
                    change > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {(change * 100).toFixed(0)} bps {t("rates.policy.vsPrev")}
                </span>
              )}
            </div>
            <OecdSparkline data={data} />
            {last.date && (
              <div className="text-xs text-[var(--color-muted-fg)]">
                {t("rates.policy.asOf")} {last.date}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OecdSparkline({ data }: { data: OecdPolicyRatePoint[] }) {
  if (data.length < 2) return null;
  const values = data.map((d) => d.rate);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 360;
  const h = 48;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
