import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ai/markdown";
import { pickLang, type Lang } from "@/lib/lang";
import { BUY_SELL_GUIDE, type BuySellSection } from "@/lib/buy-sell-guide";
import type { TaLink } from "@/lib/ta-guide";

export const Route = createFileRoute("/_auth/dashboard_/learn-buy-sell")({
  component: LearnBuySellPage,
});

function LearnBuySellPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const guide = BUY_SELL_GUIDE[lang];
  const [activeId, setActiveId] = useState<string>(guide.sections[0]?.id ?? "");
  const [introOpen, setIntroOpen] = useState(true);

  const activeSection =
    guide.sections.find((s) => s.id === activeId) ?? guide.sections[0];

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="shrink-0">
        <CardHeader className="cursor-pointer select-none" onClick={() => setIntroOpen((o) => !o)}>
          <div className="flex items-start gap-2">
            {introOpen ? (
              <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-muted-fg)]" aria-hidden />
            ) : (
              <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-muted-fg)]" aria-hidden />
            )}
            <div className="flex flex-col gap-1">
              <CardTitle>{t("learnTa.buySellTitle")}</CardTitle>
              <p className="text-sm text-[var(--color-muted-fg)]">{t("learnTa.buySellSubtitle")}</p>
            </div>
          </div>
        </CardHeader>
        {introOpen && (
          <CardContent>
            <Markdown>{guide.intro}</Markdown>
          </CardContent>
        )}
      </Card>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[240px_1fr]">
        <BuySellMenu
          sections={guide.sections}
          activeId={activeSection?.id ?? ""}
          onSelect={setActiveId}
        />
        <BuySellPanel section={activeSection} links={guide.links} lang={lang} />
      </div>
    </div>
  );
}

function BuySellMenu({
  sections,
  activeId,
  onSelect,
}: {
  sections: BuySellSection[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base">{t("learnTa.tableOfContents")}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto">
        <ul className="flex flex-col gap-1">
          {sections.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={`w-full rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                    active
                      ? "border-[var(--color-border)] bg-[var(--color-accent)] font-medium"
                      : "border-transparent hover:bg-[var(--color-accent)]/60"
                  }`}
                >
                  {s.title}
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function BuySellPanel({
  section,
  links,
  lang: _lang,
}: {
  section: BuySellSection | undefined;
  links: TaLink[];
  lang: Lang;
}) {
  const { t } = useTranslation();
  if (!section) return <Card />;
  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
        <Markdown>{section.body}</Markdown>
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
            {t("learnTa.buySellResources")}
          </div>
          <LinkChips links={links} />
        </div>
      </CardContent>
    </Card>
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
