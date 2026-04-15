import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AuthLeftPanel } from "@/components/auth-left-panel";
import { signUp } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signUp.email({ name, email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message ?? "Sign up failed");
      return;
    }
    void navigate({ to: "/verify-email" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthLeftPanel />
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-4 lg:justify-end">
          <span className="lg:hidden"><Logo /></span>
          <LanguageSwitcher />
        </header>
        <main className="grid flex-1 place-items-center px-4 pb-10">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>{t("auth.signUp")}</CardTitle>
              <CardDescription>{t("app.name")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("auth.name")}</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Input id="password" type="password" required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                  <p className="text-xs text-[var(--color-muted-fg)]">{t("auth.passwordHint")}</p>
                </div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "…" : t("auth.signUp")}
                </Button>
                <p className="text-center text-sm text-[var(--color-muted-fg)]">
                  {t("auth.haveAccount")}{" "}
                  <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
                    {t("auth.signIn")}
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
