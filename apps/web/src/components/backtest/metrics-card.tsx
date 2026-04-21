import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BacktestMetrics } from "@/lib/backtest-engine";

export function MetricsCard({ metrics: m }: { metrics: BacktestMetrics }) {
  const { t } = useTranslation();
  const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
  const fmtUSD = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("backtest.metrics")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label={t("backtest.totalReturn")} value={fmtPct(m.totalReturn)} highlight={m.totalReturn >= 0 ? "pos" : "neg"} />
          <Metric
            label={t("backtest.benchmarkReturn")}
            value={fmtPct(m.benchmarkTotalReturn)}
            highlight={m.benchmarkTotalReturn >= 0 ? "pos" : "neg"}
          />
          <Metric label={t("backtest.cagr")} value={fmtPct(m.cagr)} highlight={m.cagr >= 0 ? "pos" : "neg"} />
          <Metric label={t("backtest.maxDrawdown")} value={`-${m.maxDrawdown.toFixed(2)}%`} highlight="neg" />
          <Metric label={t("backtest.sharpe")} value={m.sharpe.toFixed(2)} />
          <Metric label={t("backtest.winRate")} value={`${m.winRate.toFixed(1)}%`} />
          <Metric label={t("backtest.avgR")} value={`${m.avgRMultiple >= 0 ? "+" : ""}${m.avgRMultiple.toFixed(2)}R`} />
          <Metric
            label={t("backtest.tradeCount")}
            value={`${m.tradeCount} (${m.winningTrades}/${m.losingTrades})`}
            sub={m.shortTrades > 0 ? t("backtest.longShortBreakdown", { long: m.longTrades, short: m.shortTrades }) : undefined}
          />
          <Metric label={t("backtest.finalEquity")} value={fmtUSD(m.finalEquity)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  highlight,
  sub,
}: {
  label: string;
  value: string;
  highlight?: "pos" | "neg";
  sub?: string;
}) {
  const color =
    highlight === "pos" ? "text-green-600" : highlight === "neg" ? "text-red-600" : "";
  return (
    <div className="rounded-md border border-[var(--color-border)] p-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
        {label}
      </div>
      <div className={`mt-0.5 text-lg font-semibold ${color}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-[var(--color-muted-fg)]">{sub}</div>}
    </div>
  );
}
