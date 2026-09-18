// ============================================================
// SCORING RUBRIC — weights are the single source of truth.
// Category max points sum to 100. This file has NO school data
// in it on purpose: data is fetched at runtime from
// /data/schools.json (see App.jsx), which is what automation
// jobs update. The rubric only changes when a human decides to
// change it.
// ============================================================

// Confirmed Builders (existing — unchanged)
export const RUBRIC = [
  { key: "financial", label: "Financial health & construction trigger", max: 35, color: "#2F5C8A" },
  { key: "demand", label: "Admissions & enrollment momentum", max: 20, color: "#6B4FA0" },
  { key: "housing", label: "Waitlist & housing pressure", max: 25, color: "#1D7A6B" },
  { key: "confirmation", label: "Signal confirmation", max: 20, color: "#B45A2E" },
];

// Compliance Pressure (new)
export const RUBRIC_COMPLIANCE = [
  { key: "mandateStrength", label: "Mandate strength", max: 35, color: "#2F6B3A" },
  { key: "deadlineProximity", label: "Deadline proximity", max: 25, color: "#6B4FA0" },
  { key: "fundingAttached", label: "Funding attached", max: 25, color: "#2F5C8A" },
  { key: "confirmation", label: "Signal confirmation", max: 15, color: "#B45A2E" },
];

// Newly Winnable (new)
export const RUBRIC_WINNABLE = [
  { key: "roleSeniority", label: "Role seniority", max: 30, color: "#6B4FA0" },
  { key: "windowFit", label: "Window fit", max: 30, color: "#1D7A6B" },
  { key: "recency", label: "Recency of change", max: 25, color: "#2F5C8A" },
  { key: "confirmation", label: "Signal confirmation", max: 15, color: "#B45A2E" },
];

// Reconfiguration Candidates (new — derived from existing fields, no new data)
export const RUBRIC_RECONFIG = [
  { key: "declineSeverity", label: "Enrollment decline severity", max: 40, color: "#A13030" },
  { key: "surplusSpace", label: "Surplus space signal", max: 35, color: "#1D7A6B" },
  { key: "confirmation", label: "Signal confirmation", max: 25, color: "#B45A2E" },
];

export function tierFor(total) {
  if (total >= 80) return "Top pick";
  if (total >= 60) return "Strong";
  if (total >= 40) return "Moderate";
  if (total >= 20) return "Caution";
  return "Quiet";
}

// Backward compatible: existing calls with one argument (scoreTotal(s.subscores))
// keep working exactly as before, defaulting to the original RUBRIC.
export function scoreTotal(subscores, rubric = RUBRIC) {
  return rubric.reduce((sum, r) => sum + subscores[r.key].score, 0);
}

// ============================================================
// Reconfiguration Candidates derivation.
// Reads a school's EXISTING demand/housing subscores + notes
// (already present in schools.json) and re-reads them through
// an inverted lens: weak demand + low occupancy/no waitlist
// pressure = surplus space = a reconfiguration opportunity,
// not a weakness. Does not mutate the source school object and
// does not require any new JSON fields.
// ============================================================
export function reconfigSubscoresFor(school) {
  const demand = school.subscores.demand;
  const housing = school.subscores.housing;

  // Lower existing demand score -> higher decline severity (inverted, out of 40).
  // demand.max in RUBRIC is 20, so scale 20 -> 40.
  const declineSeverity = Math.round((20 - demand.score) * (40 / 20));

  // Lower existing housing score -> more surplus space (inverted, out of 35).
  // housing.max in RUBRIC is 25, so scale 25 -> 35.
  const surplusSpace = Math.round((25 - housing.score) * (35 / 25));

  // Confirmation carried over from the existing confirmation subscore,
  // rescaled from its original max (20) to this rubric's max (25).
  const confirmation = Math.round(school.subscores.confirmation.score * (25 / 20));

  return {
    declineSeverity: { score: declineSeverity, note: `Derived from existing enrollment signal: "${demand.note}"` },
    surplusSpace: { score: surplusSpace, note: `Derived from existing housing signal: "${housing.note}"` },
    confirmation: { score: confirmation, note: school.subscores.confirmation.note },
  };
}