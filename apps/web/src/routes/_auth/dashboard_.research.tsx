import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SymbolPicker, type AssetTypeFilter } from "@/components/symbol-picker";
import { ResearchChat } from "@/components/research/research-chat";

export const Route = createFileRoute("/_auth/dashboard_/research")({
  component: ResearchPage,
});

function ResearchPage() {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>("all");
  const [exchangeFilter, setExchangeFilter] = useState<string>("all");

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("research.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <SymbolPicker
            inputId="research-symbol"
            listId="research-symbol-suggestions"
            value={symbol}
            onChange={(v) => setSymbol(v.toUpperCase())}
            placeholder="AAPL"
            assetTypeFilter={assetTypeFilter}
            onAssetTypeChange={setAssetTypeFilter}
            exchangeFilter={exchangeFilter}
            onExchangeChange={setExchangeFilter}
          />
          <p className="text-xs text-[var(--color-muted-fg)]">
            {t("research.symbolHint")}
          </p>
        </CardContent>
      </Card>

      <Card className="flex flex-1 min-h-0 flex-col">
        <CardHeader className="border-b border-[var(--color-border)] pb-3">
          <CardTitle className="text-base">{t("research.chatTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 min-h-0 flex-col p-0">
          <ResearchChat symbol={symbol} />
        </CardContent>
      </Card>
    </div>
  );
}
