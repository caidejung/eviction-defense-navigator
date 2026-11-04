# Eviction Defense Navigator

A free guide to tenant rights, court resources, and legal aid for California renters. Berkeley renters can also find local housing services. The site provides general legal information. It cannot give legal advice or calculate filing deadlines.

## Use the website

1. Choose **Find help now**.
2. Select your city and housing problem. Tell the navigator if you have court papers or a hearing.
3. Open a suggested resource to see who provides it, when we checked it, and how to get help.
4. Use **Print checklist and resources** to keep a copy or save a PDF.

Choose **Urgent help** for court papers, lockouts, or immediate safety concerns. Use **Library** to search without answering questions. Answers stay in the current tab. Refresh the page to clear them.

## Run it on your computer

Install Node.js 22.12 or later and Git. Open a terminal and run:

    git clone https://github.com/caidejung/eviction-defense-navigator.git
    cd eviction-defense-navigator
    npm ci
    npm run dev

Open the local address printed in the terminal. Press Ctrl+C to stop. Before the feature branch is merged, run `git switch feature/tenant-navigator` before `npm ci`.

## Update the directory

Edit `data.mjs`. Each entry has a name, description, source link, location, housing topics, and review date. Read the publisher’s page before changing an entry. Check the service area, phone number, and eligibility details. Only update the review date after checking the source. Remove a listing from the directory if you cannot verify it.

An empty city means statewide coverage. An empty topic list means general help. Results include resources for the selected issue plus general legal aid. Court papers or an upcoming hearing add court-response resources. The optional ZIP code does not determine eligibility. Providers decide who they can serve and whether funding is available.

## Check your changes

    npm run lint
    npm run typecheck
    npx playwright install chromium
    npm test
    npm run build

The browser tests use desktop and mobile screen sizes. If Google Chrome is installed, you can use `CHROME_CHANNEL=chrome npm test` instead of downloading Chromium.

## Deploy

Import this repository into Vercel and choose the Vite preset. Use `npm run build` as the build command and `dist` as the output folder. No API keys, accounts for renters, or environment variables are required. Use a feature branch for a preview before publishing the main branch.

## Where to make changes

- `app.ts` — pages, questionnaire, and matching rules
- `data.mjs` — verified resource directory
- `style.css` — layout, colors, and print styles
- `index.html` — shared navigation and footer
- `tests/` — browser checks
