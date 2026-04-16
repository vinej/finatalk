export type Lang = "en" | "fr";

export function pickLang(i18nLanguage: string | undefined): Lang {
  return i18nLanguage?.toLowerCase().startsWith("fr") ? "fr" : "en";
}
