import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LinkChips } from "@/components/learn/link-chips";
import { TopicMenu } from "@/components/learn/topic-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INVESTMENT_GENERAL_LINKS,
  INVESTMENT_GUIDE,
  INVESTMENT_KINDS,
  type InvestmentKind,
} from "@/lib/investment-guide";
import { pickLang, type Lang } from "@/lib/lang";

export const Route = createFileRoute("/_auth/dashboard_/learn-investment")({
  component: LearnInvestmentPage,
});

function LearnInvestmentPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const [activeKind, setActiveKind] = useState<InvestmentKind>(INVESTMENT_KINDS[0]);
  const [introOpen, setIntroOpen] = useState(true);
  const menuItems = useMemo(
    () => INVESTMENT_KINDS.map((k) => ({ key: k, label: INVESTMENT_GUIDE[lang][k].label })),
    [lang],
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="shrink-0">
        <CardHeader className="cursor-pointer select-none" onClick={() => setIntroOpen((o) => !o)}>
          <div className="flex items-center gap-2">
            {introOpen ? (
              <ChevronDown className="h-5 w-5 shrink-0 text-[var(--color-muted-fg)]" aria-hidden />
            ) : (
              <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-muted-fg)]" aria-hidden />
            )}
            <CardTitle>{t("learnInvestment.title")}</CardTitle>
          </div>
        </CardHeader>
        {introOpen && (
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
        )}
      </Card>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[240px_1fr]">
        <TopicMenu
          title={t("learnInvestment.tableOfContents")}
          items={menuItems}
          activeKey={activeKind}
          onSelect={setActiveKind}
        />
        <InvestmentPanel kind={activeKind} lang={lang} />
      </div>
    </div>
  );
}

function InvestmentPanel({ kind, lang }: { kind: InvestmentKind; lang: Lang }) {
  const { t } = useTranslation();
  const entry = INVESTMENT_GUIDE[lang][kind];
  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle>{entry.label}</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{entry.summary}</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
        <Block label={t("learnInvestment.characteristics")} text={entry.characteristics} />
        <Block label={t("learnInvestment.whenToBuy")} text={entry.whenToBuy} />
        <Block label={t("learnInvestment.whyBuy")} text={entry.whyBuy} />
        <Block label={t("learnInvestment.howToBuy")} text={entry.howToBuy} />
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
