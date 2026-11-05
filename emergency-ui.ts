import {
  emergencyGuides,
  deadlineNotice,
  legalNotice,
  triageEmergency,
} from "./emergency";
import { resources } from "./catalog";
import { geographicMatch } from "./matching";
import type { Preferences } from "./matching";

const completed = new Set<string>();
let triageAnswer = "";
export function clearEmergencyProgress() {
  completed.clear();
  triageAnswer = "";
}
export function renderEmergency(
  main: HTMLElement,
  route: string,
  preferences: Preferences,
) {
  const guide = emergencyGuides.find((item) => route === "urgent/" + item.id);
  const navigation = `<nav class="emergency-links" aria-label="Emergency workflows">${emergencyGuides
    .map(
      (item) =>
        `<a href="#urgent/${item.id}" ${item === guide ? 'aria-current="page"' : ""}>${item.title}</a>`,
    )
    .join("")}</nav>`;
  const warning = `<p class="legal-notice">${legalNotice}</p>`;
  if (!guide) {
    main.innerHTML = `<span class="eyebrow">California emergency help</span><h1>Find your next urgent step.</h1>
      <p>If someone is in immediate danger or there is a fire or medical emergency, call <a href="tel:911">911</a>.</p>
      ${warning}<form id="triage"><fieldset><legend>What is happening right now?</legend>
      <p>If more than one applies, choose the sheriff notice first, then court papers. You can open any other guide afterward.</p>
      ${[
        ...emergencyGuides
          .slice()
          .reverse()
          .map((item) => [item.id, item.title]),
        ["", "I am unsure"],
      ]
        .map(
          ([id, title]) =>
            `<label><input type="radio" name="situation" value="${id}" ${triageAnswer === id ? "checked" : ""}>${title}</label>`,
        )
        .join("")}</fieldset><button>Show next steps →</button></form>
      <p id="triage-result" role="status"></p><h2>Or choose a guide</h2>${navigation}
      <p class="band">${deadlineNotice}</p>`;
    main.querySelector<HTMLFormElement>("#triage")!.onsubmit = (event) => {
      event.preventDefault();
      triageAnswer = String(
        new FormData(event.currentTarget as HTMLFormElement).get("situation") ||
          "",
      );
      const result = triageEmergency(triageAnswer);
      if (result) location.hash = "urgent/" + result;
      else
        main.querySelector("#triage-result")!.innerHTML =
          'You can ask a <a href="https://selfhelp.courts.ca.gov/self-help/find-self-help" rel="noreferrer">court self-help center</a> or <a href="https://selfhelp.courts.ca.gov/get-free-or-low-cost-legal-help" rel="noreferrer">legal aid provider</a> to identify your documents. Bring every page.';
    };
    return;
  }
  const provider = resources.find((resource) => resource.id === "ebclc")!;
  const localPossible = geographicMatch(provider, preferences).eligible;
  main.innerHTML = `<span class="eyebrow">California emergency help</span><h1>${guide.title}</h1>
    <p class="lead">${guide.explanation}</p>${warning}
    <div class="actions"><a class="btn" href="https://selfhelp.courts.ca.gov/get-free-or-low-cost-legal-help" rel="noreferrer">Contact legal aid now ↗</a><a href="#urgent">Change my situation</a></div>
    <section class="panel"><h2>What to do next</h2><ol class="next-steps">${guide.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section>
    <p class="band">${deadlineNotice}</p>
    <section class="panel"><h2>Documents to gather</h2><p>General preparation steps. You can contact legal aid before you have every document.</p>
    ${guide.documents
      .map((document, index) => {
        const id = guide.id + "-" + index;
        return `<label><input type="checkbox" data-emergency-task="${id}" ${completed.has(id) ? "checked" : ""}>${document}</label>`;
      })
      .join("")}
    <button id="print-emergency" class="secondary">Print this guide</button></section>
    <h2>Rights and legal help</h2><div class="grid">
      <article class="card"><h3>Official instructions</h3><a href="${guide.source}" rel="noreferrer">${guide.sourceLabel} ↗</a><p>Reviewed November 4, 2026. Follow the publisher’s current instructions.</p></article>
      <article class="card"><h3>Find local legal help</h3><a href="https://selfhelp.courts.ca.gov/get-free-or-low-cost-legal-help" rel="noreferrer">California Courts legal aid directory ↗</a><p>The directory links to local providers and contact information. Eligibility and current intake vary.</p><a href="https://selfhelp.courts.ca.gov/self-help/find-self-help" rel="noreferrer">Find your court self-help center ↗</a></article>
      ${localPossible ? `<article class="card"><h3>East Bay Community Law Center</h3><p>For tenants in Berkeley, Oakland, Emeryville, or Alameda. Income screening applies. Current intake and language support are unknown.</p><a href="tel:+15105484040">Call (510) 548-4040</a><p>Ask for the Housing team. If your situation is time-sensitive, also use the court and legal aid directories.</p><a href="${provider.url}" rel="noreferrer">Provider details and eligibility ↗</a></article>` : ""}
    </div><h2>Other urgent situations</h2>${navigation}`;
  main
    .querySelectorAll<HTMLInputElement>("[data-emergency-task]")
    .forEach((input) => {
      input.onchange = () => {
        if (input.checked) completed.add(input.dataset.emergencyTask!);
        else completed.delete(input.dataset.emergencyTask!);
      };
    });
  main
    .querySelector("#print-emergency")!
    .addEventListener("click", () => window.print());
}
