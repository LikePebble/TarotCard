/**
 * AdSense 식별자 다루기(순수).
 *
 * 측정 ID가 아직 없어 환경변수가 빈 채로 배포될 수 있다. 그때 빈 ads.txt나
 * `ca-pub-undefined`가 실린 ads.txt를 내보내면 심사에서 없느니만 못하므로,
 * 형식을 통과한 값만 살려 보내고 나머지는 전부 null로 떨어뜨린다.
 */

/** AdSense가 쓰는 클라이언트 ID 형식. 게시자 번호는 자릿수를 못 박지 않는다. */
const CLIENT_PATTERN = /^ca-pub-\d+$/;

/** ads.txt 한 줄의 마지막 칸. 구글이 지정한 고정 인증 값이다. */
const GOOGLE_TAG_ID = "f08c47fec0942fa0";

/** 유효한 `ca-pub-…`만 통과시킨다. 아니면 null. */
export function adsenseClientId(raw: string | undefined | null): string | null {
  const trimmed = (raw ?? "").trim();
  return CLIENT_PATTERN.test(trimmed) ? trimmed : null;
}

/**
 * ads.txt가 요구하는 게시자 ID. 환경변수는 `ca-pub-…`인데 파일에는 `pub-…`만
 * 들어가므로 앞의 `ca-`를 뗀다.
 */
export function adsensePublisherId(
  raw: string | undefined | null,
): string | null {
  const client = adsenseClientId(raw);
  return client === null ? null : client.slice("ca-".length);
}

/** ads.txt 본문. 게시자 ID를 확정할 수 없으면 null(=파일 자체를 내보내지 않는다). */
export function adsTxtBody(raw: string | undefined | null): string | null {
  const publisher = adsensePublisherId(raw);
  return publisher === null
    ? null
    : `google.com, ${publisher}, DIRECT, ${GOOGLE_TAG_ID}\n`;
}
