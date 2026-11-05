export type Emergency = "" | "notice" | "court" | "lockout" | "sheriff";
export type Service =
  "Legal representation" | "Advice" | "Financial assistance" | "Information";
export interface Preferences {
  city?: string;
  county?: string;
  issue?: string;
  stage?: string;
  help?: string;
  language?: string;
  emergency?: Emergency;
}
export interface Resource {
  id: string;
  name: string;
  description: string;
  type: string;
  state: string;
  city: string;
  url: string;
  verified: string;
  phone?: string;
  issues: string[];
  // null means unknown. An empty area list with statewide=false is not statewide.
  area: {
    statewide: boolean;
    cities: string[];
    counties: string[];
    regionCounty?: string;
  } | null;
  services: Service[] | null;
  languages: string[] | null;
  eligibility: string | null;
  availability: string | null;
  emergencies: Emergency[];
  evidence: string;
}
export interface Recommendation {
  resource: Resource;
  reasons: string[];
  cautions: string[];
  group: string;
  score: number;
}
const normalized = (value = "") => value.trim().toLocaleLowerCase();
const contains = (values: string[], value = "") =>
  !!value && values.some((item) => normalized(item) === normalized(value));
export function emergencyFor(input: Preferences): Emergency {
  if (input.emergency) return input.emergency;
  if (input.stage === "Sheriff notice to vacate") return "sheriff";
  if (
    ["Received court papers", "Upcoming hearing"].includes(input.stage || "") ||
    input.issue === "Court summons or eviction lawsuit"
  )
    return "court";
  if (["Illegal lockout", "Utility shutoff"].includes(input.issue || ""))
    return "lockout";
  return input.issue === "Eviction notice received" ? "notice" : "";
}
export function geographicMatch(resource: Resource, input: Preferences) {
  const area = resource.area;
  if (!area)
    return {
      eligible: true,
      points: 0,
      reason: "Service area unknown; confirm with the provider",
    };
  if (area.statewide)
    return {
      eligible: true,
      points: 10,
      reason: "California statewide resource",
    };
  if (contains(area.cities, input.city))
    return { eligible: true, points: 30, reason: "Serves your city" };
  if (contains(area.counties, input.county))
    return { eligible: true, points: 20, reason: "Serves your county" };
  // A listed city inside a county does not establish countywide coverage.
  if (
    (input.county && area.counties.length > 0 && area.cities.length === 0) ||
    input.city ||
    (input.county &&
      area.regionCounty &&
      normalized(input.county) !== normalized(area.regionCounty))
  ) {
    return { eligible: false, points: 0, reason: "" };
  }
  return {
    eligible: true,
    points: 0,
    reason: "Confirm your city is within the listed service area",
  };
}
export function recommendResources(
  resources: Resource[],
  input: Preferences = {},
): Recommendation[] {
  const emergency = emergencyFor(input);
  const recommendations: Recommendation[] = [];
  for (const resource of resources) {
    const geography = geographicMatch(resource, input);
    if (!geography.eligible) continue;
    const issueMatch = contains(resource.issues, input.issue);
    const emergencyMatch =
      !!emergency && resource.emergencies.includes(emergency);
    const general = resource.issues.length === 0;
    const legal = resource.type === "Legal aid";
    if (input.issue && !issueMatch && !emergencyMatch && !general && !legal)
      continue;
    const reasons = [geography.reason];
    const cautions: string[] = [];
    // Geography and issue relevance outweigh service and language preferences.
    let score = geography.points * 10 + (issueMatch ? 500 : 0);
    if (issueMatch) reasons.push("Relevant to your housing problem");
    // Court response instructions lead the urgent group when court papers are present.
    if (emergency === "court" && resource.id === "answer") score += 1000;
    if (emergencyMatch) {
      score += 40;
      reasons.push(
        emergency === "court"
          ? "Relevant to your court paperwork"
          : "Information for your urgent situation",
      );
    }
    if (input.help && resource.services?.includes(input.help as Service)) {
      score += 5;
      reasons.push("Offers " + input.help.toLocaleLowerCase());
    } else if (input.help) {
      cautions.push(
        resource.services === null
          ? "Services unknown; ask whether this provider can help"
          : "Your preferred service is not confirmed here",
      );
    }
    if (input.language && contains(resource.languages || [], input.language)) {
      score += 2;
      reasons.push("Offers services in your preferred language");
    } else if (input.language) {
      cautions.push(
        "Support in your preferred language is unverified; ask about interpretation",
      );
    }
    if (resource.eligibility) cautions.push(resource.eligibility);
    else
      cautions.push(
        "Eligibility restrictions unknown; confirm with the provider",
      );
    cautions.push(
      resource.availability ||
        "Current intake or funding availability is unknown",
    );
    const group = emergencyMatch
      ? "Emergency Assistance"
      : issueMatch
        ? "Recommended for Your Situation"
        : legal
          ? "Additional Legal Resources"
          : "General Tenant Information";
    recommendations.push({ resource, reasons, cautions, group, score });
  }
  // Always retain verified statewide legal and court referral directories as a fallback.
  for (const resource of resources.filter(
    (r) => ["legal-help", "self-help"].includes(r.id) && r.area?.statewide,
  )) {
    if (!recommendations.some((item) => item.resource.id === resource.id)) {
      recommendations.push({
        resource,
        reasons: ["California statewide referral directory"],
        cautions: [
          "Ask the directory provider for local help and confirm eligibility",
        ],
        group:
          resource.type === "Legal aid"
            ? "Additional Legal Resources"
            : "General Tenant Information",
        score: 0,
      });
    }
  }
  return recommendations.sort(
    (a, b) => b.score - a.score || a.resource.id.localeCompare(b.resource.id),
  );
}
