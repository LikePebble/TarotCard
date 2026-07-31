import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

Object.assign(globalThis, { React });

vi.mock("@/lib/auth/session", () => ({
  signInWithProvider: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: true,
}));

import { SignInButtons } from "@/components/SignInButtons";

/**
 * 약관 동의를 가입 행위로 갈음하는 방식이므로, 동의 문구와 두 문서 링크가
 * 로그인 버튼과 같은 화면에 있어야 약관이 계약에 편입된다. 링크가 조용히
 * 사라지면 문서만 있고 동의는 받지 못하는 상태로 되돌아간다.
 */
describe("SignInButtons", () => {
  it("소셜 로그인 버튼을 보여준다", () => {
    const html = renderToStaticMarkup(React.createElement(SignInButtons));

    expect(html).toContain("카카오로 시작하기");
    expect(html).toContain("Google로 시작하기");
  });

  it("가입 행위가 약관 동의로 갈음됨을 밝힌다", () => {
    const html = renderToStaticMarkup(React.createElement(SignInButtons));

    expect(html).toContain("동의하는 것으로 봅니다");
  });

  it("이용약관과 개인정보처리방침으로 가는 링크를 함께 둔다", () => {
    const html = renderToStaticMarkup(React.createElement(SignInButtons));

    expect(html).toContain('href="/terms"');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain("이용약관");
    expect(html).toContain("개인정보처리방침");
  });

  // 개인정보처리방침은 개인정보 보호법 제30조상 공개 의무 대상이지 동의 대상이
  // 아니다. 두 문서를 "~과 ~에 동의"로 묶으면 방침까지 동의 대상으로 표시하는
  // 것이 되어 부정확하다. 동의는 약관에만 걸리고, 방침은 확인 안내여야 한다.
  it("개인정보처리방침을 동의 대상으로 표시하지 않는다", () => {
    const html = renderToStaticMarkup(React.createElement(SignInButtons));
    const text = html.replace(/<[^>]+>/g, "");

    expect(text).toMatch(/이용약관에 동의하는 것으로 봅니다/);
    expect(text).not.toMatch(/개인정보처리방침[^.]*동의/);
    expect(text).toMatch(/개인정보처리방침에서 확인할 수 있습니다/);
  });
});
