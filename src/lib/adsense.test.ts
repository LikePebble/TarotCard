import { describe, expect, it } from "vitest";
import {
  adsTxtBody,
  adsenseClientId,
  adsensePublisherId,
} from "@/lib/adsense";

const VALID = "ca-pub-1234567890123456";

describe("adsenseClientId", () => {
  it("정상 형식은 그대로 통과", () => {
    expect(adsenseClientId(VALID)).toBe(VALID);
  });
  it("앞뒤 공백은 다듬는다(.env에서 흔한 실수)", () => {
    expect(adsenseClientId(`  ${VALID}\n`)).toBe(VALID);
  });
  it("비었거나 형식이 어긋나면 null", () => {
    expect(adsenseClientId(undefined)).toBeNull();
    expect(adsenseClientId(null)).toBeNull();
    expect(adsenseClientId("")).toBeNull();
    expect(adsenseClientId("   ")).toBeNull();
    expect(adsenseClientId("pub-1234567890123456")).toBeNull();
    expect(adsenseClientId("ca-pub-")).toBeNull();
    expect(adsenseClientId("ca-pub-abc")).toBeNull();
    expect(adsenseClientId("ca-pub-123 456")).toBeNull();
    expect(adsenseClientId("undefined")).toBeNull();
  });
});

describe("adsensePublisherId", () => {
  it("ca- 접두사를 떼어 pub-…만 남긴다", () => {
    expect(adsensePublisherId(VALID)).toBe("pub-1234567890123456");
  });
  it("유효하지 않으면 null", () => {
    expect(adsensePublisherId(undefined)).toBeNull();
    expect(adsensePublisherId("ca-pub-abc")).toBeNull();
  });
});

describe("adsTxtBody", () => {
  it("구글이 요구하는 한 줄을 만든다", () => {
    expect(adsTxtBody(VALID)).toBe(
      "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n",
    );
  });
  it("ID가 없으면 null — 빈 ads.txt를 내보내지 않는다", () => {
    expect(adsTxtBody(undefined)).toBeNull();
    expect(adsTxtBody("")).toBeNull();
    expect(adsTxtBody("ca-pub-oops")).toBeNull();
  });
});
