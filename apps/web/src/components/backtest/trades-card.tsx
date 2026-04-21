import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Trade } from "@/lib/backtest-engine";
import { formatDateIso } from "@/lib/format";

export function TradesCard({ trades }: { trades: Trade[] }) {
  const { t } = useTranslation();
  if (trades.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-[var(--color-muted-fg)]">
          {t("backtest.noTrades")}
        </CardContent>
      </Card>
    );
  }
  const fmtNum = (n: number) => n.toFixed(2);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("backtest.trades")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-muted-fg)]">
                <th className="px-2 py-1.5 text-left">#</th>
                <th className="px-2 py-1.5 text-left">{t("backtest.side")}</th>
                <th className="px-2 py-1.5 text-left">{t("backtest.entryDate")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.entryPrice")}</th>
                <th className="px-2 py-1.5 text-left">{t("backtest.exitDate")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.exitPrice")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.qty")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.bars")}</th>
                <th className="px-2 py-1.5 text-left">{t("backtest.exitReason")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.pnl")}</th>
                <th className="px-2 py-1.5 text-right">R</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((tr, i) => {
                const tipLines = [
                  `${t("backtest.side")}: ${t(`backtest.sideLabel.${tr.side}`)}`,
                  `${t("backtest.entryPrice")}: ${fmtNum(tr.entryPrice)}`,
                  `${t("backtest.stopLevel")}: ${fmtNum(tr.stop)}`,
                  `${t("backtest.tpLevel")}: ${fmtNum(tr.takeProfit)}`,
                  `${t("backtest.exitPrice")}: ${fmtNum(tr.exitPrice)}`,
                  `${t("backtest.bars")}: ${tr.bars}`,
                  `${t("backtest.exitReason")}: ${t(`backtest.reason.${tr.reason}`)}`,
                  `R: ${tr.rMultiple >= 0 ? "+" : ""}${tr.rMultiple.toFixed(2)}`,
                ].join("\n");
                return (
                <tr key={i} className="border-b border-[var(--color-border)]/50 last:border-0" title={tipLines}>
                  <td className="px-2 py-1.5 text-[var(--color-muted-fg)]">{i + 1}</td>
                  <td className={`px-2 py-1.5 text-xs font-medium ${tr.side === "long" ? "text-green-600" : "text-red-600"}`}>
                    {t(`backtest.sideLabel.${tr.side}`)}
                  </td>
                  <td className="px-2 py-1.5">{formatDateIso(tr.entryTime)}</td>
                  <td className="px-2 py-1.5 text-right">{fmtNum(tr.entryPrice)}</td>
                  <td className="px-2 py-1.5">{formatDateIso(tr.exitTime)}</td>
                  <td className="px-2 py-1.5 text-right">{fmtNum(tr.exitPrice)}</td>
                  <td className="px-2 py-1.5 text-right">{tr.qty}</td>
                  <td className="px-2 py-1.5 text-right">{tr.bars}</td>
                  <td className="px-2 py-1.5 text-xs" title={tipLines}>
                    {t(`backtest.reason.${tr.reason}`)}
                  </td>
                  <td className={`px-2 py-1.5 text-right font-medium ${tr.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {tr.pnl >= 0 ? "+" : ""}{fmtNum(tr.pnl)} ({tr.pnlPct >= 0 ? "+" : ""}{tr.pnlPct.toFixed(2)}%)
                  </td>
                  <td className={`px-2 py-1.5 text-right ${tr.rMultiple >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {tr.rMultiple >= 0 ? "+" : ""}{tr.rMultiple.toFixed(2)}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
