import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import type { ActiveIndicator } from "@/lib/indicator-defaults";

export function SaveAnalysisAction({
  indicators,
  defaultTitle,
  defaultDescription,
}: {
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
      toast.success(data.overwritten ? t("markets.analysisOverwritten") : t("markets.analysisSaved"));
      setOpen(false);
      setTitle("");
      setDescription("");
    },
    onError: (e, variables) => {
      if (e.data?.code === "CONFLICT") {
        const confirmed = window.confirm(t("markets.analysisOverwriteConfirm", { title: variables.title }));
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
    create.mutate({ title: t2, description: description.trim(), indicators });
  }

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        size="sm"
        onClick={() => (open ? setOpen(false) : openPanel())}
        disabled={indicators.length === 0}
      >
        {t("markets.saveAsNew")}
      </Button>
      {open && (
        <form
          onSubmit={submit}
          className="absolute right-0 top-full z-20 mt-2 w-80 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-lg"
        >
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="analysis-title">{t("markets.analysisTitle")}</Label>
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
              <Label htmlFor="analysis-desc">{t("markets.analysisDescription")}</Label>
              <Input
                id="analysis-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              />
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
