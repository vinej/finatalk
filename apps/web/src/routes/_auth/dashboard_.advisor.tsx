import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvisorChat } from "@/components/advisor/advisor-chat";

export const Route = createFileRoute("/_auth/dashboard_/advisor")({
  component: AdvisorPage,
});

function AdvisorPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">{t("advisor.title")}</h1>
        <p className="text-sm text-[var(--color-muted-fg)]">{t("advisor.subtitle")}</p>
      </div>

      <Card className="flex flex-col">
        <CardHeader className="border-b border-[var(--color-border)] pb-3">
          <CardTitle className="text-base">{t("advisor.chatTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col p-0">
          <AdvisorChat />
        </CardContent>
      </Card>
    </div>
  );
}
