import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COMMODITIES, COMMODITY_EXCHANGE_BY_CATEGORY } from "@/lib/commodities";
import { CRYPTOS } from "@/lib/crypto";
import { INDICES } from "@/lib/indices";
import { trpc } from "@/lib/trpc";

export type SymbolPickerEntry = {
  symbol: string;
  name: string;
  exchange: string;
  assetType: "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index";
};

export type AssetTypeFilter = "all" | "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index";

type Props = {
  inputId: string;
  listId: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  /** If set, live search is keyed off this instead of `value` (e.g. last token of comma-separated list). */
  searchTerm?: string;
  inputClassName?: string;
  assetTypeFilter: AssetTypeFilter;
  onAssetTypeChange: (v: AssetTypeFilter) => void;
  exchangeFilter: string;
  onExchangeChange: (v: string) => void;
};

export function SymbolPicker({
  inputId,
  listId,
  value,
  onChange,
  placeholder,
  className,
  maxLength,
  searchTerm,
  inputClassName,
  assetTypeFilter,
  onAssetTypeChange,
  exchangeFilter,
  onExchangeChange,
}: Props) {
  const { t } = useTranslation();

  const symbolsQuery = trpc.market.symbols.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const commodityEntries = useMemo<SymbolPickerEntry[]>(
    () =>
      COMMODITIES.map((c) => ({
        symbol: c.symbol,
        name: t(c.nameKey),
        exchange: COMMODITY_EXCHANGE_BY_CATEGORY[c.category],
        assetType: "commodity" as const,
      })),
    [t],
  );

  const cryptoEntries = useMemo<SymbolPickerEntry[]>(
    () =>
      CRYPTOS.map((c) => ({
        symbol: c.symbol,
        name: t(c.nameKey),
        exchange: "CCC",
        assetType: "crypto" as const,
      })),
    [t],
  );

  const indexEntries = useMemo<SymbolPickerEntry[]>(
    () =>
      INDICES.map((i) => ({
        symbol: i.yahooSymbol,
        name: t(i.labelKey),
        exchange: "Index",
        assetType: "index" as const,
      })),
    [t],
  );

  const mergedSymbols = useMemo<SymbolPickerEntry[]>(() => {
    const raw = symbolsQuery.data?.symbols ?? [];
    return [...raw, ...commodityEntries, ...cryptoEntries, ...indexEntries];
  }, [symbolsQuery.data, commodityEntries, cryptoEntries, indexEntries]);

  const availableExchanges = useMemo(() => {
    const set = new Set<string>();
    for (const s of mergedSymbols) if (s.exchange) set.add(s.exchange);
    return [...set].sort();
  }, [mergedSymbols]);

  const liveKey = (searchTerm ?? value).trim();
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    if (liveKey.length < 1) {
      setDebounced("");
      return;
    }
    const h = setTimeout(() => setDebounced(liveKey), 250);
    return () => clearTimeout(h);
  }, [liveKey]);

  const liveSearchQuery = trpc.market.searchSymbols.useQuery(
    { query: debounced, assetType: assetTypeFilter, limit: 20 },
    { enabled: debounced.length >= 1, staleTime: 60_000, retry: false },
  );

  const suggestions = useMemo<SymbolPickerEntry[]>(() => {
    const byType =
      assetTypeFilter === "all"
        ? mergedSymbols
        : mergedSymbols.filter((s) => s.assetType === assetTypeFilter);
    const all = exchangeFilter === "all" ? byType : byType.filter((s) => s.exchange === exchangeFilter);
    const q = liveKey.toUpperCase();
    const liveRaw = liveSearchQuery.data?.symbols ?? [];
    const live = exchangeFilter === "all" ? liveRaw : liveRaw.filter((s) => s.exchange === exchangeFilter);
    if (!q) return all.slice(0, 200);
    const starts: SymbolPickerEntry[] = [];
    const contains: SymbolPickerEntry[] = [];
    for (const s of all) {
      if (s.symbol.startsWith(q)) starts.push(s);
      else if (s.symbol.includes(q) || s.name.toUpperCase().includes(q)) contains.push(s);
      if (starts.length >= 200) break;
    }
    const merged = [...starts, ...contains];
    const seen = new Set(merged.map((s) => s.symbol));
    for (const s of live) {
      if (!seen.has(s.symbol)) {
        seen.add(s.symbol);
        merged.push(s);
      }
    }
    return merged.slice(0, 200);
  }, [mergedSymbols, liveKey, assetTypeFilter, exchangeFilter, liveSearchQuery.data]);

  return (
    <div className={className ?? "flex flex-wrap items-end gap-3"}>
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
          {t("analysis.assetType")}
        </Label>
        <select
          value={assetTypeFilter}
          onChange={(e) => onAssetTypeChange(e.target.value as AssetTypeFilter)}
          className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
        >
          <option value="all">{t("analysis.assetAll")}</option>
          <option value="stock">{t("analysis.assetStock")}</option>
          <option value="etf">{t("analysis.assetEtf")}</option>
          <option value="mutualfund">{t("analysis.assetMutualFund")}</option>
          <option value="commodity">{t("analysis.assetCommodity")}</option>
          <option value="crypto">{t("analysis.assetCrypto")}</option>
          <option value="index">{t("analysis.assetIndex")}</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
          {t("analysis.exchange")}
        </Label>
        <select
          value={exchangeFilter}
          onChange={(e) => onExchangeChange(e.target.value)}
          className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
        >
          <option value="all">{t("analysis.exchangeAll")}</option>
          {availableExchanges.map((ex) => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={inputId} className="text-[10px] uppercase text-[var(--color-muted-fg)]">
          {t("analysis.symbol")}
        </Label>
        <Input
          id={inputId}
          list={listId}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClassName ?? "h-8 w-48"}
          {...(maxLength != null ? { maxLength } : {})}
        />
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s.symbol} value={s.symbol}>
              {s.name} ({s.exchange})
              {s.assetType === "etf"
                ? " · ETF"
                : s.assetType === "commodity"
                ? " · Futures"
                : s.assetType === "mutualfund"
                ? " · Fund"
                : s.assetType === "crypto"
                ? " · Crypto"
                : s.assetType === "index"
                ? " · Index"
                : ""}
            </option>
          ))}
        </datalist>
      </div>
    </div>
  );
}
