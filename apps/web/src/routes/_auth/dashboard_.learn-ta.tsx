import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KINDS, kindDescription, kindLabel, type IndicatorKind } from "@/lib/indicator-defaults";
import { TA_GENERAL_LINKS, TA_GUIDE, type TaLink } from "@/lib/ta-guide";

export const Route = createFileRoute("/_auth/dashboard_/learn-ta")({
  component: LearnTAPage,
});

function LearnTAPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("learnTa.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-muted-fg)]">{t("learnTa.intro")}</p>
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
              {t("learnTa.generalResources")}
            </div>
            <LinkChips links={TA_GENERAL_LINKS} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("learnTa.tableOfContents")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {KINDS.map((kind) => (
              <li key={kind}>
                <a
                  href={`#${kind}`}
                  className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-sm hover:bg-[var(--color-accent)]"
                >
                  {kindLabel(kind)}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {KINDS.map((kind) => (
        <IndicatorSection key={kind} kind={kind} />
      ))}
    </div>
  );
}

function IndicatorSection({ kind }: { kind: IndicatorKind }) {
  const { t } = useTranslation();
  const entry = TA_GUIDE[kind];
  return (
    <Card id={kind} className="scroll-mt-4">
      <CardHeader>
        <CardTitle>{kindLabel(kind)}</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{kindDescription(kind)}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Block label={t("learnTa.whenToUse")} text={entry.when} />
        <Block label={t("learnTa.howToUse")} text={entry.how} />
        <Block label={t("learnTa.howToAnalyse")} text={entry.analyse} />
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
            {t("learnTa.furtherReading")}
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
      <p className="text-sm leading-relaxed">{text}</p>
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
