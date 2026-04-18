import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FEES_GENERAL_LINKS,
  FEES_GUIDE,
  FEE_TOPICS,
  type FeeLink,
  type FeeTopicKey,
} from "@/lib/fees-guide";
import { pickLang, type Lang } from "@/lib/lang";

export const Route = createFileRoute("/_auth/dashboard_/learn-fees")({
  component: LearnFeesPage,
});

function LearnFeesPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("learnFees.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-muted-fg)]">{t("learnFees.intro")}</p>
          <p className="rounded-md border border-[var(--color-border)] bg-[var(--color-accent)]/40 p-3 text-xs text-[var(--color-muted-fg)]">
            {t("learnFees.disclaimer")}
          </p>
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
              {t("learnFees.generalResources")}
            </div>
            <LinkChips links={FEES_GENERAL_LINKS[lang]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("learnFees.tableOfContents")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {FEE_TOPICS.map((topic) => (
              <li key={topic}>
                <a
                  href={`#${topic}`}
                  className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-sm hover:bg-[var(--color-accent)]"
                >
                  {FEES_GUIDE[lang][topic].label}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {FEE_TOPICS.map((topic) => (
        <FeeSection key={topic} topic={topic} lang={lang} />
      ))}
    </div>
  );
}

function FeeSection({ topic, lang }: { topic: FeeTopicKey; lang: Lang }) {
  const { t } = useTranslation();
  const entry = FEES_GUIDE[lang][topic];
  return (
    <Card id={topic} className="scroll-mt-4">
      <CardHeader>
        <CardTitle>{entry.label}</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{entry.summary}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Block label={t("learnFees.howItWorks")} text={entry.howItWorks} />
        <Block label={t("learnFees.typicalCost")} text={entry.typicalCost} />
        <Block label={t("learnFees.howToMinimize")} text={entry.howToMinimize} />
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
            {t("learnFees.furtherReading")}
          </div>
          <LinkChips links={entry.links} />
        </div>
      </CardContent>
    </Card>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
        {label}
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function LinkChips({ links }: { links: FeeLink[] }) {
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
