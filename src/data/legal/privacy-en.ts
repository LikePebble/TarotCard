import { operator } from "./operator";
import type { LegalDocument } from "./types";

const operatorBulletsEn = [
  `Operator: ${operator.operatorName}`,
  `Contact email: ${operator.contactEmail}`,
  `Service URL: ${operator.siteUrl}`,
];

/** English counterpart of privacyDocument. Version, dates, processors, and retention periods stay aligned. */
export const privacyDocumentEn: LegalDocument = {
  id: "privacy",
  title: "Privacy Policy",
  version: "1.2",
  effectiveDate: "2026-08-08",
  revisions: [
    { version: "1.2", effectiveDate: "2026-08-08", summary: "Added guest inquiries and email-only inquiry handling" },
    { version: "1.1", effectiveDate: "2026-08-08", summary: "Added inquiry data and the email-delivery processor" },
    { version: "1.0", effectiveDate: "2026-07-29", summary: "Initial publication" },
  ],
  sections: [
    {
      heading: "About this Policy",
      paragraphs: [
        "Arca (the “Service”) respects Users' personal information and complies with the Personal Information Protection Act of the Republic of Korea and other applicable law. This Policy explains what information the Service processes, why it is processed, how long it is retained, and how Users may exercise their rights.",
        "This Policy does not describe a feature as active before it is actually in use. If a new feature changes the information processed or the way it is processed, this Policy will be amended and advance notice will be provided.",
        "The Service may be used without signing in. When a User is signed out, usage records such as Readings and Journal entries are stored only in the browser on the device being used. If a User submits an inquiry or improvement suggestion, however, the inquiry and any contact details the User optionally supplies are sent to the server.",
      ],
    },
    {
      heading: "Article 1 (Personal Information Processed by the Service)",
      paragraphs: [
        "When a User signs in with a Kakao or Google account, the Service processes the Account and record information below. Inquiries and improvement suggestions may also be submitted without signing in. Inquiry information is delivered to the operator's email through Resend and is not separately stored in the Service database. The Service does not create or retain a separate username or password.",
      ],
      bullets: [
        "Account information: User identifier (UUID), email address, and the provider used to sign in (Kakao or Google).",
        "Profile: User identifier, date and time of registration, display name, selected Deck, and ad-removal status.",
        "Reading records: record identifier, User identifier, recorded date and time, record date, ISO week, spread type, Reading type, Reading topic selected by the User (Today, Love, Work, Self, Health, or Money), Deck, cards drawn, and whether each card was upright or reversed.",
        "Collection: User identifier, Deck, card, date and time first encountered, and number of encounters.",
        "Daily records (Journal): User identifier, record date, text written by the User, date and time created, and date and time updated.",
        "Entitlement information: User identifier, owned Deck, date and time granted, and source of the grant.",
        "Inquiry information: inquiry category, inquiry text written by the User, reply contact or email optionally provided by the User, and submission time. For a signed-in User, the User identifier and Account email are also processed; for a guest, that Account information is not processed.",
      ],
    },
    {
      heading: "Article 2 (Information Stored Only on a Device)",
      paragraphs: [
        "Whether or not a User is signed in, the Service stores the values below in the browser's local storage. These values remain only on the User's device and, except where the User expressly sends information—for example by submitting a guest inquiry—are not sent to the server while the User is signed out.",
      ],
      bullets: [
        "arcana.v1 — Reading records.",
        "arcana.journal.v1 — daily records (Journal).",
        "arcana.entitlements.v1 — Deck entitlement information.",
        "arcana.collection.unseen.v1 — indicators for cards in the Collection that have not yet been viewed.",
        "arcana.deck — selected Deck.",
        "arcana.reading.focus — selected Reading topic.",
        "arcana.reading.spread — selected spread.",
        "Small amounts of other information needed for Service operation, such as the most recent synchronization time.",
      ],
    },
    {
      heading: "Article 3 (Purposes of Processing Personal Information)",
      paragraphs: [
        "The Service uses personal information only for the purposes below. If a purpose changes, Users will be informed in advance and consent will be obtained where required.",
      ],
      bullets: [
        "Identifying a User, maintaining sign-in, and providing records linked to the Account.",
        "Saving Reading records, the Collection, and Journal entries and showing them back to the User.",
        "Synchronizing records so the same records can be continued across devices.",
        "Confirming Deck entitlements and ad-removal status.",
        "Improving quality and responding to errors through Service analytics and performance measurement.",
        "Responding to inquiries and handling disputes.",
      ],
    },
    {
      heading: "Article 4 (Retention and Use Period)",
      paragraphs: [
        "Information stored on the server is retained while the User's Account remains active. Because the Service is intended to let Users revisit records over a long period, records are not deleted merely because a fixed period has elapsed.",
        "If a User requests deletion of information or deletion of the Account, the information will be destroyed unless retention is required by law.",
        "Account deletion is not available directly within the Service. A User may request it through the contact email in Article 9. Within 7 days after receiving the request, the operator will delete the Account and its linked Reading records, Collection, Journal entries, and entitlement information and will reply with the result.",
        "Information stored only on a device remains on that device until the User deletes it. Signing out immediately deletes Reading records, Journal entries, and entitlement information stored on that device; clearing browser storage also deletes it.",
        "Inquiry email is retained in the operator's mailbox for 1 year after the inquiry and reply have been completed and is then deleted. Inquiry information is not separately stored in the Service database. If longer retention is required by law, it will be stored separately for the required period.",
      ],
    },
    {
      heading: "Article 5 (Disclosure to Third Parties)",
      paragraphs: [
        "The Service does not disclose Users' personal information to third parties. Journal text and Reading records are not shared or sold and are not used for advertising, marketing, analytics, artificial-intelligence training, or any other purpose.",
        "Exceptions apply where a User has consented in advance, where a specific provision of law permits or requires disclosure, or where an investigative authority makes a request in accordance with procedures and methods prescribed by law.",
        "Processing is entrusted to external service providers only to the extent needed to operate the Service. Those arrangements are described in Article 6.",
      ],
    },
    {
      heading: "Article 6 (Processors and Entrusted Processing)",
      paragraphs: [
        "The Service entrusts the following personal-information processing to external service providers for stable operation. A provider may not use personal information beyond the scope of the entrusted purpose.",
        "Some providers may operate servers outside the Republic of Korea. In that case, the information transferred is the information listed in Article 1, and the purpose of transfer is limited to providing and maintaining the Service. A User may refuse an overseas transfer, but then a feature that depends on the relevant provider, such as sign-in or inquiry submission, cannot be used.",
      ],
      bullets: [
        "Supabase — member authentication and database operation for Accounts, Readings, the Collection, Journal entries, and entitlements.",
        "Vercel — Service hosting and usage analytics and performance measurement through Vercel Analytics and Speed Insights.",
        "Google Analytics — Service usage measurement, including pages visited, device and browser type, and approximate access region; cookies are used in this process.",
        "Kakao — social-login (OAuth) authentication.",
        "Google — social-login (OAuth) authentication.",
        "Google Fonts — webfont delivery. Font files are currently downloaded at build time and served directly from the Service domain, so a User's browser does not separately contact Google servers. If delivery changes so that a browser contacts Google directly, access information such as the IP address may be sent to Google.",
        "Google AdSense — displaying advertisements within the Service and processing the cookies needed to do so.",
        "Resend — sending inquiry email, including the inquiry category and text, an optionally supplied reply contact or email, and, for a member, the User identifier and signed-in Account email.",
      ],
    },
    {
      heading: "Article 7 (Cookies and Information Used for Advertising)",
      paragraphs: [
        "A cookie is a small text file that a website stores in a User's browser. The Service uses cookies to maintain sign-in and may also use cookies or similar technologies for usage analytics and performance measurement through Google Analytics and Vercel Analytics.",
        "A User may stop Google Analytics collection by installing Google's opt-out browser add-on (https://tools.google.com/dlpage/gaoptout) or by rejecting cookies in the browser as described below.",
        "A User may reject new cookies or delete stored cookies in browser settings. In most browsers, cookies can be managed under Privacy or Security settings. If cookies used to maintain sign-in are rejected, features that require sign-in cannot be used.",
        "The Service displays advertising through Google AdSense to help cover operating costs. Cookies are used as follows. The statements below continue to apply if the placement or format of advertisements or the advertising provider changes.",
      ],
      bullets: [
        "Third-party advertising providers, including Google, use cookies to serve advertising based on a User's earlier visits to this site or other sites.",
        "Google uses advertising cookies, including the DoubleClick cookie, to serve advertisements to Users.",
        "A User may opt out of personalized advertising in Google's ad settings at https://adssettings.google.com or https://myadcenter.google.com.",
        "Cookies from third-party providers other than Google may be opted out of collectively through the opt-out page at www.aboutads.info.",
        "Advertising may still be shown after personalized advertising is disabled, but it may be less relevant to the User's interests.",
      ],
    },
    {
      heading: "Article 8 (Special Notice About Journal Entries and Reading Topics)",
      paragraphs: [
        "Text a User writes in the Journal may be an intimate record of private thoughts. Reading topics also include private areas such as Love and Health, so the topic selected may reveal something about a User's interests or circumstances. The Service states this openly.",
        "These records are stored only to show them back to the User. The operator does not read or analyze them, use them for advertising, recommendations, analytics, or artificial-intelligence training, or disclose them externally.",
        "The data is stored on infrastructure provided by Supabase, which operates the database, and the operator may be able to access it using system-administration privileges where unavoidable, such as when responding to a failure. The Service minimizes such access, but does not currently use end-to-end encryption that would prevent even the operator from viewing the contents.",
        "Users are encouraged not to record anything they would be uncomfortable keeping. Existing records may be deleted at any time as follows.",
      ],
      bullets: [
        "Journal: clear all text on the record screen for that date and save. When signed in, the corresponding server record is also deleted.",
        "All records on this device: signing out deletes Reading records, Journal entries, and entitlement information stored on the device. Clearing browser storage also deletes them.",
        "Reading records stored on the server: individual deletion is not currently available on screen. A request sent to the contact email in Article 9 will be handled within 7 days after receipt.",
      ],
    },
    {
      heading: "Article 9 (User Rights, How to Exercise Them, and Contact)",
      paragraphs: [
        "A User or the User's legal representative may at any time request access to, correction or deletion of, or suspension of processing of the User's personal information.",
        "Journal entries and records on the device may be deleted directly as described in Article 8. Other requests may be made through “Contact & Suggestions” on the MY screen or through the privacy contact below, and will be handled without undue delay.",
        "The Service will verify that the requester is the User or a duly authorized representative before processing the request. A request may be restricted where permitted by law.",
        "The operator also serves as the person responsible for personal-information protection. Email sent to the address below will be received by the operator.",
      ],
      bullets: [
        `Person responsible for personal-information protection: ${operator.operatorName}`,
        "Position: Operator",
        `Contact email: ${operator.contactEmail}`,
      ],
    },
    {
      heading: "Article 10 (Destruction Procedure and Method)",
      paragraphs: [
        "When a retention period expires or the purpose of processing has been achieved and personal information is no longer needed, the Service destroys it without undue delay.",
        "Information stored as electronic files is permanently deleted using a method that prevents recovery. Information stored on a device is deleted by removing the relevant value from the browser's local storage.",
      ],
    },
    {
      heading: "Article 11 (Security Measures)",
      paragraphs: ["The Service takes the following measures to process personal information securely."],
      bullets: [
        "Row Level Security (RLS) is applied to every table containing User data—profiles, Readings, the Collection, Journal entries, and entitlements—so a signed-in User can access only their own data.",
        "Access keys exposed to the browser have minimal permissions. Ad-removal status (ad_free) and Deck entitlements (entitlements) are read-only and cannot be modified by the client.",
        "Communications between the Service and the browser are encrypted in transit using HTTPS.",
        "The Service does not retain passwords directly and instead uses Kakao and Google authentication, avoiding the risk of a password database held by the Service.",
      ],
    },
    {
      heading: "Article 12 (Personal Information of Children Under 14)",
      paragraphs: [
        "The Service does not process the personal information of a child under 14 without consent from the child's legal representative. Because the Service does not separately collect age at registration, a child under 14 must not use the sign-in feature without that consent.",
        "If the Service learns that personal information of a child under 14 was collected without consent from a legal representative, it will destroy the information without undue delay.",
      ],
    },
    {
      heading: "Article 13 (Remedies for Infringement of Rights)",
      paragraphs: [
        "A User may contact the institutions below for dispute resolution or advice concerning an infringement of personal-information rights. These are public institutions independent of the Service.",
      ],
      bullets: [
        "Personal Information Dispute Mediation Committee — 1833-6972 (www.kopico.go.kr).",
        "Personal Information Infringement Report Center — 118 (privacy.kisa.or.kr).",
        "Cyber Investigation Division, Supreme Prosecutors' Office — 1301 (www.spo.go.kr).",
        "Cyber Investigation Bureau, Korean National Police Agency — 182 (ecrm.police.go.kr).",
      ],
    },
    {
      heading: "Article 14 (Changes and Notice)",
      paragraphs: [
        "If this Policy is added to, deleted from, or amended, notice will be posted within the Service at least 7 days before the effective date, or at least 30 days before the effective date if a change materially affects User rights.",
        "When this Policy is amended, the version and effective date shown in this document will be updated, and earlier versions will remain listed under “Revision History” on this page.",
      ],
    },
    {
      heading: "Addendum and Operator Information",
      paragraphs: ["This Privacy Policy (version 1.2) takes effect on August 8, 2026."],
      bullets: operatorBulletsEn,
    },
  ],
};
