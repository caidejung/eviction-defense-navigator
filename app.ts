import {
  issues,
  resources,
  cities,
  cityCounties,
  helpTypes,
  languages,
} from "./catalog";
import { recommendResources, emergencyFor, geographicMatch } from "./matching";
import { renderEmergency, clearEmergencyProgress } from "./emergency-ui";
type Resource = (typeof resources)[number];
const main = document.querySelector<HTMLElement>("main")!;
const cityOptions = cities;
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
const option = (values: string[], selected = "") =>
  values
    .map((v) => `<option ${v === selected ? "selected" : ""}>${v}</option>`)
    .join("");
const link = (route: string, label: string) =>
  `<a class="btn" href="#${route}">${label}</a>`;
const heading = (section: string, title: string, description = "") =>
  `<span class="eyebrow">${section}</span><h1>${title}</h1><p class="lead">${description}</p>`;
const card = (r: Resource, explanation = "") =>
  `<article class="card"><small>${r.type} · ${r.city || r.state}</small><h3><a href="#resource/${r.id}">${r.name}</a></h3><p>${r.description}</p>${explanation}<a href="${r.url}" rel="noreferrer">Visit ${new URL(r.url).hostname} ↗</a></article>`;
const cards = (rows: Resource[]) =>
  `<div class="grid">${rows.map((row) => card(row)).join("")}</div>`;
const initial = () => ({
  city: "",
  county: "",
  issue: "",
  zip: "",
  stage: "",
  help: "",
  language: "",
  complete: false,
});
let answers = initial(),
  step = 1;
const checked = new Set<string>();
const courtStages = ["Received court papers", "Upcoming hearing"];
const stages = ["No court papers", ...courtStages, "Unsure"];
function recommendations() {
  const matches = recommendResources(resources, answers);
  const groups = [
    "Emergency Assistance",
    "Recommended for Your Situation",
    "Additional Legal Resources",
    "General Tenant Information",
  ];
  const exact = matches.some((match) =>
    match.reasons.includes("Relevant to your housing problem"),
  );
  return `<p>Location and housing issue come first. Service and language preferences help order the results. Providers confirm eligibility.</p>
    ${exact ? "" : '<p class="band">No exact issue match was found. Start with these statewide directories and ask for local housing legal aid.</p>'}
    ${groups
      .map((group) => {
        const items = matches.filter((match) => match.group === group);
        if (!items.length) return "";
        return `<section><h2>${group}</h2><div class="grid">${items
          .map((match) =>
            card(
              match.resource,
              `<h4>Why this is listed</h4><ul>${match.reasons.map((reason) => `<li>${escape(reason)}</li>`).join("")}</ul>
          <details><summary>Eligibility and availability</summary><ul>${match.cautions.map((caution) => `<li>${escape(caution)}</li>`).join("")}</ul><a href="${match.resource.evidence}" rel="noreferrer">Source for these details</a></details>`,
            ),
          )
          .join("")}</div></section>`;
      })
      .join("")}`;
}
function find() {
  const courtRelevant =
    !!answers.stage ||
    [
      issues[0],
      issues[1],
      issues[2],
      issues[3],
      issues[4],
      issues[10],
      issues[11],
    ].includes(answers.issue);
  const select = (
    label: string,
    name: string,
    values: string[],
    selected: string,
  ) =>
    `<label for="field-${name}">${label}</label><select id="field-${name}" name="${name}"><option value="">Skip for now</option>${option(values, selected)}</select>`;
  const countyKnown = cityCounties[answers.city];
  const fields =
    step === 1
      ? `<label>State<select name="state"><option>California</option></select></label>
       ${select("City", "city", cityOptions, answers.city)}
       <label>County (optional)<input name="county" maxlength="60" value="${escape(answers.county)}" ${countyKnown ? "readonly" : ""}></label>
       <p id="county-help">${countyKnown ? "County follows the selected city." : "Enter the county name without the word County, or leave it blank."}</p>
       <label>ZIP code (optional)<input name="zip" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" title="Enter five digits" value="${escape(answers.zip)}"></label>
       <p>Location is optional. ZIP does not affect matching.</p>`
      : step === 2
        ? `<label for="issue">Housing problem</label><select id="issue" required name="issue"><option value="">Choose the closest match</option>${option(issues, answers.issue)}</select>`
        : `${courtRelevant ? select("Have you received court papers or scheduled a hearing? (optional)", "stage", stages.concat("Sheriff notice to vacate"), answers.stage) : "<p>Court questions are skipped for this issue. Urgent help is always available above.</p>"}
         ${select("Type of help needed (optional)", "help", helpTypes, answers.help)}
         ${select("Preferred language (optional)", "language", languages, answers.language)}
         <p>These preferences are optional. Language support and current availability must be confirmed with providers.</p>`;
  main.innerHTML =
    heading(
      "Find help · Step " + step + " of 3",
      [
        "Where do you rent?",
        "What brings you here?",
        "What help would you like?",
      ][step - 1],
    ) +
    `<form><progress aria-label="Questionnaire progress" value="${step}" max="3"></progress>${fields}<div class="actions">
       ${step > 1 ? '<button type="button" class="secondary" id="back">Back</button>' : ""}
       <button>${step === 3 ? "Show my resources" : "Continue"} →</button></div></form>`;
  const form = main.querySelector("form")!;
  // Capture edits as they happen so browser navigation and Back preserve progress.
  form.oninput = () => {
    const values = new FormData(form);
    for (const key of [
      "city",
      "county",
      "zip",
      "issue",
      "stage",
      "help",
      "language",
    ] as const) {
      if (values.has(key)) answers[key] = String(values.get(key));
    }
  };
  form
    .querySelector<HTMLSelectElement>("[name=city]")
    ?.addEventListener("change", () => {
      const county = form.querySelector<HTMLInputElement>("[name=county]")!;
      answers.county = cityCounties[answers.city] || "";
      county.value = answers.county;
      county.readOnly = !!cityCounties[answers.city];
      main.querySelector("#county-help")!.textContent = county.readOnly
        ? "County follows the selected city."
        : "Enter the county name without the word County, or leave it blank.";
    });
  form.onsubmit = (event) => {
    event.preventDefault();
    if (step === 3) {
      answers.complete = true;
      location.hash = "results";
      return;
    }
    step++;
    render();
  };
  form
    .querySelector<HTMLButtonElement>("#back")
    ?.addEventListener("click", () => {
      step--;
      render();
    });
}
function directory(rights: boolean) {
  const base = resources.filter(
    (r) =>
      !rights ||
      ["Tenant rights", "Government agency", "Court self-help"].includes(
        r.type,
      ),
  );
  const filter = (name: string, items: string[]) =>
    `<label for="filter-${name}">${name}</label><select id="filter-${name}" name="${name}"><option value="">All</option>${option(items)}</select>`;
  main.innerHTML =
    heading(
      "Tenant field guide",
      rights ? "Know your rights" : "Resource library",
      rights
        ? "Choose a topic to read guidance from courts and public agencies."
        : "Search sources by topic, organization, or service. Berkeley searches also include California resources.",
    ) +
    `<section class="panel"><label>Search resources<input type="search" name="search"></label><div class="fields">${filter("State", ["California"])}${filter("City", cityOptions)}${filter("Issue", issues)}${filter("Type", [...new Set(base.map((r) => r.type))])}</div></section><p id="count" role="status"></p><div id="list"></div>`;
  const value = (name: string) =>
    main.querySelector<HTMLInputElement>(`[name="${name}"]`)!.value;
  function update() {
    const rows = base.filter(
      (r) =>
        (!value("State") || r.state === value("State")) &&
        (!value("City") ||
          geographicMatch(r, { city: value("City") }).eligible) &&
        (!value("Issue") ||
          r.issues.includes(value("Issue")) ||
          !r.issues.length) &&
        (!value("Type") || r.type === value("Type")) &&
        [r.name, r.description, r.type, r.city, r.url, ...r.issues]
          .join(" ")
          .toLowerCase()
          .includes(value("search").trim().toLowerCase()),
    );
    main.querySelector("#count")!.textContent =
      rows.length + " resources found";
    main.querySelector("#list")!.innerHTML = rows.length
      ? cards(rows)
      : "<p>Try a broader search or clear a filter.</p>";
  }
  main.querySelector(".panel")!.addEventListener("input", update);
  update();
}
function render(focusMain = true) {
  const route = location.hash.slice(1) || "home";
  if (route === "main") {
    main.focus();
    return;
  }
  switch (route) {
    case "home":
      main.innerHTML = `<section class="hero"><div>${heading("Housing justice  /  California", "Find your next step as a renter.", "Facing eviction or a problem with your home? Find court guides, tenant protections, and people who can help where you live.")}<div class="actions">${link("find", "Find help now →")}<a href="#library">Explore the library</a></div><small>Free to use · No account needed</small></div><aside><svg viewBox="0 0 300 140" aria-hidden="true" fill="none" stroke="#176253" stroke-width="3"><circle cx="222" cy="32" r="19" fill="#eed597" stroke="none"/><path fill="#a3ccba" d="M24 124V72l45-34 45 34v52z"/><path fill="#f7f2dd" d="M100 124V48l48-31 48 31v76z"/><path fill="#82baa7" d="M183 124V77l46-33 46 33v47z"/><path d="M14 125h272M57 124V88h23v36m54-2V88h26v34m58 0V92h20v30M126 55h13v15h-13zm32 0h13v15h-13z"/></svg><p class="eyebrow">Current coverage</p><h2>California &amp; Berkeley</h2><p>Statewide guidance with additional local services for Berkeley renters.</p></aside></section><div class="band"><strong>Received court papers or facing a lockout?</strong> <a href="#urgent">I need urgent help →</a></div><h2>Where would you like to start?</h2><div class="grid">${[
        [
          "01",
          "Find help",
          "Answer three questions to see resources for your situation.",
          "find",
        ],
        [
          "02",
          "Know your rights",
          "Read guidance on notices, repairs, deposits, and more.",
          "rights",
        ],
        [
          "03",
          "Resource library",
          "Browse courts, agencies, and legal aid providers.",
          "library",
        ],
      ]
        .map(
          ([n, t, d, r]) =>
            `<article class="card"><small>${n} / TENANT GUIDE</small><h3><a href="#${r}">${t}</a></h3><p>${d}</p></article>`,
        )
        .join("")}</div>`;
      break;
    case "find":
      find();
      break;
    case "library":
    case "rights":
      directory(route === "rights");
      break;
    case "results": {
      if (!answers.complete) {
        main.innerHTML =
          heading(
            "Your resources",
            "Start with your situation.",
            "Complete the three questions to build your resource list. Refreshing clears your answers.",
          ) + link("find", "Find help now");
        break;
      }
      const court = ["court", "sheriff"].includes(emergencyFor(answers));
      const tasks = [
        "Keep a copy of notices, your lease, and relevant messages.",
        court
          ? "Record the court name, case number, hearing details, and dates shown on your papers."
          : "Record dates and gather rental records related to your issue.",
        court
          ? "Ask the court self-help center about responding and attending your hearing."
          : "Review the resources below for your housing problem.",
        "Ask a legal aid provider about intake and eligibility.",
      ];
      main.innerHTML =
        heading(
          "Your resources",
          answers.issue,
          escape(
            [answers.city || answers.county || "California", answers.stage]
              .filter(Boolean)
              .join(" · "),
          ),
        ) +
        `<p>Matched by service area and housing issue. General legal aid is included.</p>${court ? '<p class="band"><a href="#urgent">View urgent court help</a></p>' : ""}${recommendations()}<section class="panel"><h2>Your preparation checklist</h2><p>General preparation steps. A qualified adviser can explain which legal requirements apply to you.</p>${tasks.map((t) => `<label><input type="checkbox" data-task="${escape(t)}" ${checked.has(t) ? "checked" : ""}>${t}</label>`).join("")}<div class="actions"><button id="print">Print checklist and resources</button><a href="#find" id="edit">Edit answers</a></div></section>`;
      main.querySelectorAll<HTMLInputElement>("[data-task]").forEach(
        (el) =>
          (el.onchange = () => {
            if (el.checked) checked.add(el.dataset.task!);
            else checked.delete(el.dataset.task!);
          }),
      );
      main
        .querySelector("#print")!
        .addEventListener("click", () => window.print());
      main.querySelector("#edit")!.addEventListener("click", () => (step = 1));
      break;
    }
    case "urgent":
    case "urgent/notice":
    case "urgent/court":
    case "urgent/lockout":
    case "urgent/sheriff":
      renderEmergency(main, route, answers);
      break;
    case "about":
      main.innerHTML =
        heading(
          "About the project",
          "A starting point for tenants.",
          "Eviction Defense Navigator connects renters with public information and qualified assistance.",
        ) +
        "<h2>How matching works</h2><p>We include sources serving your chosen city or state and tagged for your issue. Court papers or a hearing add court-response resources. General legal aid remains available for every issue. Providers determine eligibility.</p><h2>Coverage and review</h2><p>The pilot covers California, with additional resources for Berkeley. Each directory entry links to its publisher and shows the date reviewed. Check with providers for availability.</p>" +
        link("library", "Browse the directory");
      break;
    case "privacy":
      main.innerHTML =
        heading("Privacy & disclaimer", "Your answers stay in this tab.") +
        '<p>The questionnaire keeps answers in page memory. Reloading clears your answers and checklist. We do not request names, street addresses, uploads, or account details. There are no analytics, cookies, or AI requests in the application.</p><p>Your host may log ordinary web requests such as IP addresses. Following a source link takes you to a separate website with its own privacy policy. Browser history and printed copies may remain on a shared device.</p><h2>Legal information</h2><p>This project provides general legal information and resource navigation. It does not provide individualized legal advice or create an attorney-client relationship. A qualified lawyer can advise you on your situation and deadlines.</p><button id="clear">Clear my answers</button><p role="status"></p>';
      main.querySelector("#clear")!.addEventListener("click", () => {
        answers = initial();
        step = 1;
        checked.clear();
        clearEmergencyProgress();
        main.querySelector("[role=status]")!.textContent =
          "Your answers and checklist have been cleared.";
      });
      break;
    default: {
      const r = resources.find((r) => "resource/" + r.id === route);
      main.innerHTML = r
        ? heading(r.type, r.name, r.description) +
          `<section class="panel"><p><strong>Service area</strong> · ${r.city || r.state}</p><p><strong>Topics</strong> · ${r.issues.join(", ") || "General housing legal assistance"}</p>${r.phone ? `<p>Phone · ${r.phone}</p>` : ""}<p>Eligibility · ${r.eligibility || "Unknown; confirm with the provider"}</p><p>Language support · ${r.languages?.join(", ") || "Unknown"}</p><p>Current intake or funding · ${r.availability || "Unknown"}</p><p>Publisher · ${new URL(r.url).hostname}<br>Last reviewed · ${r.verified}</p><a class="btn" rel="noreferrer" href="${r.url}">Open official source ↗</a></section>`
        : heading("Navigation", "Page unavailable") +
          link("home", "Return home");
    }
  }
  document.title =
    (main.querySelector("h1")?.textContent || "Home") +
    " | Eviction Defense Navigator";
  if (focusMain) main.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => render());
document.querySelector<HTMLAnchorElement>(".skip")!.onclick = (e) => {
  e.preventDefault();
  main.focus();
};
render(false);
