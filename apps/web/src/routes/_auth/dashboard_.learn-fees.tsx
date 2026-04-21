import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LinkChips } from "@/components/learn/link-chips";
import { TopicMenu } from "@/components/learn/topic-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import {
  FEES_GENERAL_LINKS,
  FEES_GUIDE,
  FEE_TOPICS,
  type FeeTopicKey,
} from "@/lib/fees-guide";
import { pickLang, type Lang } from "@/lib/lang";

export const Route = createFileRoute("/_auth/dashboard_/learn-fees")({
  component: LearnFeesPage,
});

function LearnFeesPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const [activeTopic, setActiveTopic] = useState<FeeTopicKey>(FEE_TOPICS[0]);
  const menuItems = useMemo(
    () => FEE_TOPICS.map((k) => ({ key: k, label: FEES_GUIDE[lang][k].label })),
    [lang],
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <CollapsibleCard title={t("learnFees.title")}>
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
      </CollapsibleCard>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[240px_1fr]">
        <TopicMenu
          title={t("learnFees.tableOfContents")}
          items={menuItems}
          activeKey={activeTopic}
          onSelect={setActiveTopic}
        />
        <FeePanel topic={activeTopic} lang={lang} />
      </div>
    </div>
  );
}

function FeePanel({ topic, lang }: { topic: FeeTopicKey; lang: Lang }) {
  const { t } = useTranslation();
  const entry = FEES_GUIDE[lang][topic];
  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle>{entry.label}</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{entry.summary}</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
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
