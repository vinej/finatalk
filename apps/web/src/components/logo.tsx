import { useTranslation } from "react-i18next";

export function Logo() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <div
        className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-sm font-bold"
        aria-hidden="true"
      >
        M
      </div>
      <span className="text-base font-semibold tracking-tight">{t("app.name")}</span>
    </div>
  );
}
