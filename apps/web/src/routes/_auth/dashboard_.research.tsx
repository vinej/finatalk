import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResearchChat } from "@/components/research/research-chat";

export const Route = createFileRoute("/_auth/dashboard_/research")({
  component: ResearchPage,
});

function ResearchPage() {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState("");

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("research.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid gap-1.5 sm:max-w-xs">
            <Label htmlFor="research-symbol">{t("research.symbol")}</Label>
            <Input
              id="research-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              autoComplete="off"
            />
            <p className="text-xs text-[var(--color-muted-fg)]">
              {t("research.symbolHint")}
            </p>
          </div>
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
