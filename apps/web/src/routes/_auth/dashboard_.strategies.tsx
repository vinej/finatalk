import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STRATEGY_GENERAL_LINKS,
  STRATEGY_GROUP_ORDER,
  STRATEGY_GROUPS,
  STRATEGY_GUIDE,
  STRATEGY_KINDS,
  type StrategyEntry,
  type StrategyKind,
  type StrategyLink,
} from "@/lib/strategy-guide";
import { pickLang, type Lang } from "@/lib/lang";

const strategiesSearchSchema = z.object({
  group: z.enum(["longTerm", "swing", "intraday"]).optional(),
  kind: z.enum(STRATEGY_KINDS).optional(),
});

export const Route = createFileRoute("/_auth/dashboard_/strategies")({
  component: StrategiesPage,
  validateSearch: strategiesSearchSchema,
});

type TabKey = "overview" | "steps";

function StrategiesPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const search = Route.useSearch();
  const initialKind: StrategyKind =
    search.kind ?? (search.group ? STRATEGY_GROUPS[search.group][0] : STRATEGY_KINDS[0]);
  const [activeKind, setActiveKind] = useState<StrategyKind>(initialKind);
  const [tab, setTab] = useState<TabKey>("overview");
  const [introOpen, setIntroOpen] = useState(true);

  useEffect(() => {
    if (search.kind) {
      setActiveKind(search.kind);
    } else if (search.group) {
      setActiveKind(STRATEGY_GROUPS[search.group][0]);
    }
  }, [search.kind, search.group]);

  const entry = STRATEGY_GUIDE[lang][activeKind];

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
            <CardTitle>{t("learnStrategies.title")}</CardTitle>
          </div>
        </CardHeader>
        {introOpen && (
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
        )}
      </Card>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[240px_1fr]">
        <StrategyMenu
          activeKind={activeKind}
          onSelect={(k) => {
            setActiveKind(k);
            setTab("overview");
          }}
          lang={lang}
        />
        <StrategyPanel entry={entry} tab={tab} onTabChange={setTab} />
      </div>
    </div>
  );
}

function StrategyMenu({
  activeKind,
  onSelect,
  lang,
}: {
  activeKind: StrategyKind;
  onSelect: (k: StrategyKind) => void;
  lang: Lang;
}) {
  const { t } = useTranslation();
  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base">{t("learnStrategies.tableOfContents")}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto">
        <div className="flex flex-col gap-3">
          {STRATEGY_GROUP_ORDER.map((group) => (
            <div key={group}>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-fg)]">
                {t(`learnStrategies.group.${group}` as const)}
              </div>
              <ul className="flex flex-col gap-1">
                {STRATEGY_GROUPS[group].map((kind) => {
                  const active = kind === activeKind;
                  return (
                    <li key={kind}>
                      <button
                        type="button"
                        onClick={() => onSelect(kind)}
                        className={`w-full rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                          active
                            ? "border-[var(--color-border)] bg-[var(--color-accent)] font-medium"
                            : "border-transparent hover:bg-[var(--color-accent)]/60"
                        }`}
                      >
                        {STRATEGY_GUIDE[lang][kind].label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StrategyPanel({
  entry,
  tab,
  onTabChange,
}: {
  entry: StrategyEntry;
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
}) {
  const { t } = useTranslation();
  const hasSteps =
    !!entry.coreIdea || (entry.steps && entry.steps.length > 0) || !!entry.whyItWorks;

  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle>{entry.label}</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{entry.summary}</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
        <div
          role="tablist"
          className="flex gap-1 border-b border-[var(--color-border)]"
        >
          <TabButton
            active={tab === "overview"}
            onClick={() => onTabChange("overview")}
            label={t("learnStrategies.tabOverview")}
          />
          {hasSteps && (
            <TabButton
              active={tab === "steps"}
              onClick={() => onTabChange("steps")}
              label={t("learnStrategies.tabSteps")}
            />
          )}
        </div>

        {tab === "overview" || !hasSteps ? (
          <OverviewTab entry={entry} />
        ) : (
          <StepsTab entry={entry} />
        )}
      </CardContent>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px rounded-t-md border-b-2 px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-[var(--color-fg)] font-medium"
          : "border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
      }`}
    >
      {label}
    </button>
  );
}

function OverviewTab({ entry }: { entry: StrategyEntry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <Block label={t("learnStrategies.description")} text={entry.description} />
      <Block label={t("learnStrategies.whenToUse")} text={entry.whenToUse} />
      <Block label={t("learnStrategies.prosAndCons")} text={entry.prosAndCons} />
      <div>
        <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
          {t("learnStrategies.furtherReading")}
        </div>
        <LinkChips links={entry.links} />
      </div>
    </div>
  );
}

function StepsTab({ entry }: { entry: StrategyEntry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      {entry.coreIdea && (
        <Block label={t("learnStrategies.coreIdea")} text={entry.coreIdea} />
      )}
      {entry.indicatorsUsed && entry.indicatorsUsed.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
            {t("learnStrategies.indicatorsUsed")}
          </div>
          <ul className="flex flex-wrap gap-2">
            {entry.indicatorsUsed.map((ind) => (
              <li
                key={ind}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-accent)]/30 px-2.5 py-1 text-sm"
              >
                {ind}
              </li>
            ))}
          </ul>
        </div>
      )}
      {entry.steps && entry.steps.length > 0 && (
        <ol className="flex flex-col gap-3">
          {entry.steps.map((step, idx) => (
            <li
              key={idx}
              className="rounded-md border border-[var(--color-border)] p-3"
            >
              <div className="mb-1 text-sm font-medium">{step.title}</div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-muted-fg)]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      )}
      {entry.whyItWorks && (
        <Block label={t("learnStrategies.whyItWorks")} text={entry.whyItWorks} />
      )}
    </div>
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
