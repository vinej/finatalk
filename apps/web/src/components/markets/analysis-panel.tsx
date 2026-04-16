import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import type { ActiveIndicator } from "@/lib/indicator-defaults";

export function AnalysisBrowser({
  symbol,
  indicators,
  loadedAnalysisId,
  loadedAnalysisTitle,
  onLoad,
  onLoadedChange,
}: {
  symbol: string;
  indicators: ActiveIndicator[];
  loadedAnalysisId: string | null;
  loadedAnalysisTitle: string | null;
  onLoad: (items: ActiveIndicator[], id: string, title: string, description: string) => void;
  onLoadedChange: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const list = trpc.analysis.listAnalyses.useQuery({ symbol });

  const update = trpc.analysis.updateAnalysis.useMutation({
    onSuccess: () => {
      utils.analysis.listAnalyses.invalidate();
      toast.success(t("markets.analysisUpdated"));
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.analysis.deleteAnalysis.useMutation({
    onSuccess: (data) => {
      utils.analysis.listAnalyses.invalidate();
      if (data.id === loadedAnalysisId) onLoadedChange(null);
      toast.success(t("markets.analysisDeleted"));
    },
    onError: (e) => toast.error(e.message),
  });

  const getAnalysis = utils.analysis.getAnalysis;

  async function handleLoad(id: string, fallbackTitle: string) {
    try {
      const full = await getAnalysis.fetch({ id });
      onLoad(full.indicators, full.id, full.title || fallbackTitle, full.description ?? "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("markets.loadFailed"));
    }
  }

  function handleUpdate() {
    if (!loadedAnalysisId) return;
    update.mutate({ id: loadedAnalysisId, indicators });
  }

  return (
    <div className="flex flex-col gap-3">
      {loadedAnalysisId && loadedAnalysisTitle && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleUpdate}
            disabled={update.isPending}
          >
            {t("markets.updateNamed", { name: loadedAnalysisTitle })}
          </Button>
        </div>
      )}
      {list.isPending ? (
        <p className="text-sm text-[var(--color-muted-fg)]">{t("markets.loading")}</p>
      ) : list.data && list.data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {list.data.map((a) => (
            <li
              key={a.id}
              className={
                "flex items-center gap-3 rounded-md border p-2 text-sm " +
                (a.id === loadedAnalysisId
                  ? "border-[var(--color-primary)] bg-[var(--color-accent)]"
                  : "border-[var(--color-border)]")
              }
            >
              <div className="flex-1">
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-[var(--color-muted-fg)]">
                  {t("markets.indicatorCount", { count: a.indicatorCount })}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleLoad(a.id, a.title)}
              >
                {t("markets.load")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => remove.mutate({ id: a.id })}
                disabled={remove.isPending}
              >
                {t("markets.delete")}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--color-muted-fg)]">{t("markets.noAnalysesForSymbol", { symbol })}</p>
      )}
    </div>
  );
}
