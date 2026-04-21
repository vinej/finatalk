import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Markdown } from "@/components/ai/markdown";
import { LinkChips } from "@/components/learn/link-chips";
import { TopicMenu } from "@/components/learn/topic-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { BUY_SELL_GUIDE, type BuySellSection } from "@/lib/buy-sell-guide";
import { pickLang } from "@/lib/lang";
import type { TaLink } from "@/lib/ta-guide";

export const Route = createFileRoute("/_auth/dashboard_/learn-buy-sell")({
  component: LearnBuySellPage,
});

function LearnBuySellPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const guide = BUY_SELL_GUIDE[lang];
  const [activeId, setActiveId] = useState<string>(guide.sections[0]?.id ?? "");

  const activeSection =
    guide.sections.find((s) => s.id === activeId) ?? guide.sections[0];
  const menuItems = useMemo(
    () => guide.sections.map((s) => ({ key: s.id, label: s.title })),
    [guide.sections],
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <CollapsibleCard
        title={t("learnTa.buySellTitle")}
        subtitle={t("learnTa.buySellSubtitle")}
      >
        <Markdown>{guide.intro}</Markdown>
      </CollapsibleCard>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[240px_1fr]">
        <TopicMenu
          title={t("learnTa.tableOfContents")}
          items={menuItems}
          activeKey={activeSection?.id ?? ""}
          onSelect={setActiveId}
        />
        <BuySellPanel section={activeSection} links={guide.links} />
      </div>
    </div>
  );
}

function BuySellPanel({
  section,
  links,
}: {
  section: BuySellSection | undefined;
  links: TaLink[];
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
