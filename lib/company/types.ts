/**
 * Company profile and submission package metadata for settings / export.
 * In production, persist securely and never store PII in client logs.
 */

export type AddressBlock = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type ContactPerson = {
  name: string;
  title: string;
  email: string;
  phone: string;
};

export type StagedFile = {
  id: string;
  name: string;
  sizeLabel: string;
  uploadedAt: string;
  kind: "w9" | "insurance_gl" | "insurance_eo" | "insurance_wc" | "insurance_umbrella" | "logo_primary" | "logo_wordmark" | "logo_secondary" | "other";
};

export type InsuranceLine = {
  id: string;
  /** GL, E&O, Workers' comp, umbrella, auto, cyber, etc. */
  typeLabel: string;
  carrier: string;
  policyNumber: string;
  coverageLimit: string;
  effectiveDate: string;
  expirationDate: string;
  fileId: string | null;
  notes: string;
};

export type NotarizedTemplate = {
  id: string;
  title: string;
  description: string;
  /** Body text; replace NAME / STATE / UEI with company merge fields. */
  body: string;
};

export type CompanyProfile = {
  /** Legal & identifiers */
  legalName: string;
  dba: string;
  ein: string;
  uei: string;
  cage: string;
  duns: string;
  stateOfIncorporation: string;
  entityType: string;
  yearEstablished: string;
  isSmallBusiness: boolean;
  socioEconomic: string;
  businessDescription: string;

  /** Addresses */
  hqSameAsRemit: boolean;
  headquarters: AddressBlock;
  remitTo: AddressBlock;
  performanceAddressNote: string;

  /** General contact & proposal */
  mainPhone: string;
  mainEmail: string;
  website: string;
  proposalPoc: ContactPerson;
  contractsPoc: ContactPerson;
  apRemitPoc: ContactPerson;

  /** NAICS / PSC */
  naicsPrimary: string;
  naicsCodes: string;
  pscCodes: string;

  /** W-9 & insurance (file refs) */
  w9FileId: string | null;
  w9FileName: string;
  w9AsOf: string;
  w9CurrentYear: boolean;
  insuranceLines: InsuranceLine[];

  /** Logos (file refs) — for covers and exports */
  logoPrimaryFileId: string | null;
  logoWordmarkFileId: string | null;
  logoSecondaryFileId: string | null;

  /** Staged files (session) */
  files: StagedFile[];

  /** Notarized / authority letter templates (editable) */
  notaryTemplates: NotarizedTemplate[];

  /** Branding for proposals */
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  coverSheetTagline: string;
  coverSheetSubtext: string;
  documentFooter: string;
};

export const emptyAddress = (): AddressBlock => ({
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
});

export const emptyContact = (): ContactPerson => ({
  name: "",
  title: "",
  email: "",
  phone: "",
});

function defaultNotaryTemplates(): NotarizedTemplate[] {
  return [
    {
      id: "t_cert_incumbency",
      title: "Secretary’s certificate of incumbency (signatory authority)",
      description:
        "Often required to show who may bind the offeror. Have notarized in the state of your corporate domicile or as required in Section L.",
      body: `STATE OF [STATE]\n\tCOUNTY OF [COUNTY]\n\nI, [NAME], [TITLE] of [LEGAL NAME] (“Company”), a [ENTITY TYPE] organized under the laws of [STATE], hereby certify that the following persons are duly elected or appointed officers of the Company, and the signatures that appear on company documents, including the proposal for RFP/contract number [INSERT], are true and have been made with full corporate authority in accordance with the Company’s [BYLAWS / OPERATING AGREEMENT / RESOLUTION DATED].\n\n[LIST NAME, TITLE, AND CAPACITY—e.g., President, Authorized Signer]\n\nI further certify that [LEGAL NAME] is in good standing in [STATE] as of the date hereof, to the best of my knowledge, based on [certificate of good standing / online verification].\n\nIN WITNESS WHEREOF, I have set my hand this ___ day of __________, 20__.\n\n_________________________________\n[NAME], [TITLE], Secretary\n[LEGAL NAME]`,
    },
    {
      id: "t_limited_poaa",
      title: "Limited power of attorney (proposal submission and representations)",
      description:
        "When your proposal requires a named agent to make representations, upload electronic submission, or accept Q&A. Tailor to your board / member approval requirements and state law.",
      body: `KNOW ALL BY THESE PRESENTS, that [LEGAL NAME] (“Company”), a [ENTITY TYPE] with principal office at [HQ ADDRESS], hereby authorizes the following person(s) to act on the Company’s behalf, solely in connection with federal procurement opportunities and related submissions:\n\nName: [NAME]\nTitle: [TITLE]\nUEI: [UEI] (reference only; Company remains offeror of record)\n\nAuthority includes: (1) preparing, signing, and submitting offers, quotes, and proposals; (2) making representations, certifications, and updates in the System for Award Management (SAM.gov) to the extent permitted to registered users on behalf of the Company; and (3) designating, in writing, a proposal manager for a specific RFP, not to exceed the scope approved by the Company’s [Board / members] on [DATE / RESOLUTION].\n\nThis power of attorney is limited to the matters above, shall not be deemed to transfer payment authority beyond what is set forth in the Company’s financial controls, and may be revoked in writing at any time with notice to affected agencies as required by FAR.\n\nExecuted this ___ day of __________, 20__, at [CITY, STATE].\n\n[COMPANY]                        By: ___________________________\nName: [OFFICER]\nTitle: [TITLE]`,
    },
    {
      id: "t_good_standing",
      title: "Certificate of good standing / authority to transact (jurisdiction block)",
      description:
        "Pre-filled language you can place above or with the certificate issued by the Secretary of State. Attach the state-issued good standing to your submission if Section L so requires.",
      body: `The undersigned, [NAME], [TITLE] of [LEGAL NAME], with UEI [UEI] and CAGE [CAGE], attests for purposes of the attached proposal that:\n\n(1) [LEGAL NAME] is validly existing and, where applicable, in good standing in [STATE OF INCORPORATION] as of the date of this statement; and is qualified to do business in [STATE(S) OF PERFORMANCE, IF APPLICABLE].\n\n(2) A copy of the [certificate of good standing / certificate of fact] issued by [STATE] Secretary of State, dated __________, is [attached as Exhibit A / available upon request] as required by the solicitation.\n\n(3) The Company is not, to the best of the undersigned’s knowledge, debarred, suspended, or proposed for debarment in SAM.gov, and is registered in SAM.gov in accordance with FAR.\n\nThis certificate is made solely for the purpose of the referenced procurement and may be relied upon by the government only to the extent permitted by law and the solicitation’s instructions.\n\nDate: __________\n\nBy: _________________________\n[NAME], [TITLE]`,
    },
  ];
}

const defaultProfile = (): CompanyProfile => ({
  legalName: "",
  dba: "",
  ein: "",
  uei: "",
  cage: "",
  duns: "",
  stateOfIncorporation: "",
  entityType: "Limited liability company (LLC)",
  yearEstablished: "",
  isSmallBusiness: true,
  socioEconomic: "",
  businessDescription: "",
  hqSameAsRemit: true,
  headquarters: emptyAddress(),
  remitTo: emptyAddress(),
  performanceAddressNote: "",
  mainPhone: "",
  mainEmail: "",
  website: "",
  proposalPoc: emptyContact(),
  contractsPoc: emptyContact(),
  apRemitPoc: emptyContact(),
  naicsPrimary: "",
  naicsCodes: "",
  pscCodes: "",
  w9FileId: null,
  w9FileName: "",
  w9AsOf: "",
  w9CurrentYear: true,
  logoPrimaryFileId: null,
  logoWordmarkFileId: null,
  logoSecondaryFileId: null,
  insuranceLines: [
    {
      id: "ins_gl",
      typeLabel: "Commercial general liability",
      carrier: "",
      policyNumber: "",
      coverageLimit: "",
      effectiveDate: "",
      expirationDate: "",
      fileId: null,
      notes: "",
    },
    {
      id: "ins_eo",
      typeLabel: "Professional / E&O (or equivalent)",
      carrier: "",
      policyNumber: "",
      coverageLimit: "",
      effectiveDate: "",
      expirationDate: "",
      fileId: null,
      notes: "",
    },
    {
      id: "ins_wc",
      typeLabel: "Workers’ compensation (and employers’ liability, if applicable)",
      carrier: "",
      policyNumber: "",
      coverageLimit: "Statutory / as required by state",
      effectiveDate: "",
      expirationDate: "",
      fileId: null,
      notes: "",
    },
  ],
  files: [],
  notaryTemplates: defaultNotaryTemplates(),
  brandPrimaryColor: "#0f172a",
  brandSecondaryColor: "#0d9488",
  coverSheetTagline: "",
  coverSheetSubtext: "",
  documentFooter: "",
});

export { defaultProfile, defaultNotaryTemplates };
