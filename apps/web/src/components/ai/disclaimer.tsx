import { useTranslation } from "react-i18next";

export function AiDisclaimer() {
  const { t } = useTranslation();
  return (
    <p className="text-xs italic text-[var(--color-muted-fg)]">
      {t("ai.disclaimer")}
    </p>
  );
}
