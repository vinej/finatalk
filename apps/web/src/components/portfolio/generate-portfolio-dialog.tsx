import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, RefreshCw, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AllocationDonut, colorFor, type DonutSegment } from "@/components/portfolio/allocation-donut";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

type DraftHolding = {
  symbol: string;
  quantity: number;
  costBasis: number;
  rationale: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (portfolioId: string) => void | Promise<void>;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function GeneratePortfolioDialog({ open, onClose, onCreated }: Props) {
  const { t, i18n } = useTranslation();

  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState<"USD" | "CAD">("USD");
  const [rationale, setRationale] = useState("");
  const [holdings, setHoldings] = useState<DraftHolding[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const generate = trpc.portfolio.generatePortfolioFromPrompt.useMutation({
    onSuccess: (data) => {
      setTitle(data.title);
      setCurrency(data.currency);
      setRationale(data.rationale);
      setHoldings(
        data.holdings.map((h) => ({
          symbol: h.symbol.toUpperCase(),
          quantity: h.quantity,
          costBasis: h.costBasis,
          rationale: h.rationale,
        })),
      );
      setHasGenerated(true);
    },
    onError: (e) => toast.error(e.message || t("portfolio.generatePortfolioFailed")),
  });

  const createPortfolio = trpc.portfolio.createPortfolio.useMutation();
  const addHolding = trpc.portfolio.addHolding.useMutation();

  useEffect(() => {
    if (!open) return;
    setPrompt("");
    setTitle("");
    setRationale("");
    setHoldings([]);
    setHasGenerated(false);
    setIsCreating(false);
    generate.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const segments = useMemo<DonutSegment[]>(() => {
    return holdings
      .map((h, i) => ({
        label: h.symbol,
        value: h.quantity * h.costBasis,
        color: colorFor(h.symbol, i),
      }))
      .filter((s) => s.value > 0);
  }, [holdings]);

  function submitPrompt(e: React.FormEvent) {
    e.preventDefault();
    const p = prompt.trim();
    if (p.length < 3) return;
    generate.mutate({ prompt: p, language: i18n.language });
  }

  function removeHolding(idx: number) {
    setHoldings((curr) => curr.filter((_, i) => i !== idx));
  }

  function updateQuantity(idx: number, raw: string) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return;
    setHoldings((curr) => curr.map((h, i) => (i === idx ? { ...h, quantity: n } : h)));
  }

  async function createAll(overwrite: boolean) {
    const titleTrim = title.trim();
    if (!titleTrim || holdings.length === 0) return;
    setIsCreating(true);
    try {
      const { id } = await createPortfolio.mutateAsync({
        title: titleTrim,
        currency,
        overwrite,
      });
      for (const h of holdings) {
        await addHolding.mutateAsync({
          portfolioId: id,
          holding: {
            symbol: h.symbol.toUpperCase(),
            quantity: h.quantity,
            costBasis: h.costBasis,
            purchaseDate: todayIso(),
          },
        });
      }
      await onCreated(id);
    } catch (e) {
      const err = e as { data?: { code?: string }; message?: string };
      if (err.data?.code === "CONFLICT") {
        if (window.confirm(t("portfolio.duplicateTitleConfirm", { title: titleTrim }))) {
          setIsCreating(false);
          await createAll(true);
          return;
        }
      } else {
        toast.error(err.message ?? t("portfolio.generatePortfolioFailed"));
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      title={t("portfolio.generatePortfolioTitle")}
      className="max-w-5xl"
    >
      {!hasGenerated ? (
        <form onSubmit={submitPrompt} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="gen-prompt" className="text-xs uppercase text-[var(--color-muted-fg)]">
              {t("portfolio.generatePortfolioPrompt")}
            </Label>
            <textarea
              id="gen-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder={t("portfolio.generatePortfolioPlaceholder")}
              className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm"
              required
              autoFocus
            />
            <p className="text-xs text-[var(--color-muted-fg)]">
              {t("portfolio.generatePortfolioHint")}
            </p>
          </div>
          {generate.isPending ? (
            <div className="flex items-center gap-2 py-6 text-sm text-[var(--color-muted-fg)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("portfolio.generatingPortfolio")}
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                <X className="mr-1 h-4 w-4" />
                {t("portfolio.cancel")}
              </Button>
              <Button type="submit" size="sm" disabled={prompt.trim().length < 3}>
                <Sparkles className="mr-1 h-4 w-4" />
                {t("portfolio.generatePortfolio")}
              </Button>
            </div>
          )}
        </form>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
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
              <span className="rounded-full bg-[var(--color-accent)] px-2 py-1 text-xs font-medium">
                {currency}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs uppercase text-[var(--color-muted-fg)]">
                {t("portfolio.rationale")}
              </Label>
              <p className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm text-[var(--color-muted-fg)]">
                {rationale}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase text-[var(--color-muted-fg)]">
                {t("portfolio.holdings")}
              </p>
              <ul className="flex flex-col divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
                {holdings.map((h, idx) => (
                  <li key={`${h.symbol}-${idx}`} className="flex flex-col gap-1 px-2 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 truncate text-sm font-medium">{h.symbol}</span>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={h.quantity}
                        onChange={(e) => updateQuantity(idx, e.target.value)}
                        className="h-8 w-24"
                        aria-label={t("portfolio.quantity")}
                      />
                      <span className="text-xs text-[var(--color-muted-fg)]">
                        × {h.costBasis.toFixed(2)} {currency}
                      </span>
                      <span className="ml-auto text-xs tabular-nums text-[var(--color-muted-fg)]">
                        = {(h.quantity * h.costBasis).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeHolding(idx)}
                        aria-label={t("portfolio.removeHolding")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {h.rationale ? (
                      <p className="pl-1 text-xs text-[var(--color-muted-fg)]">{h.rationale}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => createAll(false)}
                disabled={isCreating || holdings.length === 0 || !title.trim()}
              >
                <Sparkles className="mr-1 h-4 w-4" />
                {isCreating ? t("portfolio.saving") : t("portfolio.createPortfolio")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => generate.mutate({ prompt: prompt.trim(), language: i18n.language })}
                disabled={generate.isPending || isCreating}
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                {t("portfolio.regenerate")}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={isCreating}>
                <X className="mr-1 h-4 w-4" />
                {t("portfolio.cancel")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded border border-[var(--color-border)] p-3">
            <p className="text-xs uppercase text-[var(--color-muted-fg)]">
              {t("portfolio.allocation")}
            </p>
            <AllocationDonut segments={segments} size={180} thickness={22} />
          </div>
        </div>
      )}
    </Dialog>
  );
}
