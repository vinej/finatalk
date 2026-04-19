import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ai/markdown";
import { pickLang } from "@/lib/lang";
import { BUY_SELL_GUIDE } from "@/lib/buy-sell-guide";
import type { TaLink } from "@/lib/ta-guide";

export const Route = createFileRoute("/_auth/dashboard_/learn-buy-sell")({
  component: LearnBuySellPage,
});

function LearnBuySellPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const guide = BUY_SELL_GUIDE[lang];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("learnTa.buySellTitle")}</CardTitle>
          <p className="text-sm text-[var(--color-muted-fg)]">{t("learnTa.buySellSubtitle")}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Markdown>{guide.intro}</Markdown>
          <nav className="mt-2">
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
              {t("learnTa.tableOfContents")}
            </div>
            <ul className="flex flex-col gap-0.5">
              {guide.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#buy-sell-${s.id}`}
                    className="text-sm text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </CardContent>
      </Card>

      {guide.sections.map((s) => (
        <Card key={s.id} id={`buy-sell-${s.id}`} className="scroll-mt-4">
          <CardHeader>
            <CardTitle className="text-base">{s.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Markdown>{s.body}</Markdown>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("learnTa.buySellResources")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LinkChips links={guide.links} />
        </CardContent>
      </Card>
    </div>
  );
}

function LinkChips({ links }: { links: TaLink[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((l) => (
        <li key={l.url}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2.5 py-1 text-sm hover:bg-[var(--color-accent)]"
          >
            <span>{l.title}</span>
            <ExternalLink className="h-3.5 w-3.5 text-[var(--color-muted-fg)]" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
