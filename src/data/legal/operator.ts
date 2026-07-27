/**
 * 서비스 운영자(사업자) 정보.
 *
 * ⚠️ 정식 출시 전 반드시 실제 값으로 교체할 것. 미기재 시 전자상거래법(전자상거래 등에서의
 * 소비자보호에 관한 법률) 제10조의 사업자 신원 정보 표시 의무 위반 소지가 있고,
 * 개인정보 보호법 제30조가 요구하는 개인정보 보호책임자·문의처 기재도 충족되지 않는다.
 *
 * 아래 값은 전부 플레이스홀더다. 확인되지 않은 상호·주소·등록번호를 임의로 채워 넣지 말 것.
 */

/** 아직 확정되지 않은 값. 화면에 그대로 노출되어 미기재 사실이 드러나도록 둔다. */
export const OPERATOR_TBD = "(사업자 정보 입력 필요)";

export const operator = {
  /** 서비스 이름. */
  serviceName: "아르카(Arca)",
  /** 서비스 주소. */
  siteUrl: "https://arca.realm.ai.kr",

  /** 상호(법인명 또는 사업자명). */
  companyName: OPERATOR_TBD,
  /** 대표자 성명. */
  representative: OPERATOR_TBD,
  /** 사업자등록번호. */
  businessRegistrationNumber: OPERATOR_TBD,
  /** 통신판매업 신고번호. */
  mailOrderSalesNumber: OPERATOR_TBD,
  /** 사업장 주소. */
  address: OPERATOR_TBD,
  /** 이용자 문의 이메일. */
  contactEmail: OPERATOR_TBD,

  /** 개인정보 보호책임자. */
  privacyOfficer: {
    name: OPERATOR_TBD,
    position: OPERATOR_TBD,
    email: OPERATOR_TBD,
  },
} as const;

/** 약관·방침 하단에 공통으로 싣는 사업자 정보 목록. */
export const operatorBullets: string[] = [
  `상호: ${operator.companyName}`,
  `대표자: ${operator.representative}`,
  `사업자등록번호: ${operator.businessRegistrationNumber}`,
  `통신판매업 신고번호: ${operator.mailOrderSalesNumber}`,
  `주소: ${operator.address}`,
  `문의 이메일: ${operator.contactEmail}`,
  `서비스 주소: ${operator.siteUrl}`,
];
