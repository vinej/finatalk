import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STRATEGY_GENERAL_LINKS,
  STRATEGY_GUIDE,
  STRATEGY_KINDS,
  type StrategyKind,
  type StrategyLink,
} from "@/lib/strategy-guide";
import { pickLang, type Lang } from "@/lib/lang";

export const Route = createFileRoute("/_auth/dashboard_/strategies")({
  component: StrategiesPage,
});

function StrategiesPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("learnStrategies.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-muted-fg)]">{t("learnStrategies.intro")}</p>
          <p className="rounded-md border border-[var(--color-border)] bg-[var(--color-accent)]/40 p-3 text-xs text-[var(--color-muted-fg)]">
            {t("learnStrategies.disclaimer")}
          </p>
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
              {t("learnStrategies.generalResources")}
            </div>
            <LinkChips links={STRATEGY_GENERAL_LINKS[lang]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("learnStrategies.tableOfContents")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {STRATEGY_KINDS.map((kind) => (
              <li key={kind}>
                <a
                  href={`#${kind}`}
                  className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-sm hover:bg-[var(--color-accent)]"
                >
                  {STRATEGY_GUIDE[lang][kind].label}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {STRATEGY_KINDS.map((kind) => (
        <StrategySection key={kind} kind={kind} lang={lang} />
      ))}
    </div>
  );
}

function StrategySection({ kind, lang }: { kind: StrategyKind; lang: Lang }) {
  const { t } = useTranslation();
  const entry = STRATEGY_GUIDE[lang][kind];
  return (
    <Card id={kind} className="scroll-mt-4">
      <CardHeader>
        <CardTitle>{entry.label}</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{entry.summary}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Block label={t("learnStrategies.description")} text={entry.description} />
        <Block label={t("learnStrategies.whenToUse")} text={entry.whenToUse} />
        <Block label={t("learnStrategies.prosAndCons")} text={entry.prosAndCons} />
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
            {t("learnStrategies.furtherReading")}
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

function LinkChips({ links }: { links: StrategyLink[] }) {
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
