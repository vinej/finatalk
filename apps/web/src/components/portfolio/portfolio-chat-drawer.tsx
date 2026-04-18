import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai/disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

type ChatMessage = { role: "user" | "assistant"; content: string };

type PortfolioContext = {
  portfolioTitle: string;
  currency: "USD" | "CAD";
  holdings: Array<{
    symbol: string;
    quantity: number;
    costBasis: number;
    purchaseDate: string;
  }>;
};

type Mode = "advisor" | "whatif";

export function PortfolioChatDrawer({
  open,
  onOpenChange,
  context,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: PortfolioContext;
}) {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<Mode>("advisor");
  const [advisorMessages, setAdvisorMessages] = useState<ChatMessage[]>([]);
  const [whatifMessages, setWhatifMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const messages = mode === "advisor" ? advisorMessages : whatifMessages;
  const setMessages = mode === "advisor" ? setAdvisorMessages : setWhatifMessages;

  const advisorChat = trpc.ai.chatPortfolio.useMutation({
    onSuccess: (data) => {
      setAdvisorMessages((curr) => [...curr, { role: "assistant", content: data.response }]);
    },
    onError: (err) => {
      setAdvisorMessages((curr) => curr.slice(0, -1));
      toast.error(err.message ?? t("portfolio.chatFailed"));
    },
  });

  const scenarioChat = trpc.ai.chatScenario.useMutation({
    onSuccess: (data) => {
      setWhatifMessages((curr) => [...curr, { role: "assistant", content: data.response }]);
    },
    onError: (err) => {
      setWhatifMessages((curr) => curr.slice(0, -1));
      toast.error(err.message ?? t("portfolio.chatFailed"));
    },
  });

  const isPending = mode === "advisor" ? advisorChat.isPending : scenarioChat.isPending;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function send() {
    const text = input.trim();
    if (!text || isPending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    const payload = {
      messages: next,
      context: {
        portfolioTitle: context.portfolioTitle,
        currency: context.currency,
        holdings: context.holdings,
      },
      language: i18n.language,
    };
    if (mode === "advisor") {
      advisorChat.mutate(payload);
    } else {
      scenarioChat.mutate(payload);
    }
  }

  const emptyText = mode === "advisor" ? t("portfolio.chatEmpty") : t("portfolio.whatifEmpty");
  const exampleText = mode === "advisor" ? t("portfolio.chatExample") : t("portfolio.whatifExample");
  const placeholderText = mode === "advisor" ? t("portfolio.chatPlaceholder") : t("portfolio.whatifPlaceholder");

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden
        onClick={() => onOpenChange(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("portfolio.chatTitle")}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl transition-transform md:w-1/2",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex flex-col border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <h2 className="text-base font-semibold">{t("portfolio.chatTitle")}</h2>
              <p className="text-xs text-[var(--color-muted-fg)]">
                {context.portfolioTitle} · {context.currency} ·{" "}
                {t("portfolio.holdingsCount", { count: context.holdings.length })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="rounded p-1 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
            >
              ✕
            </button>
          </div>
          <div className="flex border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setMode("advisor")}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                mode === "advisor"
                  ? "border-b-2 border-[var(--color-fg)] text-[var(--color-fg)]"
                  : "text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]",
              )}
            >
              {t("portfolio.advisorTab")}
            </button>
            <button
              type="button"
              onClick={() => setMode("whatif")}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                mode === "whatif"
                  ? "border-b-2 border-[var(--color-fg)] text-[var(--color-fg)]"
                  : "text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]",
              )}
            >
              {t("portfolio.whatifTab")}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[var(--color-muted-fg)]">
              <p>{emptyText}</p>
              <p className="max-w-xs text-xs italic">{exampleText}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "ml-8 bg-[var(--color-accent)] text-[var(--color-fg)]"
                      : "mr-8 border border-[var(--color-border)]",
                  )}
                >
                  {m.content}
                </li>
              ))}
              {isPending && (
                <li className="mr-8 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm italic text-[var(--color-muted-fg)]">
                  {t("portfolio.chatThinking")}
                </li>
              )}
              <div ref={endRef} />
            </ul>
          )}
        </div>

        <footer className="flex flex-col gap-2 border-t border-[var(--color-border)] px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholderText}
              disabled={isPending}
              autoComplete="off"
            />
            <Button type="submit" disabled={isPending || !input.trim()}>
              {t("portfolio.chatSend")}
            </Button>
          </form>
          <AiDisclaimer />
        </footer>
      </aside>
    </>
  );
}
