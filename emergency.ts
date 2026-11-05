import type { Emergency } from "./matching";
export interface EmergencyGuide {
  id: Exclude<Emergency, "">;
  title: string;
  explanation: string;
  steps: string[];
  documents: string[];
  source: string;
  sourceLabel: string;
}
export const emergencyGuides: EmergencyGuide[] = [
  {
    id: "notice",
    title: "I received an eviction notice",
    explanation:
      "A landlord notice asks you to take an action or leave. A notice can come before a court case. Read it carefully and get help understanding your options.",
    steps: [
      "Read every page and record when and how you received it. Keep the envelope and a photo of any posted notice.",
      "Contact legal aid promptly and ask someone to review the notice and the dates with you.",
      "Use the California Courts notice guide. If you also have a summons or complaint, open the court papers workflow.",
    ],
    documents: [
      "Notice and envelope",
      "Lease and any changes",
      "Rent receipts and payment records",
      "Messages with your landlord",
    ],
    source: "https://selfhelp.courts.ca.gov/eviction-tenant/notice",
    sourceLabel: "California Courts notice guide",
  },
  {
    id: "court",
    title: "I received court papers",
    explanation:
      "A summons and complaint for unlawful detainer mean the landlord has started an eviction case. The court has procedures for responding.",
    steps: [
      "Contact legal aid and the court self-help center promptly. Tell them you have eviction court papers and mention any hearing listed.",
      "Ask them to confirm the response deadline using your documents and how they were served.",
      "Review the official response instructions for filing, service, and local forms. Keep copies and any filing confirmations.",
    ],
    documents: [
      "Summons and complaint, including all attachments",
      "Service papers, envelopes, and delivery notes",
      "Hearing notices and prior court orders",
      "Lease, notices, and payment records",
    ],
    source: "https://selfhelp.courts.ca.gov/eviction-tenant/respond",
    sourceLabel: "California Courts response instructions",
  },
  {
    id: "lockout",
    title: "I face a lockout or utility shutoff",
    explanation:
      "California prohibits landlords from forcing tenants out through unlawful lockouts or utility shutoffs. An eviction notice alone does not authorize a landlord to remove you.",
    steps: [
      "If there is immediate danger, a fire, or a medical emergency, call 911. Otherwise, move to a safe place if needed.",
      "Contact housing legal aid promptly. Explain whether access or utilities have already been cut off.",
      "If safe, record what happened and keep photos and messages. Review the Attorney General guidance with your adviser.",
    ],
    documents: [
      "Lease or other proof of tenancy",
      "Photos of changed locks or utility conditions",
      "Utility bills and shutoff notices",
      "Messages, dates, and any incident reports",
    ],
    source: "https://oag.ca.gov/system/files/media/2022-dle-05.pdf",
    sourceLabel: "California Attorney General guidance on unlawful lockouts",
  },
  {
    id: "sheriff",
    title: "I received a sheriff notice to vacate",
    explanation:
      "A sheriff notice to vacate is part of enforcing an eviction court order. Get help reviewing the notice and your court case promptly.",
    steps: [
      "Contact legal aid and your court self-help center now. Tell them that you received a sheriff notice and read them the date and time shown.",
      "Ask whether any court procedure, such as a request for a stay of execution, is available in your case. The court decides whether to grant relief.",
      "Make a practical plan for essential medicines, identification, belongings, and a safe place to stay. Confirm any court decision with qualified assistance.",
    ],
    documents: [
      "Sheriff notice to vacate",
      "Judgment, writ, and other court orders",
      "Case number and hearing records",
      "Documents supporting any request for more time",
    ],
    source: "https://selfhelp.courts.ca.gov/eviction-tenant/lose-case",
    sourceLabel: "California Courts guidance after losing an eviction case",
  },
];
export const deadlineNotice =
  "Deadlines depend on the documents received, the method of service, and applicable law. This site does not calculate them. Ask the court self-help center or a qualified lawyer to confirm your next step promptly. Contacting a provider does not pause a deadline.";
export const legalNotice =
  "Legal information only. This site does not give legal advice or create an attorney-client relationship.";
export function triageEmergency(situation: string): Emergency {
  return emergencyGuides.some((guide) => guide.id === situation)
    ? (situation as Emergency)
    : "";
}
