import { Link } from "@tanstack/react-router";
import { Bell, BellOff, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STRATEGY_GUIDE, type StrategyKind } from "@/lib/strategy-guide";
import { trpc } from "@/lib/trpc";
import {
  thresholdKind,
  type AlertConditionType,
  type AlertIndicatorParams,
} from "@finatalk/trpc/constants/alerts";

type AlertSource = "manual" | "strategy_symbol" | "strategy_portfolio";
type AssetTypeKey = "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index";

function formatParams(params: AlertIndicatorParams | null | undefined): string {
  if (!params) return "";
  const parts: string[] = [];
  if (params.fast != null) parts.push(`fast=${params.fast}`);
  if (params.slow != null) parts.push(`slow=${params.slow}`);
  if (params.signal != null) parts.push(`signal=${params.signal}`);
  if (params.period != null) parts.push(`period=${params.period}`);
  if (params.stdDev != null) parts.push(`σ=${params.stdDev}`);
  if (params.lookback != null) parts.push(`lookback=${params.lookback}`);
  return parts.join(", ");
}

function formatThresholdValue(ct: AlertConditionType, v: number): string {
  const kind = thresholdKind(ct);
  if (kind === "none") return "";
  const n = v.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (kind === "pct") return `${n}%`;
  if (kind === "multiplier") return `${n}×`;
  return n;
}

export type AlertListItem = {
  id: string;
  symbol: string;
  conditionType: string;
  threshold: number;
  indicatorParams: AlertIndicatorParams | null;
  source: AlertSource;
  assetType: string | null;
  strategyKind: string | null;
  portfolioId: string | null;
  enabled: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
};

type SubGroup = {
  key: string;
  label: string;
  alerts: AlertListItem[];
};

const ASSET_TYPE_ORDER: AssetTypeKey[] = ["stock", "etf", "mutualfund", "commodity", "crypto", "index"];

export function AlertsList({
  alerts,
  lang,
  portfolioTitleMap,
}: {
  alerts: AlertListItem[];
  lang: "en" | "fr";
  portfolioTitleMap: Map<string, string>;
}) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const toggleOne = trpc.alert.toggle.useMutation({
    onSuccess: () => void utils.alert.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const deleteOne = trpc.alert.delete.useMutation({
    onSuccess: () => {
      void utils.alert.list.invalidate();
      toast.success(t("alerts.deleted"));
    },
    onError: (e) => toast.error(e.message),
  });
  const toggleMany = trpc.alert.toggleMany.useMutation({
    onSuccess: () => void utils.alert.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const deleteMany = trpc.alert.deleteMany.useMutation({
    onSuccess: (data) => {
      void utils.alert.list.invalidate();
      toast.success(t("alerts.deletedMany", { count: data.count }));
    },
    onError: (e) => toast.error(e.message),
  });

  // Partition alerts by source
  const { manualSubs, strategySymbolSubs, strategyPortfolioSubs } = useMemo(() => {
    const manualMap = new Map<string, AlertListItem[]>();
    const stratSymMap = new Map<string, AlertListItem[]>();
    const stratPfMap = new Map<string, AlertListItem[]>();
    for (const a of alerts) {
      if (a.source === "manual") {
        const key = a.assetType ?? "other";
        (manualMap.get(key) ?? manualMap.set(key, []).get(key)!).push(a);
      } else if (a.source === "strategy_symbol") {
        const key = `${a.symbol}::${a.strategyKind ?? ""}`;
        (stratSymMap.get(key) ?? stratSymMap.set(key, []).get(key)!).push(a);
      } else if (a.source === "strategy_portfolio") {
        const key = `${a.portfolioId ?? ""}::${a.strategyKind ?? ""}`;
        (stratPfMap.get(key) ?? stratPfMap.set(key, []).get(key)!).push(a);
      }
    }

    const assetLabel = (k: string) => {
      if (k === "stock") return t("analysis.assetStock");
      if (k === "etf") return t("analysis.assetEtf");
      if (k === "mutualfund") return t("analysis.assetMutualFund");
      if (k === "commodity") return t("analysis.assetCommodity");
      if (k === "crypto") return t("analysis.assetCrypto");
      if (k === "index") return t("analysis.assetIndex");
      return t("alerts.group.unclassified");
    };

    const manualSubs: SubGroup[] = [...manualMap.keys()]
      .sort((a, b) => {
        const ia = ASSET_TYPE_ORDER.indexOf(a as AssetTypeKey);
        const ib = ASSET_TYPE_ORDER.indexOf(b as AssetTypeKey);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      })
      .map((k) => ({ key: k, label: assetLabel(k), alerts: manualMap.get(k)! }));

    const stratLabel = (k: StrategyKind | null | undefined) =>
      k && STRATEGY_GUIDE[lang][k as StrategyKind] ? STRATEGY_GUIDE[lang][k as StrategyKind].label : String(k ?? "");

    const strategySymbolSubs: SubGroup[] = [...stratSymMap.entries()]
      .map(([key, list]) => {
        const first = list[0]!;
        return {
          key,
          label: `${first.symbol} · ${stratLabel(first.strategyKind as StrategyKind | null)}`,
          alerts: list,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    const strategyPortfolioSubs: SubGroup[] = [...stratPfMap.entries()]
      .map(([key, list]) => {
        const first = list[0]!;
        const pfTitle = portfolioTitleMap.get(first.portfolioId ?? "") ?? t("alerts.group.deletedPortfolio");
        return {
          key,
          label: `${pfTitle} · ${stratLabel(first.strategyKind as StrategyKind | null)}`,
          alerts: list,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    return { manualSubs, strategySymbolSubs, strategyPortfolioSubs };
  }, [alerts, lang, portfolioTitleMap, t]);

  async function onToggleSubGroup(sub: SubGroup, nextEnabled: boolean) {
    await toggleMany.mutateAsync({ ids: sub.alerts.map((a) => a.id), enabled: nextEnabled });
  }
  async function onDeleteSubGroup(sub: SubGroup) {
    if (!confirm(t("alerts.confirmDeleteGroup", { count: sub.alerts.length }))) return;
    await deleteMany.mutateAsync({ ids: sub.alerts.map((a) => a.id) });
  }

  const total = alerts.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">{t("alerts.list")}</CardTitle>
        <span className="text-[10px] text-[var(--color-muted-fg)]">{t("alerts.totalCount", { count: total })}</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <p className="py-4 text-center text-xs text-[var(--color-muted-fg)]">{t("alerts.empty")}</p>
        ) : (
          <>
            <AlertGroup
              title={t("alerts.group.manual")}
              subGroups={manualSubs}
              allowIndividualActions
              onToggleSubGroup={onToggleSubGroup}
              onDeleteSubGroup={onDeleteSubGroup}
              onToggleOne={(id, enabled) => toggleOne.mutate({ id, enabled })}
              onDeleteOne={(id) => {
                if (!confirm(t("alerts.confirmDelete"))) return;
                deleteOne.mutate({ id });
              }}
            />
            <AlertGroup
              title={t("alerts.group.strategySymbol")}
              subGroups={strategySymbolSubs}
              allowIndividualActions={false}
              onToggleSubGroup={onToggleSubGroup}
              onDeleteSubGroup={onDeleteSubGroup}
              onToggleOne={() => {}}
              onDeleteOne={() => {}}
            />
            <AlertGroup
              title={t("alerts.group.strategyPortfolio")}
              subGroups={strategyPortfolioSubs}
              allowIndividualActions={false}
              onToggleSubGroup={onToggleSubGroup}
              onDeleteSubGroup={onDeleteSubGroup}
              onToggleOne={() => {}}
              onDeleteOne={() => {}}
            />
          </>
        )}
        <p className="mt-3 text-[10px] text-[var(--color-muted-fg)]">{t("alerts.cooldownHint")}</p>
      </CardContent>
    </Card>
  );
}

function AlertGroup({
  title,
  subGroups,
  allowIndividualActions,
  onToggleSubGroup,
  onDeleteSubGroup,
  onToggleOne,
  onDeleteOne,
}: {
  title: string;
  subGroups: SubGroup[];
  allowIndividualActions: boolean;
  onToggleSubGroup: (sub: SubGroup, nextEnabled: boolean) => void;
  onDeleteSubGroup: (sub: SubGroup) => void;
  onToggleOne: (id: string, enabled: boolean) => void;
  onDeleteOne: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(true);
  const total = subGroups.reduce((acc, s) => acc + s.alerts.length, 0);
  return (
    <div className="rounded border border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-[var(--color-muted)]/50"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <span>{title}</span>
        <span className="ml-auto text-[10px] text-[var(--color-muted-fg)]">
          {t("alerts.totalCount", { count: total })}
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--color-border)] pl-6">
          {subGroups.length === 0 ? (
            <p className="px-3 py-3 text-center text-[10px] text-[var(--color-muted-fg)]">
              {t("alerts.group.emptyGroup")}
            </p>
          ) : (
            subGroups.map((sub) => (
              <SubGroupBlock
                key={sub.key}
                sub={sub}
                allowIndividualActions={allowIndividualActions}
                onToggle={(next) => onToggleSubGroup(sub, next)}
                onDelete={() => onDeleteSubGroup(sub)}
                onToggleOne={onToggleOne}
                onDeleteOne={onDeleteOne}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SubGroupBlock({
  sub,
  allowIndividualActions,
  onToggle,
  onDelete,
  onToggleOne,
  onDeleteOne,
}: {
  sub: SubGroup;
  allowIndividualActions: boolean;
  onToggle: (next: boolean) => void;
  onDelete: () => void;
  onToggleOne: (id: string, enabled: boolean) => void;
  onDeleteOne: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(true);
  const allEnabled = sub.alerts.every((a) => a.enabled);
  const anyEnabled = sub.alerts.some((a) => a.enabled);
  const nextEnabled = !anyEnabled; // if any disabled, enable all; else disable all
  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <div className="flex items-center gap-2 bg-[var(--color-muted)]/30 px-3 py-1.5 text-sm">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-[var(--color-fg)] hover:underline"
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <span className="font-medium">{sub.label}</span>
        </button>
        <span className="text-[10px] text-[var(--color-muted-fg)]">
          {t("alerts.totalCount", { count: sub.alerts.length })}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title={anyEnabled ? t("alerts.disableGroup") : t("alerts.enableGroup")}
            onClick={() => onToggle(nextEnabled)}
          >
            {allEnabled ? (
              <Bell className="h-3.5 w-3.5" />
            ) : (
              <BellOff className="h-3.5 w-3.5 text-[var(--color-muted-fg)]" />
            )}
          </Button>
          <Button size="sm" variant="ghost" title={t("alerts.deleteGroup")} onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {open && (
        <div className="space-y-1 px-3 py-2">
          {sub.alerts.map((a) => (
            <AlertRow
              key={a.id}
              alert={a}
              allowIndividualActions={allowIndividualActions}
              onToggleOne={onToggleOne}
              onDeleteOne={onDeleteOne}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert: a,
  allowIndividualActions,
  onToggleOne,
  onDeleteOne,
}: {
  alert: AlertListItem;
  allowIndividualActions: boolean;
  onToggleOne: (id: string, enabled: boolean) => void;
  onDeleteOne: (id: string) => void;
}) {
  const { t } = useTranslation();
  const ct = a.conditionType as AlertConditionType;
  const paramsText = formatParams(a.indicatorParams);
  const thrText = formatThresholdValue(ct, a.threshold);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-border)] px-3 py-1.5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/dashboard/analysis"
          search={{ symbol: a.symbol }}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          {a.symbol}
        </Link>
        <span className="text-xs text-[var(--color-muted-fg)]">
          {t(`alerts.conditionType.${ct}`, { defaultValue: ct })}
          {paramsText && ` · ${paramsText}`}
          {thrText && ` · ${thrText}`}
        </span>
        {a.triggeredAt && (
          <span
            className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            title={new Date(a.triggeredAt).toLocaleString()}
          >
            {t("alerts.triggered")}
          </span>
        )}
        {!a.enabled && (
          <span className="rounded bg-[var(--color-muted)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted-fg)]">
            {t("alerts.disable")}
          </span>
        )}
      </div>
      {allowIndividualActions && (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title={a.enabled ? t("alerts.disable") : t("alerts.enable")}
            onClick={() => onToggleOne(a.id, !a.enabled)}
          >
            {a.enabled ? (
              <Bell className="h-3.5 w-3.5" />
            ) : (
              <BellOff className="h-3.5 w-3.5 text-[var(--color-muted-fg)]" />
            )}
          </Button>
          <Button size="sm" variant="ghost" title={t("alerts.delete")} onClick={() => onDeleteOne(a.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
