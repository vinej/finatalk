import { useTranslation } from "react-i18next";

export function Logo() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <LogoMark className="h-8 w-8" />
      <span className="text-base font-semibold tracking-tight">{t("app.name")}</span>
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Finatalk logo"
      className={className}
    >
      <path
        d="M6 9a5 5 0 0 1 5-5h18a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5h-9.5l-5.8 5.4a1 1 0 0 1-1.7-.7V28H11a5 5 0 0 1-5-5V9Z"
        fill="var(--color-primary)"
      />
      <polyline
        points="11,22 16,18 21,20 26,12 30,14"
        fill="none"
        stroke="var(--color-primary-fg)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="14" r="1.8" fill="var(--color-primary-fg)" />
    </svg>
  );
}
