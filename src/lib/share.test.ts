import { describe, expect, it, vi } from "vitest";
import {
  cardSharePayload,
  runShare,
  shareCardUrl,
  shareNoticeOf,
} from "@/lib/share";

const ORIGIN = "https://arca.realm.ai.kr";

describe("shareCardUrl", () => {
  it("카드 상세 주소를 만든다", () => {
    expect(shareCardUrl(ORIGIN, "classic", "the-fool")).toBe(
      "https://arca.realm.ai.kr/collection/classic/the-fool",
    );
  });

  it("readingId·filter를 싣지 않는다", () => {
    const url = shareCardUrl(ORIGIN, "wolha-biwon", "the-star");
    expect(url).not.toContain("readingId");
    expect(url).not.toContain("filter");
    expect(url).not.toContain("?");
  });

  it("origin 끝의 슬래시를 중복시키지 않는다", () => {
    expect(shareCardUrl(`${ORIGIN}/`, "classic", "the-fool")).toBe(
      "https://arca.realm.ai.kr/collection/classic/the-fool",
    );
  });
});

describe("cardSharePayload", () => {
  it("제목·문구에 카드 이름과 덱 이름을 담는다", () => {
    const p = cardSharePayload(ORIGIN, "classic", "the-fool", "바보", "The Fool");
    expect(p.title).toContain("바보");
    expect(p.title).toContain("The Fool");
    expect(p.text).toContain("바보");
    expect(p.text).toContain("클래식 덱");
    expect(p.url).toBe("https://arca.realm.ai.kr/collection/classic/the-fool");
  });
});

describe("runShare", () => {
  const payload = cardSharePayload(ORIGIN, "classic", "the-fool", "바보", "The Fool");

  it("공유 시트가 있으면 시트를 쓴다", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await expect(runShare({ share }, payload)).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith(payload);
  });

  it("시트가 없으면 클립보드로 내려간다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(runShare({ clipboard: { writeText } }, payload)).resolves.toBe(
      "copied",
    );
    expect(writeText).toHaveBeenCalledWith(payload.url);
  });

  it("사용자가 시트를 닫으면 취소로 본다(오류 아님)", async () => {
    const abort = Object.assign(new Error("cancel"), { name: "AbortError" });
    const writeText = vi.fn();
    const outcome = await runShare(
      { share: vi.fn().mockRejectedValue(abort), clipboard: { writeText } },
      payload,
    );
    expect(outcome).toBe("cancelled");
    // 취소는 복사로 내려가지 않는다. 사용자가 그만두겠다고 한 것이다.
    expect(writeText).not.toHaveBeenCalled();
  });

  it("시트가 실패하면 복사로 내려간다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const outcome = await runShare(
      {
        share: vi.fn().mockRejectedValue(new Error("boom")),
        clipboard: { writeText },
      },
      payload,
    );
    expect(outcome).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(payload.url);
  });

  it("둘 다 없으면 실패", async () => {
    await expect(runShare({}, payload)).resolves.toBe("failed");
  });

  it("클립보드가 거부되면 레거시 복사로 내려간다", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const legacy = vi.fn().mockReturnValue(true);
    await expect(
      runShare({ clipboard: { writeText } }, payload, legacy),
    ).resolves.toBe("copied");
    expect(legacy).toHaveBeenCalledWith(payload.url);
  });

  it("클립보드가 아예 없어도 레거시 복사를 쓴다", async () => {
    const legacy = vi.fn().mockReturnValue(true);
    await expect(runShare({}, payload, legacy)).resolves.toBe("copied");
  });

  it("레거시 복사까지 실패하면 실패", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const legacy = vi.fn().mockReturnValue(false);
    await expect(
      runShare({ clipboard: { writeText } }, payload, legacy),
    ).resolves.toBe("failed");
  });

  it("취소는 레거시 복사로도 내려가지 않는다", async () => {
    const abort = Object.assign(new Error("cancel"), { name: "AbortError" });
    const legacy = vi.fn().mockReturnValue(true);
    await expect(
      runShare({ share: vi.fn().mockRejectedValue(abort) }, payload, legacy),
    ).resolves.toBe("cancelled");
    expect(legacy).not.toHaveBeenCalled();
  });
});

describe("shareNoticeOf", () => {
  it("취소와 성공에는 아무 말도 하지 않는다", () => {
    expect(shareNoticeOf("cancelled")).toBeNull();
    expect(shareNoticeOf("shared")).toBeNull();
  });

  it("복사와 실패는 알린다", () => {
    expect(shareNoticeOf("copied")).toBe("링크를 복사했습니다");
    expect(shareNoticeOf("failed")).toContain("공유하지 못했습니다");
  });
});
