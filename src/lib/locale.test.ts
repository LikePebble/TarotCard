import { describe, expect, it } from "vitest";
import { LOCALE_HEADER, localeFromCountry, localeFromHeaders } from "./locale";

describe("localeFromCountry", () => {
  it("uses Korean only for a KR IP", () => {
    expect(localeFromCountry("KR")).toBe("ko");
    expect(localeFromCountry("kr")).toBe("ko");
    expect(localeFromCountry("US")).toBe("en");
  });

  it("defaults an unknown country to English", () => {
    expect(localeFromCountry(null)).toBe("en");
    expect(localeFromCountry(undefined)).toBe("en");
  });
});

describe("localeFromHeaders", () => {
  it("accepts only the middleware's Korean marker", () => {
    expect(localeFromHeaders(new Headers([[LOCALE_HEADER, "ko"]]))).toBe("ko");
    expect(localeFromHeaders(new Headers([[LOCALE_HEADER, "en"]]))).toBe("en");
  });
});
