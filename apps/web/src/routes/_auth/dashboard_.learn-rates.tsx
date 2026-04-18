import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RATES_GENERAL_LINKS,
  RATES_GUIDE,
  RATES_TOPICS,
  type RatesLink,
  type RatesTopicKey,
} from "@/lib/rates-guide";
import { pickLang, type Lang } from "@/lib/lang";

export const Route = createFileRoute("/_auth/dashboard_/learn-rates")({
  component: LearnRatesPage,
});

function LearnRatesPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("learnRates.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-muted-fg)]">{t("learnRates.intro")}</p>
          <p className="rounded-md border border-[var(--color-border)] bg-[var(--color-accent)]/40 p-3 text-xs text-[var(--color-muted-fg)]">
            {t("learnRates.disclaimer")}
          </p>
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
              {t("learnRates.generalResources")}
            </div>
            <LinkChips links={RATES_GENERAL_LINKS[lang]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("learnRates.tableOfContents")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {RATES_TOPICS.map((topic) => (
              <li key={topic}>
                <a
                  href={`#${topic}`}
                  className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-sm hover:bg-[var(--color-accent)]"
                >
                  {RATES_GUIDE[lang][topic].label}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {RATES_TOPICS.map((topic) => (
        <RatesSection key={topic} topic={topic} lang={lang} />
      ))}
    </div>
  );
}

function RatesSection({ topic, lang }: { topic: RatesTopicKey; lang: Lang }) {
  const { t } = useTranslation();
  const entry = RATES_GUIDE[lang][topic];
  return (
    <Card id={topic} className="scroll-mt-4">
      <CardHeader>
        <CardTitle>{entry.label}</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{entry.summary}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Block label={t("learnRates.howToRead")} text={entry.howToRead} />
        <Block label={t("learnRates.whatItMeans")} text={entry.whatItMeans} />
        <Block label={t("learnRates.investorAction")} text={entry.investorAction} />
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
            {t("learnRates.furtherReading")}
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

function LinkChips({ links }: { links: RatesLink[] }) {
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
