import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getBrowserSupabase: vi.fn(),
  setLocalEntitlements: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getBrowserSupabase: mocks.getBrowserSupabase,
}));

vi.mock("@/lib/entitlements", () => ({
  setLocalEntitlements: mocks.setLocalEntitlements,
}));

import { pullRemoteEntitlements } from "@/lib/sync/entitlements-remote";

function supabaseWith({
  entitlements,
  profile,
}: {
  entitlements: { data: unknown[] | null; error: unknown };
  profile: { data: { ad_free?: boolean } | null; error: unknown };
}) {
  return {
    // 호출자가 userId를 넘기므로 여기서 auth를 다시 물을 일이 없다.
    // 남겨 두고 호출되지 않는 것을 확인한다.
    auth: { getUser: mocks.getUser },
    from: vi.fn((table: string) => {
      if (table === "entitlements") {
        return {
          select: () => ({
            eq: () => Promise.resolve(entitlements),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve(profile),
          }),
        }),
      };
    }),
  };
}

describe("pullRemoteEntitlements", () => {
  beforeEach(() => {
    mocks.getBrowserSupabase.mockReset();
    mocks.setLocalEntitlements.mockReset();
    mocks.getUser.mockReset();
  });

  it("두 원격 조회가 성공하면 로컬 권한을 서버 값으로 갱신한다", async () => {
    mocks.getBrowserSupabase.mockReturnValue(
      supabaseWith({
        entitlements: {
          data: [{ deck_id: "wolha-biwon" }],
          error: null,
        },
        profile: { data: { ad_free: true }, error: null },
      }),
    );

    await pullRemoteEntitlements("user-1");

    expect(mocks.setLocalEntitlements).toHaveBeenCalledWith({
      ownedDeckIds: ["wolha-biwon"],
      adFree: true,
    });
    // 호출자가 누구인지 이미 안다. 여기서 Auth 왕복을 한 번 더 내지 않는다.
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it.each(["entitlements", "profile"] as const)(
    "%s 조회가 실패하면 기존 로컬 권한을 보존한다",
    async (failed) => {
      mocks.getBrowserSupabase.mockReturnValue(
        supabaseWith({
          entitlements: {
            data: [],
            error: failed === "entitlements" ? new Error("failed") : null,
          },
          profile: {
            data: { ad_free: false },
            error: failed === "profile" ? new Error("failed") : null,
          },
        }),
      );

      await pullRemoteEntitlements("user-1");

      expect(mocks.setLocalEntitlements).not.toHaveBeenCalled();
    },
  );

  it("왕복 중 세션이 바뀌면 늦은 결과를 적용하지 않는다", async () => {
    mocks.getBrowserSupabase.mockReturnValue(
      supabaseWith({
        entitlements: { data: [], error: null },
        profile: { data: { ad_free: false }, error: null },
      }),
    );

    await pullRemoteEntitlements("user-1", () => true);

    expect(mocks.setLocalEntitlements).not.toHaveBeenCalled();
  });
});
