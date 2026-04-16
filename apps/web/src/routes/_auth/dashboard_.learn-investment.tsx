import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INVESTMENT_GENERAL_LINKS,
  INVESTMENT_GUIDE,
  INVESTMENT_KINDS,
  type InvLink,
  type InvestmentKind,
} from "@/lib/investment-guide";
import { pickLang, type Lang } from "@/lib/lang";

export const Route = createFileRoute("/_auth/dashboard_/learn-investment")({
  component: LearnInvestmentPage,
});

function LearnInvestmentPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("learnInvestment.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-muted-fg)]">{t("learnInvestment.intro")}</p>
          <p className="rounded-md border border-[var(--color-border)] bg-[var(--color-accent)]/40 p-3 text-xs text-[var(--color-muted-fg)]">
            {t("learnInvestment.disclaimer")}
          </p>
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
              {t("learnInvestment.generalResources")}
            </div>
            <LinkChips links={INVESTMENT_GENERAL_LINKS[lang]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("learnInvestment.tableOfContents")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {INVESTMENT_KINDS.map((kind) => (
              <li key={kind}>
                <a
                  href={`#${kind}`}
                  className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-sm hover:bg-[var(--color-accent)]"
                >
                  {INVESTMENT_GUIDE[lang][kind].label}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {INVESTMENT_KINDS.map((kind) => (
        <InvestmentSection key={kind} kind={kind} lang={lang} />
      ))}
    </div>
  );
}

function InvestmentSection({ kind, lang }: { kind: InvestmentKind; lang: Lang }) {
  const { t } = useTranslation();
  const entry = INVESTMENT_GUIDE[lang][kind];
  return (
    <Card id={kind} className="scroll-mt-4">
      <CardHeader>
        <CardTitle>{entry.label}</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{entry.summary}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Block label={t("learnInvestment.characteristics")} text={entry.characteristics} />
        <Block label={t("learnInvestment.whenToBuy")} text={entry.whenToBuy} />
        <Block label={t("learnInvestment.whyBuy")} text={entry.whyBuy} />
        <Block label={t("learnInvestment.profitsQuebec")} text={entry.profitsQuebec} />
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
            {t("learnInvestment.furtherReading")}
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

function LinkChips({ links }: { links: InvLink[] }) {
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
