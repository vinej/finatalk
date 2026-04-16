import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, RefreshCw, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { MarketChart } from "@/components/market-chart";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActiveIndicator } from "@/lib/indicator-defaults";
import { kindLabel } from "@/lib/indicator-defaults";
import { trpc } from "@/lib/trpc";

type Props = {
  open: boolean;
  symbol: string;
  onClose: () => void;
  onLinked: (analysisId: string) => void | Promise<void>;
};

function summarizeSpec(spec: ActiveIndicator["spec"]): string {
  switch (spec.kind) {
    case "macd":
      return `${kindLabel(spec.kind)} ${spec.fast}/${spec.slow}/${spec.signal}`;
    case "bbands":
      return `${kindLabel(spec.kind)} ${spec.period}, ${spec.stdDev}σ`;
    case "stoch":
      return `${kindLabel(spec.kind)} ${spec.period}/${spec.signal}/${spec.smooth}`;
    case "psar":
      return `${kindLabel(spec.kind)} ${spec.step}/${spec.max}`;
    case "obv":
      return kindLabel(spec.kind);
    default:
      return `${kindLabel(spec.kind)} ${(spec as { period: number }).period}`;
  }
}

export function GenerateAnalysisDialog({ open, symbol, onClose, onLinked }: Props) {
  const { t, i18n } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [indicators, setIndicators] = useState<ActiveIndicator[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = trpc.portfolio.generateAnalysisForSymbol.useMutation({
    onSuccess: (data) => {
      setTitle(data.title);
      setDescription(data.description);
      setIndicators(data.indicators);
      setHasGenerated(true);
    },
    onError: (e) => toast.error(e.message || t("portfolio.generateFailed")),
  });

  const createAnalysis = trpc.analysis.createAnalysis.useMutation();

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setIndicators([]);
    setHasGenerated(false);
    generate.mutate({ symbol, language: i18n.language });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, symbol]);

  const specs = useMemo(() => indicators.map((i) => i.spec), [indicators]);
  const colors = useMemo(() => indicators.map((i) => i.color), [indicators]);

  const previewQuery = trpc.market.analyze.useQuery(
    { symbol, range: "6mo", interval: "1d", indicators: specs, convertTo: null },
    {
      retry: false,
      staleTime: 60_000,
      enabled: open && hasGenerated && indicators.length > 0,
    },
  );

  async function save(overwrite: boolean) {
    const tt = title.trim();
    if (!tt) {
      toast.error(t("portfolio.generatedTitle"));
      return;
    }
    if (indicators.length === 0) return;
    try {
      const { id } = await createAnalysis.mutateAsync({
        symbol,
        title: tt,
        description: description.trim(),
        indicators,
        overwrite,
      });
      toast.success(t("portfolio.analysisGenerated"));
      await onLinked(id);
    } catch (e) {
      const err = e as { data?: { code?: string }; message?: string };
      if (err.data?.code === "CONFLICT") {
        if (window.confirm(t("markets.analysisOverwriteConfirm", { title: tt }))) {
          await save(true);
        }
        return;
      }
      toast.error(err.message ?? t("portfolio.generateFailed"));
    }
  }

  function removeIndicator(localId: string) {
    setIndicators((curr) => curr.filter((i) => i.localId !== localId));
  }

  const analyzeData = previewQuery.data;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      title={t("portfolio.generateAnalysisFor", { symbol })}
      className="max-w-5xl"
    >
      {generate.isPending ? (
        <div className="flex items-center gap-2 px-2 py-10 text-sm text-[var(--color-muted-fg)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("portfolio.generatingAnalysis", { symbol })}
        </div>
      ) : !hasGenerated ? null : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="gen-title" className="text-xs uppercase text-[var(--color-muted-fg)]">
                {t("portfolio.generatedTitle")}
              </Label>
              <Input
                id="gen-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="gen-desc" className="text-xs uppercase text-[var(--color-muted-fg)]">
                {t("portfolio.generatedDescription")}
              </Label>
              <textarea
                id="gen-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={3}
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase text-[var(--color-muted-fg)]">
                {t("markets.indicators")}
              </p>
              <ul className="flex flex-col divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
                {indicators.map((ind) => (
                  <li key={ind.localId} className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span className="truncate text-sm">{summarizeSpec(ind.spec)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeIndicator(ind.localId)}
                      aria-label={t("markets.remove")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => save(false)}
                disabled={createAnalysis.isPending || indicators.length === 0 || !title.trim()}
              >
                <Sparkles className="mr-1 h-4 w-4" />
                {t("portfolio.saveAndLink")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => generate.mutate({ symbol, language: i18n.language })}
                disabled={generate.isPending}
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                {t("portfolio.regenerate")}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={onClose}>
                <X className="mr-1 h-4 w-4" />
                {t("portfolio.cancel")}
              </Button>
            </div>
          </div>

          <div className="flex min-h-[260px] flex-col rounded border border-[var(--color-border)] p-2">
            {previewQuery.isLoading ? (
              <div className="flex flex-1 items-center justify-center text-xs text-[var(--color-muted-fg)]">
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                {t("markets.loading")}
              </div>
            ) : previewQuery.isError || !analyzeData ? (
              <p className="text-xs text-[var(--color-muted-fg)]">{t("markets.fetchFailed")}</p>
            ) : (
              <div className="h-[320px]">
                <MarketChart
                  candles={analyzeData.candles}
                  results={analyzeData.results}
                  colors={colors}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
