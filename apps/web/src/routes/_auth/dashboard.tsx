import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const { data } = trpc.user.me.useQuery();
  const name = data?.name ?? "";
  const verified = data?.emailVerified ?? false;

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.welcome", { name })}</CardTitle>
          <CardDescription>{t("dashboard.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <span
            className={
              verified
                ? "inline-flex items-center rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-fg)]"
                : "inline-flex items-center rounded-full bg-[var(--color-destructive)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-destructive)]"
            }
          >
            {verified ? t("dashboard.verifiedBadge") : t("dashboard.unverifiedBadge")}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
