import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Markdown } from "@/components/ai/markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUY_SELL_GUIDE } from "@/lib/buy-sell-guide";
import { KINDS, kindDescription, kindFullName, kindLabel, type IndicatorKind } from "@/lib/indicator-defaults";
import { pickLang, type Lang } from "@/lib/lang";
import { TA_GENERAL_LINKS, TA_GUIDE, type TaLink } from "@/lib/ta-guide";

export const Route = createFileRoute("/_auth/dashboard_/learn-ta")({
  component: LearnTAPage,
});

const CORE_KINDS: ReadonlySet<IndicatorKind> = new Set<IndicatorKind>([
  "ema",
  "rsi",
  "macd",
  "bbands",
  "atr",
  "adx",
  "obv",
  "vwap",
]);

type LearnTaKey = "palette" | IndicatorKind;

function LearnTAPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const sortedKinds = useMemo(
    () =>
      [...KINDS].sort((a, b) =>
        kindLabel(a).localeCompare(kindLabel(b), lang, { sensitivity: "base" }),
      ),
    [lang],
  );
  const [active, setActive] = useState<LearnTaKey>("palette");
  const [introOpen, setIntroOpen] = useState(true);

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
            <CardTitle>{t("learnTa.title")}</CardTitle>
          </div>
        </CardHeader>
        {introOpen && (
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-[var(--color-muted-fg)]">{t("learnTa.intro")}</p>
            <div>
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
                {t("learnTa.generalResources")}
              </div>
              <LinkChips links={TA_GENERAL_LINKS[lang]} />
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[240px_1fr]">
        <IndicatorMenu
          kinds={sortedKinds}
          active={active}
          onSelect={setActive}
          lang={lang}
        />
        {active === "palette" ? (
          <PalettePanel lang={lang} />
        ) : (
          <IndicatorPanel kind={active} lang={lang} />
        )}
      </div>
    </div>
  );
}

function IndicatorMenu({
  kinds,
  active,
  onSelect,
  lang,
}: {
  kinds: IndicatorKind[];
  active: LearnTaKey;
  onSelect: (k: LearnTaKey) => void;
  lang: Lang;
}) {
  const { t } = useTranslation();
  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle className="text-base">{t("learnTa.indicators")}</CardTitle>
        <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted-fg)]">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-primary)]" aria-hidden />
          {t("learnTa.coreLegend")}
        </p>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto">
        <ul className="flex flex-col gap-1">
          <li>
            <button
              type="button"
              onClick={() => onSelect("palette")}
              className={`w-full rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                active === "palette"
                  ? "border-[var(--color-border)] bg-[var(--color-accent)] font-medium"
                  : "border-transparent hover:bg-[var(--color-accent)]/60"
              }`}
            >
              <span className="block">{t("learnTa.paletteTitle")}</span>
              <span className="block text-xs font-normal text-[var(--color-muted-fg)]">
                {t("learnTa.paletteSummary")}
              </span>
            </button>
          </li>
          {kinds.map((kind) => {
            const isActive = active === kind;
            const isCore = CORE_KINDS.has(kind);
            return (
              <li key={kind}>
                <button
                  type="button"
                  onClick={() => onSelect(kind)}
                  className={`w-full rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                    isActive
                      ? "border-[var(--color-border)] bg-[var(--color-accent)] font-medium"
                      : "border-transparent hover:bg-[var(--color-accent)]/60"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`block ${isCore ? "font-semibold text-[var(--color-primary)]" : ""}`}>
                      {kindLabel(kind)}
                    </span>
                    {isCore && (
                      <span className="rounded-full bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-primary)]">
                        {t("learnTa.coreLabel")}
                      </span>
                    )}
                  </span>
                  <span
                    className={`block text-xs font-normal ${
                      isCore ? "text-[var(--color-primary)]/80" : "text-[var(--color-muted-fg)]"
                    }`}
                  >
                    {kindFullName(kind, lang)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function PalettePanel({ lang }: { lang: Lang }) {
  const { t } = useTranslation();
  const section = BUY_SELL_GUIDE[lang].sections.find((s) => s.id === "palette");
  const coreList = useMemo(
    () =>
      [...CORE_KINDS].sort((a, b) =>
        kindLabel(a).localeCompare(kindLabel(b), lang, { sensitivity: "base" }),
      ),
    [lang],
  );
  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle>{t("learnTa.paletteTitle")}</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{t("learnTa.paletteSummary")}</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-primary)]">
            {t("learnTa.coreIndicators")}
          </div>
          <p className="mb-3 text-sm text-[var(--color-muted-fg)]">
            {t("learnTa.coreIndicatorsIntro")}
          </p>
          <ul className="flex flex-col gap-2.5">
            {coreList.map((kind) => (
              <li
                key={kind}
                className="rounded-md border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-3"
              >
                <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold text-[var(--color-primary)]">
                    {kindLabel(kind)}
                  </span>
                  <span className="text-sm text-[var(--color-muted-fg)]">
                    {kindFullName(kind, lang)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{kindDescription(kind, lang)}</p>
              </li>
            ))}
          </ul>
        </div>
        {section ? (
          <Markdown>{section.body}</Markdown>
        ) : (
          <p className="text-sm text-[var(--color-muted-fg)]">—</p>
        )}
      </CardContent>
    </Card>
  );
}

function IndicatorPanel({ kind, lang }: { kind: IndicatorKind; lang: Lang }) {
  const { t } = useTranslation();
  const entry = TA_GUIDE[lang][kind];
  return (
    <Card className="flex max-h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle>{kindLabel(kind)} ({kindFullName(kind, lang)})</CardTitle>
        <p className="text-sm text-[var(--color-muted-fg)]">{kindDescription(kind, lang)}</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
        <Block label={t("learnTa.whenToUse")} text={entry.when} />
        <Block label={t("learnTa.howToUse")} text={entry.how} />
        <Block label={t("learnTa.howToAnalyze")} text={entry.analyse} />
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
      <p className="whitespace-pre-line text-sm leading-relaxed">{text}</p>
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
