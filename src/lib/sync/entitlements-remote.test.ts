import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getBrowserSupabase: vi.fn(),
  setLocalEntitlements: vi.fn(),
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
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
      }),
    },
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

    await pullRemoteEntitlements();

    expect(mocks.setLocalEntitlements).toHaveBeenCalledWith({
      ownedDeckIds: ["wolha-biwon"],
      adFree: true,
    });
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

      await pullRemoteEntitlements();

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

    await pullRemoteEntitlements(() => true);

    expect(mocks.setLocalEntitlements).not.toHaveBeenCalled();
  });
});
