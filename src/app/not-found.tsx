import Link from "next/link";

/**
 * 404 자리표시자. 디자인된 오류 화면은 별도 제작 예정이라 여기서는
 * 앱 배경·서체만 따르고 빠져나갈 길만 둔다.
 * 세그먼트별 문구가 필요해지면 그 세그먼트에 not-found.tsx를 추가한다.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[44px] font-semibold text-gold-soft lg:text-[64px]">
        404
      </p>
      <h1 className="mt-2 font-display text-[19px] font-semibold lg:text-[24px]">
        찾으시는 페이지가 없습니다
      </h1>
      <p className="mt-2 text-[13.5px] text-muted lg:text-[15px]">
        주소가 바뀌었거나 삭제된 화면일 수 있습니다.
      </p>
      <div className="mt-7 flex gap-2.5">
        <Link href="/" className="btn btn-gold">
          홈으로
        </Link>
        <Link href="/collection" className="btn btn-ghost">
          컬렉션
        </Link>
      </div>
    </div>
  );
}
