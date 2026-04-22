import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai/disclaimer";
import { Markdown } from "@/components/ai/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeExternalUrl } from "@/lib/safe-url";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Citation = { label: string; url: string };

type AssistantMeta = {
  citations: Citation[];
  confidence: "high" | "medium" | "low";
};

export function ResearchChat({ symbol }: { symbol: string }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [meta, setMeta] = useState<Map<number, AssistantMeta>>(new Map());
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const chat = trpc.research.chat.useMutation({
    onSuccess: (data) => {
      setMessages((curr) => {
        const next = [...curr, { role: "assistant" as const, content: data.response }];
        setMeta((prev) => {
          const m = new Map(prev);
          m.set(next.length - 1, {
            citations: data.citations,
            confidence: data.confidence,
          });
          return m;
        });
        return next;
      });
    },
    onError: (err) => {
      setMessages((curr) => curr.slice(0, -1));
      toast.error(err.message ?? t("research.failed"));
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      context: { symbol: symbol || undefined },
      language: i18n.language,
    });
  }

  const examples = [
    t("research.examplePrompt1"),
    t("research.examplePrompt2"),
    t("research.examplePrompt3"),
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center text-sm text-[var(--color-muted-fg)]">
            <p>{t("research.empty")}</p>
            <div className="flex flex-col gap-1.5">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs italic hover:bg-[var(--color-accent)]"
                  onClick={() => {
                    setInput(ex);
                    inputRef.current?.focus();
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <li key={i}>
                <div
                  className={cn(
                    "rounded-md px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-8 whitespace-pre-wrap bg-[var(--color-accent)] text-[var(--color-fg)]"
                      : "mr-8 border border-[var(--color-border)]",
                  )}
                >
                  {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : m.content}
                </div>
                {m.role === "assistant" && meta.has(i) && (
                  <MessageFooter meta={meta.get(i)!} />
                )}
              </li>
            ))}
            {chat.isPending && (
              <li className="mr-8 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm italic text-[var(--color-muted-fg)]">
                {t("research.thinking")}
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
            placeholder={t("research.placeholder")}
            disabled={chat.isPending}
            autoComplete="off"
          />
          <Button type="submit" disabled={chat.isPending || !input.trim()}>
            {t("research.send")}
          </Button>
        </form>
        <AiDisclaimer />
      </footer>
    </div>
  );
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function MessageFooter({ meta }: { meta: AssistantMeta }) {
  const { t } = useTranslation();

  const confKey =
    meta.confidence === "high"
      ? "research.confidenceHigh"
      : meta.confidence === "low"
        ? "research.confidenceLow"
        : "research.confidenceMedium";

  return (
    <div className="mr-8 mt-1.5 flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          CONFIDENCE_STYLES[meta.confidence],
        )}
        title={t("research.confidenceTooltip")}
      >
        {t(confKey)}
      </span>
      {meta.citations.length > 0 && (
        <>
          <span className="text-xs text-[var(--color-muted-fg)]">{t("research.citations")}:</span>
          {meta.citations.map((c) => {
            const safeUrl = safeExternalUrl(c.url);
            if (!safeUrl) return null;
            return (
              <a
                key={safeUrl}
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs hover:bg-[var(--color-accent)]"
              >
                <span className="max-w-[200px] truncate">{c.label}</span>
                <ExternalLink className="h-3 w-3 text-[var(--color-muted-fg)]" aria-hidden />
              </a>
            );
          })}
        </>
      )}
    </div>
  );
}
