import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/two-factor")({
  component: TwoFactorPage,
});

function TwoFactorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(true);
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    void (async () => {
      const { error } = await authClient.twoFactor.sendOtp();
      if (error) {
        void navigate({ to: "/login" });
        return;
      }
      setSending(false);
    })();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await authClient.twoFactor.verifyOtp({ code });
    setSubmitting(false);
    if (error) {
      toast.error(error.message ?? t("auth.verifyFailed"));
      return;
    }
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <LanguageSwitcher />
      </header>
      <main className="grid flex-1 place-items-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t("auth.twoFactor")}</CardTitle>
            <CardDescription>{t("auth.twoFactorDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {sending ? (
              <p className="text-sm text-[var(--color-muted-fg)]">{t("auth.verifying")}</p>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">{t("auth.twoFactor")}</Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <Button type="submit" disabled={submitting || code.length < 6}>
                  {submitting ? "…" : t("auth.verify")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
