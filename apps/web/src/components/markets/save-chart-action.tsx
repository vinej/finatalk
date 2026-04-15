import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import type { ActiveIndicator } from "@/lib/indicator-defaults";
import type { RouterInputs } from "@finatalk/trpc";

type CreateInput = RouterInputs["analysis"]["createSavedChart"];

export function SaveChartAction({
  current,
  defaultTitle,
}: {
  current: {
    symbol: string;
    range: CreateInput["range"];
    interval: CreateInput["interval"];
    convertTo: "CAD" | null;
    indicators: ActiveIndicator[];
  };
  defaultTitle?: string | null;
}) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  function openPanel() {
    setTitle(defaultTitle ?? "");
    setOpen(true);
  }

  const create = trpc.analysis.createSavedChart.useMutation({
    onSuccess: () => {
      utils.analysis.listSavedCharts.invalidate();
      toast.success(t("markets.chartSaved"));
      setOpen(false);
      setTitle("");
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t2 = title.trim();
    if (!t2) return;
    create.mutate({
      title: t2,
      symbol: current.symbol,
      range: current.range,
      interval: current.interval,
      convertTo: current.convertTo,
      indicators: current.indicators,
    });
  }

  return (
    <div ref={ref} className="relative">
      <Button type="button" size="sm" onClick={() => (open ? setOpen(false) : openPanel())}>
        {t("markets.saveCurrentChart")}
      </Button>
      {open && (
        <form
          onSubmit={submit}
          className="absolute right-0 top-full z-20 mt-2 w-80 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-lg"
        >
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="chart-title">{t("markets.chartTitle")}</Label>
              <Input
                id="chart-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder={`${current.symbol} ${current.range}`}
                autoFocus
                required
              />
            </div>
            <div className="text-xs text-[var(--color-muted-fg)]">
              {t("markets.chartSavePreview", {
                symbol: current.symbol,
                range: current.range,
                interval: current.interval,
                count: current.indicators.length,
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
                {t("markets.cancel")}
              </Button>
              <Button type="submit" size="sm" disabled={create.isPending || !title.trim()}>
                {create.isPending ? t("markets.saving") : t("markets.save")}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
