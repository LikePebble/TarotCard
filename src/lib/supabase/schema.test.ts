import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../../../supabase/migrations/0001_p1_foundation.sql", import.meta.url),
  "utf8",
);
const collectionReadOnlyMigration = readFileSync(
  new URL("../../../supabase/migrations/0004_collection_read_only.sql", import.meta.url),
  "utf8",
);

describe("Supabase foundation security", () => {
  it("모든 사용자 데이터 테이블에 RLS를 활성화한다", () => {
    for (const table of [
      "profiles",
      "readings",
      "collection",
      "journal_entries",
      "entitlements",
    ]) {
      expect(migration).toContain(
        `alter table public.${table} enable row level security;`,
      );
    }
  });

  it("정책은 authenticated 역할의 본인 데이터로 제한한다", () => {
    expect(
      migration.match(
        /create policy "[^"]+"[\s\S]*?(?=create policy|-- 신규 가입)/g,
      ),
    ).toHaveLength(6);
    expect(
      migration.match(
        /create policy "[^"]+"[\s\S]*?to authenticated[\s\S]*?(?=create policy|-- 신규 가입)/g,
      ),
    ).toHaveLength(6);
    expect(migration.match(/\(select auth\.uid\(\)\)/g)).toHaveLength(10);
  });

  it("프로필의 유료 상태는 클라이언트가 수정할 수 없다", () => {
    expect(migration).toContain(
      "grant update (display_name, selected_deck_id) on public.profiles to authenticated;",
    );
    expect(migration).toContain(
      "revoke all on public.profiles from anon, authenticated;",
    );
    expect(migration).not.toContain("grant update (ad_free)");
  });

  it("엔타이틀먼트는 본인 조회만 허용하고 클라이언트 쓰기를 차단한다", () => {
    expect(migration).toMatch(
      /create policy "own entitlements select" on public\.entitlements\s+for select\s+to authenticated/,
    );
    expect(migration).toContain(
      "revoke all on public.entitlements from anon, authenticated;",
    );
    expect(migration).toContain(
      "grant select on public.entitlements to authenticated;",
    );
    expect(migration).not.toMatch(
      /grant (?:insert|update|delete).*public\.entitlements to authenticated/,
    );
    expect(migration).not.toMatch(
      /create policy "own entitlements" on public\.entitlements\s+for all/,
    );
  });

  it("회원 생성 트리거는 빈 search_path와 완전 수식 테이블명을 사용한다", () => {
    expect(migration).toContain(
      "returns trigger language plpgsql security definer set search_path = ''",
    );
    expect(migration).toContain("insert into public.profiles (id)");
  });

  it("레거시 collection은 기존 행을 보존하고 클라이언트 신규 쓰기를 막는다", () => {
    expect(collectionReadOnlyMigration).toContain(
      "revoke insert, update, delete on public.collection from authenticated;",
    );
    expect(collectionReadOnlyMigration).toMatch(
      /create policy "own collection select" on public\.collection\s+for select\s+to authenticated/,
    );
    expect(collectionReadOnlyMigration).not.toMatch(/drop table\s+(?:if exists\s+)?public\.collection/i);
  });
});
