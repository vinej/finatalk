import { useTranslation } from "react-i18next";
import { Zap, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
  { icon: Zap, key: "feature1" },
  { icon: ShieldCheck, key: "feature2" },
  { icon: Sparkles, key: "feature3" },
] as const;

export function AuthLeftPanel() {
  const { t } = useTranslation();

  return (
    <div
      className="relative hidden min-h-screen flex-col justify-between overflow-hidden px-12 py-10 text-white lg:flex"
      style={{ background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 50%, #14b8a6 100%)" }}
    >
      <div className="absolute -left-24 -top-24 h-[22rem] w-[22rem] rounded-full bg-white/5" />
      <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-white/5" />
      <div className="absolute right-[-4rem] top-1/2 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative z-10 text-white">
        <Logo />
      </div>

      <div className="relative z-10 space-y-6">
        <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs opacity-80">
          <circle cx="60" cy="60" r="36" stroke="white" strokeWidth="2" strokeOpacity="0.4" fill="none" />
          <circle cx="60" cy="60" r="22" stroke="white" strokeWidth="2" strokeOpacity="0.6" fill="none" />
          <circle cx="60" cy="60" r="8" fill="white" fillOpacity="0.9" />
          <rect x="160" y="45" width="6" height="30" rx="3" fill="white" fillOpacity="0.55" />
          <rect x="174" y="32" width="6" height="56" rx="3" fill="white" fillOpacity="0.75" />
          <rect x="188" y="50" width="6" height="20" rx="3" fill="white" fillOpacity="0.5" />
          <rect x="202" y="40" width="6" height="40" rx="3" fill="white" fillOpacity="0.65" />
          <rect x="216" y="52" width="6" height="16" rx="3" fill="white" fillOpacity="0.45" />
          <rect x="230" y="44" width="6" height="32" rx="3" fill="white" fillOpacity="0.6" />
        </svg>

        <div>
          <h2 className="text-3xl font-bold leading-snug">{t("authPanel.headline")}</h2>
          <p className="mt-3 text-base leading-relaxed text-white/75">{t("authPanel.subheadline")}</p>
        </div>

        <ul className="space-y-3">
          {features.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-3 text-sm text-white/90">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Icon className="h-3.5 w-3.5" />
              </span>
              {t(`authPanel.${key}`)}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-white/40">{t("authPanel.footer")}</p>
    </div>
  );
}
