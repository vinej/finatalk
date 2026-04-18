import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Receipt, Send } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard_/tax")({
  component: TaxPage,
});

type ChatMsg = { role: "user" | "assistant"; content: string };

function TaxPage() {
  const { t, i18n } = useTranslation();

  const portfoliosQuery = trpc.portfolio.listPortfolios.useQuery();
  const portfolioIds = portfoliosQuery.data?.map((p) => p.id) ?? [];

  const detailQueries = trpc.useQueries((t) =>
    portfolioIds.map((id) => t.portfolio.getPortfolio({ id })),
  );

  const portfolioContext = useMemo(() => {
    return detailQueries
      .filter((q) => q.data)
      .map((q) => {
        const d = q.data!;
        return {
          title: d.title,
          currency: d.currency as "USD" | "CAD",
          accountType: d.accountType,
          holdings: d.holdings.map((h) => ({
            symbol: h.symbol,
            quantity: h.quantity,
            costBasis: h.costBasis,
            purchaseDate: h.purchaseDate,
          })),
        };
      });
  }, [detailQueries]);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chatTax.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    },
  });

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    chatMutation.mutate({
      messages: next,
      context: { portfolios: portfolioContext },
      language: i18n.language,
    });
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }

  const loading = portfoliosQuery.isPending || detailQueries.some((q) => q.isPending);
  const totalHoldings = portfolioContext.reduce((s, p) => s + p.holdings.length, 0);

  const accountSummary = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of portfolioContext) {
      const key = p.accountType ?? "non-registered";
      m.set(key, (m.get(key) ?? 0) + p.holdings.length);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [portfolioContext]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center gap-3">
        <Receipt className="h-5 w-5 text-[var(--color-muted-fg)]" />
        <h1 className="text-lg font-semibold">{t("tax.title")}</h1>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-muted-fg)]" />}
      </header>

      <p className="text-xs text-[var(--color-muted-fg)]">{t("tax.disclaimer")}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-xs font-medium text-[var(--color-muted-fg)]">{t("tax.portfolioCount")}</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-semibold">{portfolioContext.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs font-medium text-[var(--color-muted-fg)]">{t("tax.totalHoldings")}</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-semibold">{totalHoldings}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs font-medium text-[var(--color-muted-fg)]">{t("tax.accountTypes")}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {accountSummary.map(([type, count]) => (
                <span key={type} className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-medium">
                  {type} ({count})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t("tax.advisor")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={scrollRef} className="mb-3 flex max-h-[500px] flex-col gap-3 overflow-y-auto">
            {messages.length === 0 && (
              <p className="py-8 text-center text-xs text-[var(--color-muted-fg)]">{t("tax.empty")}</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap " +
                  (m.role === "user"
                    ? "ml-auto bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                    : "bg-[var(--color-accent)]")
                }
              >
                {m.content}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-muted-fg)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("tax.thinking")}
              </div>
            )}
          </div>
          <form onSubmit={send} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("tax.placeholder")}
              disabled={chatMutation.isPending || loading}
              maxLength={2000}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={chatMutation.isPending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-2 flex flex-wrap gap-1">
            {[t("tax.example1"), t("tax.example2"), t("tax.example3")].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setInput(ex)}
                className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]"
              >
                {ex}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
