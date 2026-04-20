import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, CalendarDays, Copy, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { GeneratePortfolioDialog } from "@/components/portfolio/generate-portfolio-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard_/portfolios")({
  component: PortfoliosPage,
});

type Currency = "USD" | "CAD";

function PortfoliosPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.portfolio.listPortfolios.useQuery();
  const [createOpen, setCreateOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCurrency, setNewCurrency] = useState<Currency>("USD");

  const create = trpc.portfolio.createPortfolio.useMutation({
    onSuccess: async () => {
      await utils.portfolio.listPortfolios.invalidate();
      toast.success(t("portfolio.created"));
      setCreateOpen(false);
      setNewTitle("");
    },
    onError: (e, variables) => {
      if (e.data?.code === "CONFLICT") {
        const ok = window.confirm(
          t("portfolio.duplicateTitleConfirm", { title: variables.title }),
        );
        if (ok) create.mutate({ ...variables, overwrite: true });
        return;
      }
      toast.error(e.message);
    },
  });

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    create.mutate({ title, currency: newCurrency });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-[var(--color-muted-fg)]" />
          <h1 className="text-lg font-semibold">{t("nav.portfolios")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/dashboard/calendar">
              <CalendarDays className="mr-1 h-4 w-4" />
              {t("nav.calendar")}
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/dashboard/templates">
              <Copy className="mr-1 h-4 w-4" />
              {t("nav.templates")}
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setGenerateOpen(true)}>
            <Sparkles className="mr-1 h-4 w-4" />
            {t("portfolio.generatePortfolio")}
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {t("portfolio.newPortfolio")}
          </Button>
        </div>
      </header>

      {isLoading ? (
        <p className="text-sm text-[var(--color-muted-fg)]">{t("portfolio.loading")}</p>
      ) : !data || data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-sm text-[var(--color-muted-fg)]">
              {t("portfolio.empty")}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setGenerateOpen(true)}>
                <Sparkles className="mr-1 h-4 w-4" />
                {t("portfolio.generatePortfolio")}
              </Button>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                {t("portfolio.newPortfolio")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <Link
              key={p.id}
              to="/dashboard/portfolios/$portfolioId"
              params={{ portfolioId: p.id }}
              className="block"
            >
              <Card className="h-full cursor-pointer transition hover:border-[var(--color-fg)]/40">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{p.title}</span>
                    <span className="ml-2 shrink-0 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-medium">
                      {p.currency}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[var(--color-muted-fg)]">
                    {t("portfolio.holdingsCount", { count: p.holdingCount })}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted-fg)]">
                    {t("portfolio.updatedAt", {
                      date: new Date(p.updatedAt).toLocaleDateString(),
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("portfolio.newPortfolio")}
        className="max-w-md"
      >
        <form onSubmit={submitCreate} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="p-title">{t("portfolio.title")}</Label>
            <Input
              id="p-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={120}
              required
              autoFocus
              placeholder="TFSA"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>{t("portfolio.currency")}</Label>
            <div className="flex gap-4">
              {(["USD", "CAD"] as const).map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="currency"
                    value={c}
                    checked={newCurrency === c}
                    onChange={() => setNewCurrency(c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              {t("portfolio.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={create.isPending || !newTitle.trim()}>
              {create.isPending ? t("portfolio.saving") : t("portfolio.create")}
            </Button>
          </div>
        </form>
      </Dialog>

      <GeneratePortfolioDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onCreated={async (id) => {
          await utils.portfolio.listPortfolios.invalidate();
          toast.success(t("portfolio.portfolioGenerated"));
          setGenerateOpen(false);
          navigate({
            to: "/dashboard/portfolios/$portfolioId",
            params: { portfolioId: id },
          });
        }}
      />
    </div>
  );
}
