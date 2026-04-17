import { Check, FolderOpen, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import type { ActiveIndicator } from "@/lib/indicator-defaults";

export function AnalysisBrowser({
  indicators,
  loadedAnalysisId,
  loadedAnalysisTitle,
  onLoad,
  onLoadedChange,
  onTitleChange,
}: {
  indicators: ActiveIndicator[];
  loadedAnalysisId: string | null;
  loadedAnalysisTitle: string | null;
  onLoad: (data: { items: ActiveIndicator[]; id: string; symbol: string; title: string; description: string; range: string; interval: string; convertTo: "CAD" | null }) => void;
  onLoadedChange: (id: string | null) => void;
  onTitleChange: (id: string, title: string) => void;
}) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const list = trpc.analysis.listAnalyses.useQuery();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const update = trpc.analysis.updateAnalysis.useMutation({
    onSuccess: () => {
      utils.analysis.listAnalyses.invalidate();
      toast.success(t("analysis.analysisUpdated"));
    },
    onError: (e) => toast.error(e.message),
  });

  const rename = trpc.analysis.updateAnalysis.useMutation({
    onSuccess: (_data, variables) => {
      utils.analysis.listAnalyses.invalidate();
      if (variables.title) onTitleChange(variables.id, variables.title);
      setRenamingId(null);
      toast.success(t("analysis.analysisRenamed"));
    },
    onError: (e) => toast.error(e.message),
  });

  function startRename(id: string, currentTitle: string) {
    setRenamingId(id);
    setRenameValue(currentTitle);
  }

  function submitRename(id: string) {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    rename.mutate({ id, title: trimmed });
  }

  const remove = trpc.analysis.deleteAnalysis.useMutation({
    onSuccess: (data) => {
      utils.analysis.listAnalyses.invalidate();
      if (data.id === loadedAnalysisId) onLoadedChange(null);
      toast.success(t("analysis.analysisDeleted"));
    },
    onError: (e) => toast.error(e.message),
  });

  const getAnalysis = utils.analysis.getAnalysis;

  async function handleLoad(id: string, fallbackTitle: string) {
    try {
      const full = await getAnalysis.fetch({ id });
      onLoad({
        items: full.indicators,
        id: full.id,
        symbol: full.symbol,
        title: full.title || fallbackTitle,
        description: full.description ?? "",
        range: full.range ?? "1y",
        interval: full.interval ?? "1d",
        convertTo: full.convertTo ?? null,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("analysis.loadFailed"));
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
            {t("analysis.updateNamed", { name: loadedAnalysisTitle })}
          </Button>
        </div>
      )}
      {list.isPending ? (
        <p className="text-sm text-[var(--color-muted-fg)]">{t("analysis.loading")}</p>
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
                {renamingId === a.id ? (
                  <form
                    className="flex items-center gap-1.5"
                    onSubmit={(e) => { e.preventDefault(); submitRename(a.id); }}
                  >
                    <Input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      maxLength={120}
                      autoFocus
                      className="h-7 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={rename.isPending || !renameValue.trim()}
                      title={t("analysis.save")}
                      className="rounded p-1 text-[var(--color-fg)] hover:bg-[var(--color-accent)] disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenamingId(null)}
                      title={t("analysis.cancel")}
                      className="rounded p-1 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLoad(a.id, a.title)}
                    className="text-left"
                    title={t("analysis.load")}
                  >
                    <div className="font-medium hover:underline">{a.title}</div>
                    <div className="text-xs text-[var(--color-muted-fg)]">
                      {a.symbol} · {t("analysis.indicatorCount", { count: a.indicatorCount })}
                    </div>
                  </button>
                )}
              </div>
              {renamingId !== a.id && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleLoad(a.id, a.title)}
                    title={t("analysis.load")}
                    className="rounded p-1.5 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
                  >
                    <FolderOpen className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => startRename(a.id, a.title)}
                    title={t("analysis.rename")}
                    className="rounded p-1.5 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove.mutate({ id: a.id })}
                    disabled={remove.isPending}
                    title={t("analysis.delete")}
                    className="rounded p-1.5 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-destructive)] disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--color-muted-fg)]">{t("analysis.noAnalyses")}</p>
      )}
    </div>
  );
}
