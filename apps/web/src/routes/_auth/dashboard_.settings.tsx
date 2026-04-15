import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const { data } = trpc.user.me.useQuery();
  const [name, setName] = useState("");

  useEffect(() => {
    if (data?.name) setName(data.name);
  }, [data?.name]);

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.user.me.invalidate();
      toast.success(t("settings.saved"));
    },
    onError: (err) => toast.error(err.message ?? t("settings.saveFailed")),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate({ name });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.title")}</CardTitle>
          <CardDescription>{t("settings.profile")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("settings.name")}</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("settings.email")}</Label>
              <Input id="email" type="email" value={data?.email ?? ""} disabled readOnly />
            </div>
            <Button type="submit" disabled={updateProfile.isPending} className="self-start">
              {updateProfile.isPending ? "…" : t("settings.save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
