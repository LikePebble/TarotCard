import { adsTxtBody } from "@/lib/adsense";

/**
 * AdSense는 루트의 `/ads.txt`에서 게시자 ID를 확인한다. 정적 파일 대신 라우트
 * 핸들러로 두어 게시자 ID를 환경변수에서 받는다 — 리포에 ID를 커밋하지 않고,
 * 승인 전후로 값만 바꿔 배포할 수 있다.
 *
 * ID를 확정할 수 없으면 404다. 빈 파일이나 잘못된 ID가 실린 ads.txt는 크롤러에게
 * "이 사이트는 아무에게도 판매 권한을 주지 않았다"로 읽혀 없느니만 못하다.
 */
export function GET() {
  const body = adsTxtBody(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
  if (body === null) return new Response(null, { status: 404 });
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
