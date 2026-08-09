import { formatLegalDate, type LegalDocument } from "@/data/legal";
import type { Locale } from "@/lib/locale";

/**
 * 이용약관·개인정보처리방침 공통 렌더러. 서버 컴포넌트.
 *
 * 본문은 `src/data/legal`의 데이터에서 오고, 이 컴포넌트는 배치만 맡는다.
 * 버전과 시행일, 개정 이력은 문서마다 반드시 보이도록 여기서 렌더한다.
 */
export function LegalDocumentView({
  doc,
  locale = "ko",
}: {
  doc: LegalDocument;
  locale?: Locale;
}) {
  const english = locale === "en";

  return (
    <article className="pb-4">
      <header>
        <h1 className="font-display text-[27px] font-semibold lg:text-[36px]">
          {doc.title}
        </h1>
        <p className="mt-1.5 text-[12.5px] text-muted lg:text-[13.5px]">
          <span>{english ? "Version" : "버전"} {doc.version}</span>
          <span aria-hidden className="mx-2 text-line">
            ·
          </span>
          <span>
            {english ? "Effective" : "시행일"}{" "}
            {formatLegalDate(doc.effectiveDate, locale)}
          </span>
        </p>
      </header>

      <div className="mt-7 flex flex-col gap-7 lg:mt-9 lg:gap-9">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-[17px] font-semibold text-gold-soft lg:text-[20px]">
              {section.heading}
            </h2>
            {section.paragraphs.map((text) => (
              <p
                key={text}
                className="mt-2.5 text-[14px] leading-[1.85] text-body lg:text-[15.5px]"
              >
                {text}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="mt-3 flex flex-col gap-2 rounded-2xl border border-line bg-ink-1 px-5 py-4 lg:rounded-[14px] lg:px-6 lg:py-5">
                {section.bullets.map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 text-[13.5px] leading-[1.8] text-body lg:text-[15px]"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.72em] size-[3px] rounded-full bg-gold-soft"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section>
          <h2 className="font-display text-[17px] font-semibold text-gold-soft lg:text-[20px]">
            {english ? "Revision History" : "개정 이력"}
          </h2>
          <p className="mt-2.5 text-[14px] leading-[1.85] text-body lg:text-[15.5px]">
            {english
              ? "Previous revisions are listed below, with the latest version first."
              : "지금까지의 개정 내용입니다. 최신 판이 맨 위에 있습니다."}
          </p>
          <ol className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-ink-1 lg:rounded-[14px]">
            {doc.revisions.map((rev) => (
              <li key={rev.version} className="px-5 py-4 lg:px-6 lg:py-5">
                <p className="font-display text-[15px] font-semibold lg:text-[16px]">
                  {english ? "Version" : "버전"} {rev.version}
                  {rev.version === doc.version ? (
                    <span className="ml-2 align-middle text-[11.5px] font-normal text-gold-soft">
                      {english ? "Current" : "현재 판"}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[12.5px] text-muted lg:text-[13.5px]">
                  {english ? "Effective" : "시행일"}{" "}
                  {formatLegalDate(rev.effectiveDate, locale)}
                </p>
                <p className="mt-1 text-[13.5px] leading-[1.8] text-body lg:text-[15px]">
                  {rev.summary}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
