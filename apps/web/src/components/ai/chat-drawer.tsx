import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai/disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ActiveIndicator } from "@/lib/indicator-defaults";
import { trpc } from "@/lib/trpc";

type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatContext = {
  symbol: string;
  range: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max";
  interval: "1d" | "1wk" | "1mo";
  convertTo: "CAD" | null;
  activeIndicators: ActiveIndicator[];
  hiddenIds: Set<string>;
};

export function ChatDrawer({
  open,
  onOpenChange,
  context,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: ChatContext;
}) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const chat = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((curr) => [...curr, { role: "assistant", content: data.response }]);
    },
    onError: (err) => {
      setMessages((curr) => curr.slice(0, -1));
      toast.error(err.message ?? t("analysis.chatFailed"));
    },
  });

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
  }, [messages, chat.isPending]);

  function send() {
    const text = input.trim();
    if (!text || chat.isPending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    chat.mutate({
      messages: next,
      context: {
        symbol: context.symbol,
        range: context.range,
        interval: context.interval,
        convertTo: context.convertTo,
        activeIndicators: context.activeIndicators.map((a) => ({
          spec: a.spec,
          hidden: context.hiddenIds.has(a.localId),
        })),
      },
      language: i18n.language,
    });
  }

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
        aria-label={t("analysis.chatTitle")}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl transition-transform md:w-1/2",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold">{t("analysis.chatTitle")}</h2>
            <p className="text-xs text-[var(--color-muted-fg)]">
              {context.symbol} · {context.range} / {context.interval}
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
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[var(--color-muted-fg)]">
              <p>{t("analysis.chatEmpty")}</p>
              <p className="max-w-xs text-xs italic">{t("analysis.chatExample")}</p>
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
              {chat.isPending && (
                <li className="mr-8 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm italic text-[var(--color-muted-fg)]">
                  {t("analysis.chatThinking")}
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
              placeholder={t("analysis.chatPlaceholder")}
              disabled={chat.isPending}
              autoComplete="off"
            />
            <Button type="submit" disabled={chat.isPending || !input.trim()}>
              {t("analysis.chatSend")}
            </Button>
          </form>
          <AiDisclaimer />
        </footer>
      </aside>
    </>
  );
}
