import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai/disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AdvisorChat() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const chat = trpc.ai.chatMarket.useMutation({
    onSuccess: (data) => {
      setMessages((curr) => [...curr, { role: "assistant", content: data.response }]);
    },
    onError: (err) => {
      setMessages((curr) => curr.slice(0, -1));
      toast.error(err.message ?? t("advisor.failed"));
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
      language: i18n.language,
    });
  }

  const examples = [
    t("advisor.examplePrompt1"),
    t("advisor.examplePrompt2"),
    t("advisor.examplePrompt3"),
  ];

  return (
    <div className="flex flex-col">
      <div className="min-h-[240px] px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center text-sm text-[var(--color-muted-fg)]">
            <p>{t("advisor.empty")}</p>
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
                    "rounded-md px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "ml-8 bg-[var(--color-accent)] text-[var(--color-fg)]"
                      : "mr-8 border border-[var(--color-border)]",
                  )}
                >
                  {m.content}
                </div>
              </li>
            ))}
            {chat.isPending && (
              <li className="mr-8 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm italic text-[var(--color-muted-fg)]">
                {t("advisor.thinking")}
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
            placeholder={t("advisor.placeholder")}
            disabled={chat.isPending}
            autoComplete="off"
          />
          <Button type="submit" disabled={chat.isPending || !input.trim()}>
            {t("advisor.send")}
          </Button>
        </form>
        <AiDisclaimer />
      </footer>
    </div>
  );
}
