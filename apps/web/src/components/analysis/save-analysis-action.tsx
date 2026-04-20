import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import type { ActiveIndicator } from "@/lib/indicator-defaults";

export function SaveAnalysisAction({
  symbol,
  range,
  interval,
  convertTo,
  indicators,
  defaultTitle,
  defaultDescription,
}: {
  symbol: string;
  range: "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max";
  interval: "1m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1d" | "1wk" | "1mo";
  convertTo: "CAD" | null;
  indicators: ActiveIndicator[];
  defaultTitle?: string | null;
  defaultDescription?: string | null;
}) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  function openPanel() {
    setTitle(defaultTitle ?? "");
    setDescription(defaultDescription ?? "");
    setOpen(true);
  }

  const create = trpc.analysis.createAnalysis.useMutation({
    onSuccess: (data) => {
      utils.analysis.listAnalyses.invalidate();
      toast.success(data.overwritten ? t("analysis.analysisOverwritten") : t("analysis.analysisSaved"));
      setOpen(false);
      setTitle("");
      setDescription("");
    },
    onError: (e, variables) => {
      if (e.data?.code === "CONFLICT") {
        const confirmed = window.confirm(t("analysis.analysisOverwriteConfirm", { title: variables.title }));
        if (confirmed) {
          create.mutate({ ...variables, overwrite: true });
        }
        return;
      }
      toast.error(e.message);
    },
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
    create.mutate({ symbol, title: t2, description: description.trim(), range, interval, convertTo, indicators });
  }

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        size="sm"
        onClick={() => (open ? setOpen(false) : openPanel())}
        disabled={indicators.length === 0}
      >
        {t("analysis.saveAsNew")}
      </Button>
      {open && (
        <form
          onSubmit={submit}
          className="absolute right-0 top-full z-20 mt-2 w-80 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-lg"
        >
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="analysis-title">{t("analysis.analysisTitle")}</Label>
              <Input
                id="analysis-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                autoFocus
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="analysis-desc">{t("analysis.analysisDescription")}</Label>
              <textarea
                id="analysis-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={6}
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
                {t("analysis.cancel")}
              </Button>
              <Button type="submit" size="sm" disabled={create.isPending || !title.trim()}>
                {create.isPending ? t("analysis.saving") : t("analysis.save")}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
