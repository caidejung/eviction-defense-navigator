// Each URL points to the publisher page used to verify this entry.
export const issues = [
  "Eviction notice received", "Court summons or eviction lawsuit", "Unable to pay rent",
  "Illegal lockout", "Landlord harassment", "Unsafe or unhealthy living conditions",
  "Security deposit dispute", "Rent increase", "Housing discrimination",
  "Repairs and maintenance", "Utility shutoff", "Other housing-related problems"
];
const [notice, court, rent, lockout, harassment, unsafe, deposit, increase, discrimination, repairs, utilities] = issues;

export const resources = [
  {
    id: "answer", name: "Respond to an eviction lawsuit", type: "Court self-help",
    description: "California Courts walks through the tenant response form, service methods, local forms, and where to get help completing an Answer.",
    url: "https://selfhelp.courts.ca.gov/eviction-tenant/respond", issues: [court]
  },
  {
    id: "notice", name: "Understand an eviction notice", type: "Court self-help",
    description: "Use the California Courts tenant guide to identify the paper you received and read about options at the notice stage.",
    url: "https://selfhelp.courts.ca.gov/eviction-tenant/notice", issues: [notice]
  },
  {
    id: "protection", name: "California tenant protections", type: "Tenant rights",
    description: "The Attorney General explains rent increases, deposits, housing conditions, retaliation, utility shutoffs, and landlord lockouts. Check the exceptions for your rental.",
    url: "https://oag.ca.gov/tenants", issues: [notice, increase, harassment, unsafe, repairs, utilities, lockout, deposit]
  },
  {
    id: "deposits", name: "Security deposit guide", type: "Tenant rights",
    description: "Read the California Courts explanation of deductions, refunds, and ways to address a disputed deposit.",
    url: "https://selfhelp.courts.ca.gov/guide-security-deposits-california", issues: [deposit]
  },
  {
    id: "fair-housing", name: "Fair housing and discrimination", type: "Government agency",
    description: "The California Civil Rights Department explains housing discrimination, disability accommodations, and how to start a complaint.",
    url: "https://calcivilrights.ca.gov/housing/", issues: [discrimination]
  },
  {
    id: "self-help", name: "Find your court self-help center", type: "Court self-help",
    description: "Search California Courts by city, county, or ZIP to locate self-help staff for people without a lawyer. Ask about local forms and hearing procedures.",
    url: "https://selfhelp.courts.ca.gov/self-help/find-self-help", issues: [notice, court, deposit]
  },
  {
    id: "legal-help", name: "Find free or low-cost legal help", type: "Legal aid",
    description: "Use the California Courts directory to find local nonprofit legal help and referral services. Each provider screens for the issues and clients it can serve.",
    url: "https://selfhelp.courts.ca.gov/get-free-or-low-cost-legal-help", issues: []
  },
  {
    id: "ebclc", city: "Berkeley", name: "East Bay Community Law Center", type: "Legal aid",
    description: "Call the Housing team for intake about eviction defense, Rent Board matters, or other tenant issues. The center checks residence and income before offering services.",
    phone: "(510) 548-4040", url: "https://ebclc.org/get-help/housing-services/", issues: []
  },
  {
    id: "rent-board", city: "Berkeley", name: "Berkeley Rent Board housing counseling", type: "Tenant rights",
    description: "Ask a counselor about local eviction and rent rules, petitions, or referrals. Counseling is free for questions about Berkeley rental units.",
    phone: "(510) 981-7368 ext. 1", url: "https://rentboard.berkeleyca.gov/services/housing-counseling", issues: [increase, notice, court, harassment]
  },
  {
    id: "retention", city: "Berkeley", name: "Berkeley Housing Retention Program", type: "Rental assistance",
    description: "Contact the Eviction Defense Center about short-term back-rent assistance. The city lists income, hardship, lease, and eviction notice requirements. Confirm current intake and funding with the administrator.",
    phone: "(510) 452-4541", url: "https://berkeleyca.gov/community-recreation/affordable-housing-berkeley/housing-retention-program", issues: [rent, notice, court]
  },
  {
    id: "inspections", city: "Berkeley", name: "Request a rental housing inspection", type: "Government agency",
    description: "Berkeley Housing Code Enforcement explains how to request an inspection when a landlord has not fixed reported safety problems. Online, mail, and in-person options are listed.",
    phone: "(510) 981-5444", url: "https://berkeleyca.gov/city-services/report-pay/tenant-request-housing-inspection", issues: [unsafe, repairs]
  }
].map(entry => ({ state: "California", city: "", verified: "2026-11-04", ...entry }));
