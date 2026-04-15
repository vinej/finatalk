import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import frCommon from "../locales/fr/common.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const RTL_LANGUAGES: LanguageCode[] = [];

export function isRTL(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang as LanguageCode);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      fr: { common: frCommon },
    },
    fallbackLng: "en",
    defaultNS: "common",
    load: "languageOnly",
    supportedLngs: ["en", "fr"],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "finatalk-language",
    },
    interpolation: { escapeValue: true },
  });

if (typeof document !== "undefined") {
  const apply = (lng: string) => {
    document.documentElement.lang = lng;
    document.documentElement.dir = isRTL(lng) ? "rtl" : "ltr";
  };
  apply(i18n.language);
  i18n.on("languageChanged", apply);
}

export default i18n;
