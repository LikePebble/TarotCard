export const LOCALES = ["ko", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_HEADER = "x-arca-locale";

/** KR만 한국어로 취급한다. 국가 정보가 없으면 제품 원칙대로 영어를 쓴다. */
export function localeFromCountry(country: string | null | undefined): Locale {
  return country?.toUpperCase() === "KR" ? "ko" : "en";
}

export function localeFromHeaders(headers: Headers): Locale {
  return headers.get(LOCALE_HEADER) === "ko" ? "ko" : "en";
}
