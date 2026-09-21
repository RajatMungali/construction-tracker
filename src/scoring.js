// Rubric weights. Each category's max adds up to 100 points total.
// No school data lives in this file on purpose. Data is loaded at
// runtime from JSON files in public/data/, so this file only
// changes when someone decides to change how scoring works.

// Confirmed Builders
export const RUBRIC = [
  {
    key: "financial",
    label: "Money and construction activity",
    max: 35,
    color: "#2F5C8A",
  },
  { key: "demand", label: "Student demand", max: 20, color: "#6B4FA0" },
  {
    key: "housing",
    label: "Waitlist and housing pressure",
    max: 25,
    color: "#1D7A6B",
  },
  { key: "confirmation", label: "How sure we are", max: 20, color: "#B45A2E" },
];

// Must build by law
export const RUBRIC_COMPLIANCE = [
  {
    key: "mandateStrength",
    label: "How strong the legal requirement is",
    max: 35,
    color: "#2F6B3A",
  },
  {
    key: "deadlineProximity",
    label: "How close the deadline is",
    max: 25,
    color: "#6B4FA0",
  },
  {
    key: "fundingAttached",
    label: "Money already attached",
    max: 25,
    color: "#2F5C8A",
  },
  { key: "confirmation", label: "How sure we are", max: 15, color: "#B45A2E" },
];

// Declining enrollment
export const RUBRIC_RECONFIG = [
  {
    key: "declineSeverity",
    label: "How much enrollment is dropping",
    max: 40,
    color: "#A13030",
  },
  {
    key: "surplusSpace",
    label: "How much empty space this points to",
    max: 35,
    color: "#1D7A6B",
  },
  { key: "confirmation", label: "How sure we are", max: 25, color: "#B45A2E" },
];

export function tierFor(total) {
  if (total >= 80) return "Top pick";
  if (total >= 60) return "Strong";
  if (total >= 40) return "Moderate";
  if (total >= 20) return "Caution";
  return "Quiet";
}

// Adds up whatever subscores match the given rubric's keys.
// Works for any of the three lists above, since each just passes
// its own rubric in.
export function scoreTotal(subscores, rubric = RUBRIC) {
  return rubric.reduce((sum, r) => sum + subscores[r.key].score, 0);
}

// A school counts as a real gap on a field when we could not find
// the data at all, not when we found data and it happened to be
// weak. This matters because "we found nothing" and "we found a
// weak number" are different facts and must not score the same way.
// Checked against the source field only, since that is the one
// place schools.json marks a real gap consistently ("-" for no
// data found anywhere, or "Not independently checked this round"
// for data we did not go re-verify).
function isRealGap(detail) {
  if (!detail) return true;
  const src = detail.source || "";
  if (src === "-" || src === "—") return true;
  if (/not independently checked/i.test(src)) return true;
  return false;
}

// Declining Enrollment list.
// Takes each school's existing demand and housing numbers (already
// in schools.json) and reads them the opposite way: weak demand and
// low occupancy mean a school has more space than students, which is
// a lead for renovation and conversion work, not a weakness.
//
// FIX: earlier code always flipped the number, so a school with NO
// data (a real gap, like a missing housing survey) got flipped into
// a near-perfect score, as if not having the data proved there was
// a lot of empty space. That is wrong. A gap now scores low, the
// same way a gap scores low everywhere else in this tool.
export function reconfigSubscoresFor(school) {
  const demand = school.subscores.demand;
  const housing = school.subscores.housing;

  const demandIsGap = isRealGap(school.details?.admissions);
  const housingIsGap = isRealGap(school.details?.housing);

  const declineSeverity = demandIsGap
    ? 4 // low end of 40, not a real finding, just missing data
    : Math.round((20 - demand.score) * (40 / 20));

  const surplusSpace = housingIsGap
    ? 3 // low end of 35, not a real finding, just missing data
    : Math.round((25 - housing.score) * (35 / 25));

  const confirmation = Math.round(
    school.subscores.confirmation.score * (25 / 20),
  );

  return {
    declineSeverity: {
      score: declineSeverity,
      note: demandIsGap
        ? "We could not find real enrollment numbers for this school, so this is left low, not guessed."
        : `Based on this school's enrollment numbers: ${demand.note}`,
    },
    surplusSpace: {
      score: surplusSpace,
      note: housingIsGap
        ? "We could not find real housing numbers for this school, so this is left low, not guessed."
        : `Based on this school's housing numbers: ${housing.note}`,
    },
    confirmation: {
      score: confirmation,
      note: school.subscores.confirmation.note,
    },
  };
}
