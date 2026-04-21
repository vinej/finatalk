import { createFileRoute } from "@tanstack/react-router";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildMutationCallbacks } from "@/lib/mutation-callbacks";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard_/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const [tab, setTab] = useState<"all" | "mine">("all");
  const [tagFilter, setTagFilter] = useState("");

  const allQuery = trpc.template.list.useQuery(tagFilter ? { tag: tagFilter } : undefined);
  const myQuery = trpc.template.myTemplates.useQuery();
  const portfoliosQuery = trpc.portfolio.listPortfolios.useQuery();

  const templates = tab === "all" ? (allQuery.data ?? []) : (myQuery.data ?? []);
  const loading = tab === "all" ? allQuery.isPending : myQuery.isPending;

  const allTags = [...new Set((allQuery.data ?? []).flatMap((t) => t.tags))].sort();

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishPortfolioId, setPublishPortfolioId] = useState("");
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [publishTags, setPublishTags] = useState("");

  const publishMutation = trpc.template.publish.useMutation(
    buildMutationCallbacks({
      invalidate: [utils.template.list, utils.template.myTemplates],
      onSuccess: () => {
        setPublishOpen(false);
        setPublishPortfolioId("");
        setPublishTitle("");
        setPublishDesc("");
        setPublishTags("");
      },
    }),
  );

  const [cloneId, setCloneId] = useState<string | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneBudget, setCloneBudget] = useState("");

  const cloneMutation = trpc.template.clone.useMutation(
    buildMutationCallbacks({
      invalidate: [utils.template.list, utils.portfolio.listPortfolios],
      onSuccess: () => {
        setCloneId(null);
        setCloneName("");
        setCloneBudget("");
      },
    }),
  );

  const deleteMutation = trpc.template.delete.useMutation(
    buildMutationCallbacks({
      invalidate: [utils.template.list, utils.template.myTemplates],
    }),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("templates.title")}</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">{t("templates.subtitle")}</p>
        </div>
        <Button size="sm" onClick={() => setPublishOpen(!publishOpen)}>
          <Plus className="mr-1 h-4 w-4" />
          {t("templates.publish")}
        </Button>
      </header>

      {publishOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{t("templates.publishTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!publishPortfolioId || !publishTitle.trim()) return;
                publishMutation.mutate({
                  portfolioId: publishPortfolioId,
                  title: publishTitle.trim(),
                  description: publishDesc.trim() || undefined,
                  tags: publishTags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .slice(0, 10) || undefined,
                });
              }}
            >
              <div>
                <label className="text-xs font-medium">{t("templates.selectPortfolio")}</label>
                <select
                  value={publishPortfolioId}
                  onChange={(e) => setPublishPortfolioId(e.target.value)}
                  className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-sm"
                >
                  <option value="">—</option>
                  {(portfoliosQuery.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.currency})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">{t("templates.templateTitle")}</label>
                <Input value={publishTitle} onChange={(e) => setPublishTitle(e.target.value)} maxLength={120} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">{t("templates.templateDescription")}</label>
                <Input value={publishDesc} onChange={(e) => setPublishDesc(e.target.value)} maxLength={2000} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">{t("templates.tags")}</label>
                <Input value={publishTags} onChange={(e) => setPublishTags(e.target.value)} maxLength={500} className="mt-1" placeholder="dividend, growth, Canadian" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={publishMutation.isPending || !publishPortfolioId || !publishTitle.trim()}>
                  {publishMutation.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                  {publishMutation.isPending ? t("templates.publishing") : t("templates.publish")}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setPublishOpen(false)}>
                  {t("portfolio.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <div className="flex rounded-md border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={
              "px-3 py-1.5 text-xs font-medium " +
              (tab === "all" ? "bg-[var(--color-accent)] text-[var(--color-fg)]" : "text-[var(--color-muted-fg)]")
            }
          >
            {t("templates.allTemplates")}
          </button>
          <button
            type="button"
            onClick={() => setTab("mine")}
            className={
              "px-3 py-1.5 text-xs font-medium " +
              (tab === "mine" ? "bg-[var(--color-accent)] text-[var(--color-fg)]" : "text-[var(--color-muted-fg)]")
            }
          >
            {t("templates.myTemplates")}
          </button>
        </div>
        {allTags.length > 0 && tab === "all" && (
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setTagFilter("")}
              className={
                "rounded-full border px-2 py-0.5 text-[10px] " +
                (!tagFilter
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                  : "border-[var(--color-border)] text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]")
              }
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag === tagFilter ? "" : tag)}
                className={
                  "rounded-full border px-2 py-0.5 text-[10px] " +
                  (tagFilter === tag
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                    : "border-[var(--color-border)] text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]")
                }
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--color-muted-fg)]">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {!loading && templates.length === 0 && (
        <p className="py-8 text-center text-sm text-[var(--color-muted-fg)]">{t("templates.empty")}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tpl) => (
          <Card key={tpl.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{tpl.title}</CardTitle>
                  <p className="text-xs text-[var(--color-muted-fg)]">{tpl.currency}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-[var(--color-muted-fg)]">
                  <Copy className="h-3 w-3" />
                  {Number(tpl.cloneCount)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {tpl.description && (
                <p className="mb-2 text-xs text-[var(--color-muted-fg)]">{tpl.description}</p>
              )}

              <div className="mb-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-fg)]">
                      <th className="py-1 font-medium">{t("portfolio.symbol")}</th>
                      <th className="py-1 text-right font-medium">{t("templates.weight")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tpl.holdings as Array<{ symbol: string; weightPct: number }>).map((h) => (
                      <tr key={h.symbol} className="border-b border-[var(--color-border)]/50">
                        <td className="py-1 font-medium">{h.symbol}</td>
                        <td className="py-1 text-right tabular-nums">{h.weightPct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {tpl.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {tpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCloneId(tpl.id);
                    setCloneName(tpl.title);
                  }}
                >
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  {t("templates.clone")}
                </Button>
                {tab === "mine" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(t("templates.confirmDelete"))) {
                        deleteMutation.mutate({ id: tpl.id });
                      }
                    }}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    {t("templates.delete")}
                  </Button>
                )}
              </div>

              {cloneId === tpl.id && (
                <form
                  className="mt-3 space-y-2 rounded border border-[var(--color-border)] p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!cloneName.trim() || !cloneBudget) return;
                    cloneMutation.mutate({
                      templateId: tpl.id,
                      title: cloneName.trim(),
                      budget: Number(cloneBudget),
                    });
                  }}
                >
                  <div>
                    <label className="text-xs font-medium">{t("templates.cloneName")}</label>
                    <Input value={cloneName} onChange={(e) => setCloneName(e.target.value)} maxLength={120} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">{t("templates.budget")} ({tpl.currency})</label>
                    <Input
                      type="number"
                      min={1}
                      step="0.01"
                      value={cloneBudget}
                      onChange={(e) => setCloneBudget(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={cloneMutation.isPending || !cloneName.trim() || !cloneBudget}>
                      {cloneMutation.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                      {cloneMutation.isPending ? t("templates.cloning") : t("templates.clone")}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setCloneId(null)}>
                      {t("portfolio.cancel")}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
