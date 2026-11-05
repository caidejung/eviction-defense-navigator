import { test } from "node:test";
import assert from "node:assert/strict";
import {
  recommendResources,
  emergencyFor,
  geographicMatch,
} from "../matching.ts";
import { triageEmergency, emergencyGuides } from "../emergency.ts";
import { resources } from "../catalog.ts";

const ids = (input) =>
  recommendResources(resources, input).map((match) => match.resource.id);
const fixture = (overrides) => ({
  ...resources.find((resource) => resource.id === "ebclc"),
  id: "fixture",
  area: null,
  issues: [],
  services: null,
  languages: null,
  eligibility: null,
  emergencies: [],
  ...overrides,
});
test("city matches retain only the appropriate city services", () => {
  assert.ok(
    ids({ city: "Berkeley", issue: "Unable to pay rent" }).includes(
      "retention",
    ),
  );
  assert.ok(
    !ids({ city: "Oakland", issue: "Unable to pay rent" }).includes(
      "retention",
    ),
  );
  assert.ok(ids({ city: "Oakland" }).includes("ebclc"));
  assert.ok(!ids({ city: "Los Angeles" }).includes("ebclc"));
});
test("county matches never turn city coverage into countywide eligibility", () => {
  const ebclc = resources.find((resource) => resource.id === "ebclc");
  assert.ok(geographicMatch(ebclc, { county: "Alameda" }).eligible);
  assert.match(
    geographicMatch(ebclc, { county: "Alameda" }).reason,
    /Confirm your city/,
  );
  assert.equal(
    geographicMatch(ebclc, { county: "Los Angeles" }).eligible,
    false,
  );
  const county = fixture({
    area: { statewide: false, cities: [], counties: ["Alameda"] },
  });
  assert.equal(
    geographicMatch(county, { county: " alameda ", city: "Hayward" }).reason,
    "Serves your county",
  );
});
test("court paperwork leads to response instructions even when rent is the issue", () => {
  const result = recommendResources(resources, {
    city: "Berkeley",
    issue: "Unable to pay rent",
    stage: "Upcoming hearing",
  });
  assert.equal(result[0].resource.id, "answer");
  assert.ok(result[0].reasons.includes("Relevant to your court paperwork"));
  assert.equal(result[0].group, "Emergency Assistance");
});
test("nonemergency issues do not acquire urgency", () => {
  const result = recommendResources(resources, {
    issue: "Security deposit dispute",
  });
  assert.ok(result.some((match) => match.resource.id === "deposits"));
  assert.ok(result.every((match) => match.group !== "Emergency Assistance"));
  assert.ok(!result.some((match) => match.resource.id === "answer"));
});
test("unknown attributes do not silently remove a resource", () => {
  const result = recommendResources([fixture({})], {
    city: "Fresno",
    issue: "Rent increase",
    language: "Spanish",
    help: "Advice",
  });
  assert.equal(result.length, 1);
  assert.ok(result[0].cautions.some((text) => text.includes("unverified")));
  assert.ok(
    result[0].cautions.some((text) => text.includes("Services unknown")),
  );
});
test("language claims require an explicitly verified language", () => {
  const unknown = fixture({ id: "unknown" });
  const verified = fixture({ id: "verified", languages: ["Spanish"] });
  const result = recommendResources([unknown, verified], {
    language: "Spanish",
  });
  assert.equal(result[0].resource.id, "verified");
  assert.ok(
    result[0].reasons.includes("Offers services in your preferred language"),
  );
  assert.ok(
    !result[1].reasons.includes("Offers services in your preferred language"),
  );
  assert.ok(resources.every((resource) => resource.languages === null));
});
test("geography and issue relevance outweigh preferences", () => {
  const relevant = fixture({
    id: "relevant",
    issues: ["Repairs and maintenance"],
    area: { statewide: true, cities: [], counties: [] },
  });
  const preferred = fixture({
    id: "preferred",
    services: ["Advice"],
    languages: ["Spanish"],
  });
  assert.equal(
    recommendResources([preferred, relevant], {
      issue: "Repairs and maintenance",
      help: "Advice",
      language: "Spanish",
    })[0].resource.id,
    "relevant",
  );
});
test("skipped fields and no exact match retain statewide directories", () => {
  assert.ok(ids({}).includes("legal-help"));
  const result = ids({
    city: "Sacramento",
    county: "Sacramento",
    issue: "Unlisted problem",
  });
  assert.ok(result.includes("legal-help"));
  assert.ok(result.includes("self-help"));
  assert.ok(!result.includes("retention"));
});
test("known eligibility restrictions are disclosed without determining eligibility", () => {
  const ebclc = recommendResources(resources, { city: "Oakland" }).find(
    (item) => item.resource.id === "ebclc",
  );
  assert.ok(ebclc.cautions.some((text) => text.includes("income")));
  assert.ok(ebclc.cautions.some((text) => text.includes("unknown")));
});
test("emergency detection and all triage outcomes are stable", () => {
  for (const guide of emergencyGuides)
    assert.equal(triageEmergency(guide.id), guide.id);
  assert.equal(triageEmergency("unsure"), "");
  assert.equal(emergencyFor({ issue: "Utility shutoff" }), "lockout");
  assert.equal(
    emergencyFor({
      stage: "Sheriff notice to vacate",
      issue: "Illegal lockout",
    }),
    "sheriff",
  );
  assert.equal(emergencyFor({ issue: "Eviction notice received" }), "notice");
});
test("matching is deterministic and never changes input records", () => {
  const before = JSON.stringify(resources);
  const first = recommendResources(resources, { city: "Berkeley" });
  assert.deepEqual(first, recommendResources(resources, { city: "Berkeley" }));
  assert.equal(JSON.stringify(resources), before);
  assert.equal(
    new Set(first.map((item) => item.resource.id)).size,
    first.length,
  );
});
test("all live sources use secure publisher URLs and explicit metadata", () => {
  for (const resource of resources) {
    assert.equal(new URL(resource.url).protocol, "https:");
    assert.equal(resource.evidence, resource.url);
    assert.ok(resource.verified);
    assert.ok(
      "availability" in resource &&
        "eligibility" in resource &&
        "languages" in resource,
    );
  }
});
test("verified county-only coverage excludes a different known county", () => {
  const county = fixture({
    area: { statewide: false, cities: [], counties: ["Alameda"] },
  });
  assert.equal(
    geographicMatch(county, { county: "Sacramento" }).eligible,
    false,
  );
  assert.equal(geographicMatch(county, {}).eligible, true);
});
