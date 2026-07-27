import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

Object.assign(globalThis, { React });

const mocks = vi.hoisted(() => ({
  session: {
    user: null as null | {
      email: string | null;
      app_metadata: Record<string, unknown>;
    },
    loading: false,
    configured: true,
    devSession: false,
  },
  sync: {
    state: "idle" as const,
    lastSyncedAt: null as string | null,
  },
  signOutAndClear: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  useSession: () => mocks.session,
  signOutAndClear: mocks.signOutAndClear,
  setDevSession: vi.fn(),
  isLocalAuthDev: false,
}));

vi.mock("@/lib/sync/status", () => ({
  useSyncStatus: () => mocks.sync,
}));

import { AccountCard } from "@/app/my/AccountCard";

describe("AccountCard", () => {
  beforeEach(() => {
    mocks.session.user = null;
    mocks.session.loading = false;
    mocks.session.configured = true;
    mocks.session.devSession = false;
  });

  it("미로그인 상태에서는 로그인 페이지로 가는 단일 CTA를 보여준다", () => {
    const html = renderToStaticMarkup(React.createElement(AccountCard));

    expect(html).toContain('href="/login"');
    expect(html).toContain("로그인하러 가기");
    expect(html).not.toContain("카카오로 시작하기");
    expect(html).not.toContain("Google로 시작하기");
  });

  it("로그인 상태에서는 계정과 제공자, 로그아웃 버튼을 보여준다", () => {
    mocks.session.user = {
      email: "reader@example.com",
      app_metadata: { provider: "google" },
    };

    const html = renderToStaticMarkup(React.createElement(AccountCard));

    expect(html).toContain("reader@example.com");
    expect(html).toContain("Google 계정");
    expect(html).toContain("로그아웃");
    expect(html).not.toContain('href="/login"');
  });
});
