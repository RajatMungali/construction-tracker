// ============================================================
// SCORING RUBRIC — weights are the single source of truth.
// Category max points sum to 100. This file has NO school data
// in it on purpose: data is fetched at runtime from
// /data/schools.json (see App.jsx), which is what automation
// jobs update. The rubric only changes when a human decides to
// change it.
// ============================================================
export const RUBRIC = [
  { key: "financial", label: "Financial health & construction trigger", max: 35, color: "#2F5C8A" },
  { key: "demand", label: "Admissions & enrollment momentum", max: 20, color: "#6B4FA0" },
  { key: "housing", label: "Waitlist & housing pressure", max: 25, color: "#1D7A6B" },
  { key: "confirmation", label: "Signal confirmation", max: 20, color: "#B45A2E" },
];

export function tierFor(total) {
  if (total >= 80) return "Top pick";
  if (total >= 60) return "Strong";
  if (total >= 40) return "Moderate";
  if (total >= 20) return "Caution";
  return "Quiet";
}

export function scoreTotal(subscores) {
  return RUBRIC.reduce((sum, r) => sum + subscores[r.key].score, 0);
}
