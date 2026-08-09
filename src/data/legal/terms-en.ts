import { operator } from "./operator";
import type { LegalDocument } from "./types";

const operatorBulletsEn = [
  `Operator: ${operator.operatorName}`,
  `Contact email: ${operator.contactEmail}`,
  `Service URL: ${operator.siteUrl}`,
];

/** English counterpart of termsDocument. Version, dates, and operator facts stay aligned. */
export const termsDocumentEn: LegalDocument = {
  id: "terms",
  title: "Terms of Service",
  version: "1.0",
  effectiveDate: "2026-07-29",
  revisions: [
    { version: "1.0", effectiveDate: "2026-07-29", summary: "Initial publication" },
  ],
  sections: [
    {
      heading: "About these Terms",
      paragraphs: [
        "These Terms set out the rights, obligations, and responsibilities between each person who uses Arca (the “Service” and each such person a “User”) and the operator of the Service.",
        "The current version is 1.0 and takes effect on July 29, 2026. If these Terms are amended, advance notice will be provided as described in Article 3.",
        "Matters not addressed in these Terms are governed by applicable law and customary practice.",
      ],
    },
    {
      heading: "Article 1 (Purpose)",
      paragraphs: [
        "The purpose of these Terms is to establish the conditions and procedures for using the tarot card readings and related features provided by the Service, as well as the rights and obligations of the operator and Users.",
      ],
    },
    {
      heading: "Article 2 (Definitions)",
      paragraphs: ["The following definitions apply in these Terms."],
      bullets: [
        '“Service” means the web service provided by the operator under the name Arca and all features associated with it.',
        '“User” means anyone who uses the Service under these Terms, including anyone who uses it without signing in.',
        '“Account” means a means of identifying a User created through Kakao or Google social login.',
        '“Reading” means the feature that randomly draws one or more of 78 tarot cards and displays an interpretation in the language served to the User, based on whether each card is upright or reversed and on the topic selected by the User.',
        '“Collection” means the feature that gathers and displays cards a User has encountered in Readings.',
        '“Journal” means records that a User writes and saves by date.',
        '“Deck” means a set of artwork for 78 cards.',
      ],
    },
    {
      heading: "Article 3 (Effect and Amendment of these Terms)",
      paragraphs: [
        "These Terms take effect when posted within the Service. By using the Service, a User is deemed to have agreed to these Terms.",
        "The operator may amend these Terms to the extent permitted by applicable law. If amended, the changes and effective date will be posted within the Service at least 7 days before the effective date, or at least 30 days before the effective date if the amendment is materially adverse to Users or otherwise significant.",
        "If a User continues to use the Service without objecting by the effective date of the amended Terms, the User is deemed to have agreed to the amendment. A User who does not agree may stop using the Service.",
        "When these Terms are amended, the version and effective date shown in this document will be updated, and earlier versions will remain listed under “Revision History” on this page.",
      ],
    },
    {
      heading: "Article 4 (The Service)",
      paragraphs: [
        "The Service currently has no payment feature. All features are available free of charge, and the operator will not charge Users under any description.",
        "The operator provides the following features. Some features may still be in preparation; where that is the case, the Service will say so on screen.",
      ],
      bullets: [
        "Tarot card readings: randomly drawing from 78 tarot cards.",
        "Interpretations: displaying interpretations based on whether a drawn card is upright or reversed and on the User's selected topic (Today, Love, Work, Self, Health, or Money).",
        "Collection: gathering cards encountered in Readings and displaying them by Deck.",
        "Journal: keeping each day's Reading together with the User's own dated notes so they can be viewed again.",
        "Account sync: for signed-in Users, keeping the records above with the Account so they can be continued on multiple devices.",
      ],
    },
    {
      heading: "Article 5 (Nature and Limits of Tarot Interpretations)",
      paragraphs: [
        "Every tarot card interpretation provided by the Service is for entertainment and personal reflection. This is the most important provision of these Terms, and Users should read it before using the Service.",
        "Cards are drawn at random and the interpretations are written in advance. The Service does not know, predict, or verify any fact about a User's past, present, or future.",
        "The Service's interpretations are not medical or health advice, legal advice, financial or investment advice, tax advice, career advice, or any other professional advice. Decisions concerning health, law, or money should be discussed with an appropriately qualified professional. In particular, do not make or postpone any decision about treatment, medication, or other medical care on the basis of an interpretation from the Service.",
        "The Service does not guarantee any outcome. The operator is not responsible for decisions a User makes in reliance on an interpretation or for resulting consequences.",
        "If you are experiencing emotional or psychological distress, please do not rely on an interpretation from the Service; seek help from an appropriate professional support service.",
      ],
    },
    {
      heading: "Article 6 (Accounts and Sign-in)",
      paragraphs: [
        "The Service may be used without signing in. In that case, the User's records are stored only in the browser on the device being used and are not sent to the server.",
        "A User may create an Account and sign in through Kakao or Google social login. The operator does not create or retain a separate username or password.",
        "Each User is responsible for managing their own Account and may not transfer or lend it to another person.",
        "Signing out deletes Reading records, Journal entries, and entitlement information stored in the browser on that device. Records saved and synchronized to the server before sign-out remain linked to the Account and will load when the User signs in again.",
        "A User may stop using the Service at any time.",
        "Account deletion is not currently available directly within the Service. A User may request deletion through the contact email in Article 15. Within 7 days after receiving the request, the operator will delete the Account and its linked Reading records, Collection, Journal entries, and entitlement information, and will reply with the result. Information that must be retained by law will be kept for the required period and then deleted.",
        "Once Account deletion has been completed, records held in the Account cannot be restored. Users should review any records they wish to keep before requesting deletion.",
      ],
    },
    {
      heading: "Article 7 (Records Stored on a Device)",
      paragraphs: [
        "The Service stores Reading records, Journal entries, the selected Deck and topic, and similar settings in the User's browser local storage. While the User is not signed in, this information does not leave the device.",
        "Records may not persist or may be lost if browser data is cleared, private browsing is used, or the User changes browser or device. The operator is not responsible for loss of records that were stored only on a device while the User was signed out.",
        "Users who want to keep records for longer or continue them across devices should sign in.",
      ],
    },
    {
      heading: "Article 8 (User Obligations and Prohibited Conduct)",
      paragraphs: ["Users must comply with applicable law and these Terms and must not engage in any of the following conduct."],
      bullets: [
        "Misappropriating another person's Account or using another person's personal information without authorization.",
        "Copying, distributing, transmitting, publishing, or distributing derivative works from interpretations, card artwork, wording, or other Service content without the operator's prior consent.",
        "Repeatedly accessing the Service through automated means or collecting data in bulk, including by crawling or scraping.",
        "Reverse engineering Service source code or bypassing normal procedures to obtain entitlements or other information improperly.",
        "Placing excessive load on servers or networks or interfering with stable operation of the Service.",
        "Using the Service to deceive another person or presenting an interpretation as professional advice in a way that causes harm.",
        "Any other conduct that violates applicable law or accepted public morals.",
      ],
    },
    {
      heading: "Article 9 (Copyright in Content)",
      paragraphs: [
        "Copyright and other intellectual property rights in content provided by the Service—including the written interpretations for 78 cards, topic-specific and reversed interpretations, Deck artwork, interface wording, and design—belong to the operator or another lawful rights holder.",
        "Users may use content personally and non-commercially while using the Service. Content may not be copied, distributed, sold, or used commercially without the operator's prior written consent.",
        "The traditional symbolic system of tarot itself is not owned by any one person. The rights described in this Article apply to expression written or produced for the Service.",
      ],
    },
    {
      heading: "Article 10 (Rights in User-Written Records)",
      paragraphs: [
        "A User retains copyright in text they personally write in the Journal. The operator claims no rights in a User's Journal entries.",
        "The operator stores and processes Journal entries only as needed to retain them and show them back to that User. Journal entries are not used for promotion, advertising, analytics, public disclosure, artificial-intelligence training, or any other purpose.",
        "A User may edit or delete a Journal entry at any time.",
      ],
    },
    {
      heading: "Article 11 (Advertising)",
      paragraphs: [
        "The operator may display advertisements within the Service to operate and maintain it. By using the Service, Users agree that advertisements may be displayed.",
        "Advertisements are provided through third-party advertising providers, including Google AdSense, and cookies or similar technologies may be used in the process. The Privacy Policy explains what information is used and how to opt out of personalized advertising.",
        "The location and format of advertisements and the advertising provider may change according to operational needs. These changes fall within the scope already described in this Article and therefore do not require separate consent each time. If the categories or purposes of information processed for advertising change, advance notice will be provided under Article 3.",
        "The operator is not responsible for transactions between a User and an advertiser or for the content of an advertisement, except where damage is caused by the operator's willful misconduct or gross negligence.",
      ],
    },
    {
      heading: "Article 12 (Changes, Suspension, and Discontinuation)",
      paragraphs: [
        "The operator may change Service content, screens, and features to improve the Service. Advance notice will be given of a material change that is adverse to Users.",
        "The operator may temporarily suspend all or part of the Service where unavoidable circumstances arise, including equipment inspection or replacement, system failure, interruption of communications, or natural disaster. Notice will be given in advance where practicable and afterward where advance notice is not possible.",
        "The operator may discontinue the Service. In that event, notice will be given at least 30 days before discontinuation, together with a way for Users to review or download their records.",
      ],
    },
    {
      heading: "Article 13 (Limitation of Liability)",
      paragraphs: [
        "The operator is not responsible for interruption of the Service caused by circumstances outside the operator's responsibility, including natural disaster, power failure, network failure, or a problem with a User's device.",
        "The operator is not responsible for a decision a User makes in reliance on an interpretation or for the outcome of that decision (Article 5).",
        "The operator is not responsible for the loss of records stored only on a device while a User was signed out, or for loss caused when a User clears browser data.",
        "This Article does not exclude liability for damage caused by the operator's willful misconduct or gross negligence and does not restrict consumer rights provided by applicable law.",
      ],
    },
    {
      heading: "Article 14 (Governing Law and Jurisdiction)",
      paragraphs: [
        "These Terms and use of the Service are governed by the laws of the Republic of Korea.",
        "If a dispute arises between the operator and a User regarding the Service, both parties will confer in good faith to seek an amicable resolution. If no resolution is reached and proceedings are brought, they must be brought before the court having jurisdiction under the Civil Procedure Act of the Republic of Korea.",
      ],
    },
    {
      heading: "Article 15 (Operator Information and Contact)",
      paragraphs: [
        "Questions about the Service may be sent to the contact below.",
        "Arca does not sell goods or services and is therefore not subject to mail-order business registration. Accordingly, it has no business registration number or mail-order registration number.",
        "Email sent to the address below will be received by the operator.",
      ],
      bullets: operatorBulletsEn,
    },
    {
      heading: "Addendum",
      paragraphs: ["These Terms (version 1.0) take effect on July 29, 2026."],
    },
  ],
};
