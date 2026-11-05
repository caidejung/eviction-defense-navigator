import { resources as originalResources } from "./data.mjs";
import type { Resource, Service, Emergency } from "./matching";
export { issues } from "./data.mjs";

export const cities = [
  "Berkeley",
  "Oakland",
  "Emeryville",
  "Alameda",
  "San Francisco",
  "Los Angeles",
  "Other California city",
];
export const cityCounties: Record<string, string> = {
  Berkeley: "Alameda",
  Oakland: "Alameda",
  Emeryville: "Alameda",
  Alameda: "Alameda",
  "San Francisco": "San Francisco",
  "Los Angeles": "Los Angeles",
};
export const helpTypes: Service[] = [
  "Legal representation",
  "Advice",
  "Financial assistance",
  "Information",
];
export const languages = [
  "English",
  "Spanish",
  "Chinese",
  "Vietnamese",
  "Tagalog",
  "Other language",
];
const emergencyTopics: Record<string, Emergency[]> = {
  answer: ["court"],
  notice: ["notice"],
  protection: ["notice", "lockout"],
  "self-help": ["court", "sheriff"],
  ebclc: ["notice", "court", "lockout", "sheriff"],
  "rent-board": ["notice", "court"],
  retention: ["notice", "court"],
};
export const resources: Resource[] = originalResources.map((entry) => ({
  ...entry,
  area: entry.city
    ? {
        statewide: false,
        cities: [entry.city],
        counties: [],
        regionCounty: "Alameda",
      }
    : { statewide: true, cities: [], counties: [] },
  services:
    entry.id === "ebclc"
      ? ["Advice", "Legal representation"]
      : entry.id === "retention"
        ? ["Financial assistance"]
        : entry.id === "rent-board"
          ? ["Advice"]
          : ["Information"],
  languages: null,
  eligibility:
    entry.id === "ebclc"
      ? "Residence and income screening apply. Income threshold and individual eligibility must be confirmed during intake."
      : entry.id === "retention"
        ? "The city lists income, hardship, lease, and eviction notice requirements. Ask the administrator to review them with you."
        : null,
  availability: null,
  emergencies: emergencyTopics[entry.id] || [],
  evidence: entry.url,
}));
// The provider lists these cities, not all of Alameda County.
// Source reviewed 2026-11-04: https://ebclc.org/get-help/housing-services/
const housingCenter = resources.find((resource) => resource.id === "ebclc")!;
housingCenter.area = {
  statewide: false,
  cities: ["Berkeley", "Oakland", "Emeryville", "Alameda"],
  counties: [],
  regionCounty: "Alameda",
};
housingCenter.city = "Berkeley, Oakland, Emeryville, Alameda";
housingCenter.issues = [
  "Eviction notice received",
  "Court summons or eviction lawsuit",
];
housingCenter.description =
  "Free housing legal advice and representation, including eviction defense. Call the Housing team for intake. The provider determines eligibility after assessment.";
