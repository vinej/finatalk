import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import type { ActiveIndicator } from "@/lib/indicator-defaults";
import type { RouterInputs } from "@finatalk/trpc";

type CreateInput = RouterInputs["analysis"]["createSavedChart"];

export type LoadedChart = {
  title: string;
  symbol: string;
  range: CreateInput["range"];
  interval: CreateInput["interval"];
  convertTo: "CAD" | null;
  indicators: ActiveIndicator[];
};

export function SavedChartsBrowser({ onLoad }: { onLoad: (chart: LoadedChart) => void }) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const list = trpc.analysis.listSavedCharts.useQuery();

  const remove = trpc.analysis.deleteSavedChart.useMutation({
    onSuccess: () => {
      utils.analysis.listSavedCharts.invalidate();
      toast.success(t("markets.chartDeleted"));
    },
    onError: (e) => toast.error(e.message),
  });

  const getChart = utils.analysis.getSavedChart;

  async function handleLoad(id: string) {
    try {
      const full = await getChart.fetch({ id });
      onLoad({
        title: full.title,
        symbol: full.symbol,
        range: full.range,
        interval: full.interval,
        convertTo: full.convertTo ?? null,
        indicators: full.indicators,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("markets.loadFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {list.isPending ? (
        <p className="text-sm text-[var(--color-muted-fg)]">{t("markets.loading")}</p>
      ) : list.data && list.data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {list.data.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-md border border-[var(--color-border)] p-2 text-sm"
            >
              <div className="flex-1">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-[var(--color-muted-fg)]">
                  {c.symbol} · {c.range} / {c.interval}
                  {c.convertTo ? ` · ${c.convertTo}` : ""}
                </div>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => handleLoad(c.id)}>
                {t("markets.load")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => remove.mutate({ id: c.id })}
                disabled={remove.isPending}
              >
                {t("markets.delete")}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--color-muted-fg)]">{t("markets.noSavedCharts")}</p>
      )}
    </div>
  );
}
