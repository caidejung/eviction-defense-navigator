# Eviction Defense Navigator

A free guide to tenant rights, court resources, and legal aid for California renters. The directory includes additional local services for Berkeley and a verified housing legal aid provider serving Berkeley, Oakland, Emeryville, and Alameda.

This site provides general legal information. It does not give legal advice, determine eligibility, create an attorney-client relationship, or calculate court deadlines.

## Use the website

1. Choose **Find help now**.
2. Choose your housing problem. You can also share your city, county, court-paper status, type of help needed, and preferred language.
3. Read the recommended resources and the explanation under each result.
4. Open a resource to see its source, review date, and contact details.
5. Print your checklist and resources if you want a copy.

City, county, ZIP, court-paper status, help type, and language are optional. The county fills in for a listed city. For other locations, you can enter the county or skip it. ZIP does not affect results. Court questions appear for eviction-related issues and remain available if you already answered them. Back and Edit answers keep your other answers.

Use **Library** to search without answering questions.

## Emergency help

**I Need Urgent Help** is in the shared navigation on every page. A short triage question helps you choose among four guides:

- An eviction notice from a landlord
- A summons or unlawful detainer lawsuit
- A lockout or utility shutoff
- A sheriff notice to vacate

Each guide includes ordered next steps, a document checklist, official guidance, and links to legal assistance. The guides have separate addresses, so you can move between them and keep checklist progress in the same tab.

The site asks users to confirm deadlines with the court or a qualified lawyer. Deadlines depend on the documents, service method, and applicable law. Contacting a provider does not pause a deadline. Intake, representation, and funding are never guaranteed.

## How recommendations work

The matching function is in `matching.ts`. It is independent of the page code.

1. Exclude a resource when its verified service area conflicts with the selected location.
2. Keep resources with unknown location details, with a notice to confirm their service area.
3. Match the housing issue and any court-paper or emergency situation.
4. Rank verified city and county coverage and issue relevance above service and language preferences.
5. Put official court-response instructions first when court papers are involved.
6. Keep statewide legal aid and court referral directories as fallback options.

Results are grouped into Emergency Assistance, Recommended for Your Situation, Additional Legal Resources, and General Tenant Information. Every recommendation explains why it appears. Open **Eligibility and availability** to see restrictions and unknown details.

The regular score gives 300 points for a verified city match, 200 for countywide coverage, 100 for a statewide resource, and 500 for an issue match. An urgent match adds 40, a requested service adds 5, and a verified language match adds 2. Court-response instructions receive an additional 1000 when court papers are involved. Groups control display order. Equal scores use resource IDs for stable ordering.

A provider serving a few cities in Alameda County is not labeled as serving the whole county. If only the county is known, a possible city-specific provider is shown with a request to confirm the city. Income and other individual eligibility requirements are disclosed for the provider to assess. We do not collect those personal details.

## Sources and unknown details

The existing directory is in `data.mjs`. `catalog.ts` adds service areas, service types, eligibility notes, and explicit unknown fields. Each entry keeps its source URL and review date.

The following sources were reviewed on November 4, 2026 for this update:

| Source                                                                                                | What it supports                                                                           |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [California Courts notice guide](https://selfhelp.courts.ca.gov/eviction-tenant/notice)               | Notices and the start of the court process                                                 |
| [California Courts response instructions](https://selfhelp.courts.ca.gov/eviction-tenant/respond)     | Responding, service-dependent deadlines, and local forms                                   |
| [California Courts after a lost case](https://selfhelp.courts.ca.gov/eviction-tenant/lose-case)       | Sheriff notices and asking about a stay of execution                                       |
| [California Attorney General lockout guidance](https://oag.ca.gov/system/files/media/2022-dle-05.pdf) | Unlawful landlord lockouts and utility shutoffs                                            |
| [East Bay Community Law Center housing services](https://ebclc.org/get-help/housing-services/)        | Housing advice and representation, four service cities, phone number, and income screening |

The checklists are general preparation suggestions, not filing requirements. Official sources provide the applicable instructions.

**Still unknown:** provider language support, current intake, funding availability, and individual eligibility. The directory does not claim a provider is accepting clients. A translated website is not proof of language services. Language preferences are supported by the matching engine, but no live provider is currently tagged with a verified language.

Before changing resource data, read the publisher’s page. Verify each new attribute and update its source and review date. Do not infer countywide coverage from an office address. Remove unverifiable claims or mark them unknown.

## Privacy

Answers and checklist progress stay in page memory. Refreshing clears them. **Clear my answers** on the privacy page also clears emergency checklist progress.

There are no accounts, uploads, analytics, AI requests, or storage of answers. No API keys are needed. Hosting services may log ordinary web requests. External sites have their own privacy practices. Browser history and printed copies can remain on shared devices.

## Run it on your computer

Install Node.js 24 or later and Git. Then run:

    git clone https://github.com/caidejung/eviction-defense-navigator.git
    cd eviction-defense-navigator
    npm ci
    npm run dev

Open the local address shown in the terminal. Press Ctrl+C to stop.

## Run the checks

    npm run lint
    npm run typecheck
    npm run test:unit
    npx playwright install chromium
    npm run test:e2e
    npm run build

`npm test` runs both test suites. Unit tests cover geography, urgency, issues, language, missing answers, unknown attributes, eligibility notes, fallback results, and triage.

Playwright runs the existing and new journeys at desktop and mobile sizes. It checks all emergency guides, keyboard entry, labels, optional fields, back navigation, checklists, privacy clearing, and horizontal overflow. GitHub Actions runs the checks on pushes to main and pull requests.

Some restricted macOS environments block Playwright from starting a browser. That is a browser-launch failure, not a passing test. For this update, the browser journeys were also run through the connected browser at 1280 × 800 and 375 × 812. This is a basic accessibility check, not a full WCAG audit.

## Deploy

Import the repository into Vercel and choose the Vite preset. Set the build command to `npm run build` and the output folder to `dist`. No environment variables are required.

## Main files

- `app.ts` — pages, questionnaire, and result display
- `matching.ts` — typed matching rules and explanations
- `catalog.ts` and `data.mjs` — source-backed resource data
- `emergency.ts` — emergency guide content and triage
- `emergency-ui.ts` — emergency pages and checklists
- `style.css` and `index.html` — styles and shared navigation
- `tests/` — matching and browser tests
