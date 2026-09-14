// ============================================================
// SCORING RUBRIC — weights are the single source of truth.
// Category max points sum to 100.
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

// ============================================================
// DATA — schema-shaped so a future backend swap only needs to
// replace this export with a fetch() call returning the same shape.
// Subscores are a first-pass calibration against real CDS,
// Scorecard, and bond-news findings gathered during the POC pass.
// ============================================================
export const SCHOOLS = [
  {
    id: "uconn",
    name: "University of Connecticut",
    type: "Public",
    state: "CT",
    location: "Storrs, CT",
    degrees: "Bachelor's–Doctoral",
    subscores: {
      financial: { score: 33, note: "$582M bond closed Mar 2026, largest in the 30-yr UConn 2000 program — funds academic/research facilities" },
      demand: { score: 18, note: "~66,300 Fall 2025 applications, record demand" },
      housing: { score: 20, note: "2,253 waitlist offered / 979 accepted / 550 admitted; 96% first-year housed" },
      confirmation: { score: 20, note: "Bond sale confirmed closed, not pending" },
    },
    flagNote: "Record application demand plus the largest capital bond in the university's 30-year building program, closed this year.",
    details: {
      admissions: { text: "~66,300 first-year applications for Fall 2025 entering class — record demand. Ranked #32 public university nationally (US News).", source: "UConn Annual Report on GO Bonds (to bondholders)", asOf: "Jan 2026" },
      financial: { text: "$582M bond sale closed Mar 24 2026 — largest in UConn 2000 program history ($434M tax-exempt GO bonds + $148M taxable BANs). Funds academic/research facilities, library investments, infrastructure at Storrs & UConn Health; also refinances 2015/2016 bonds.", source: "CT Treasurer press release; Hartford Business Journal", asOf: "Mar 2026" },
      housing: { text: "Waitlist: 2,253 offered, 979 accepted, 550 admitted. Housing: 96% of first-year students / 64% of all undergrads live in college housing.", source: "UConn official Common Data Set 2023-24 PDF, Sections C1 & F1", asOf: "2023-24" },
    },
  },
  {
    id: "northeastern",
    name: "Northeastern University",
    type: "Private",
    state: "MA",
    location: "Boston, MA",
    degrees: "Bachelor's–Doctoral",
    subscores: {
      financial: { score: 34, note: "$378.5M science complex bond + separate residence-hall groundbreak, both active" },
      demand: { score: 12, note: "Known high selectivity, not independently re-verified this pass" },
      housing: { score: 15, note: "Waitlist not reported; 99% first-year housed" },
      confirmation: { score: 20, note: "Two concurrent, named, actively funded projects" },
    },
    flagNote: "Two large, concurrent, actively-funded projects — one academic, one residential — running at the same time.",
    details: {
      admissions: { text: "Enrollment ~15,000 undergrad/grad; historically high selectivity and strong applicant demand (established market position, not independently re-verified this pass).", source: "Northeastern public profile (not re-verified via Scorecard this pass)", asOf: "2025" },
      financial: { text: "$378.5M tax-exempt bond (via MassDevelopment, ~Sept 2025) funding a 340,000 sq ft science & engineering complex in Fenway. Separately broke ground Feb 2026 on a 23-story, 1,200-bed residence hall (P3 with American Campus Communities / Blackstone).", source: "Worcester Business Journal; Boston Real Estate Times", asOf: "Sept 2025 / Feb 2026" },
      housing: { text: "Waitlist numbers not reported by the school in this CDS cycle (fields left blank). Housing: 99% of first-year students / 57% of all undergrads live in college housing.", source: "Northeastern official Common Data Set 2024-25 PDF, Sections C1 & F1", asOf: "2024-25" },
    },
  },
  {
    id: "dartmouth",
    name: "Dartmouth College",
    type: "Private",
    state: "NH",
    location: "Hanover, NH",
    degrees: "Bachelor's–Doctoral",
    subscores: {
      financial: { score: 35, note: "$450M+ bonds specifically for housing construction, AAA rating" },
      demand: { score: 18, note: "5.84% acceptance rate, 28,863 applicants — near-record demand" },
      housing: { score: 19, note: "2,497 waitlist offered; 100% first-year / 85% all undergrads housed" },
      confirmation: { score: 20, note: "Active, confirmed bond issuance for construction" },
    },
    flagNote: "Confirmed live opportunity: active nine-figure bond, record-low admit rate, real waitlist volume.",
    details: {
      admissions: { text: "Class of 2030: 5.84% acceptance rate, 1,687 admitted from 28,863 applicants. CDS 2025-26 shows 4,715 undergrads, 2,497 offered a waitlist spot (accept count not published).", source: "AdmissionSight (citing Dartmouth CDS); commondatasets.fyi", asOf: "CDS cycle 2025-26" },
      financial: { text: "Issuing $450M+ in bonds (2025) for capital projects, incl. housing construction. S&P rating raised to AAA (Apr 2024 article — recheck currency before citing).", source: "The Dartmouth (student paper); S&P Global Ratings", asOf: "Aug 2025 / Apr 2024" },
      housing: { text: "Waitlist: 2,497 offered (accepted/admitted not cleanly captured — recheck before citing). Housing: 100% of first-years / 85% of all undergrads / 80% of upperclassmen live in college housing.", source: "Dartmouth official Common Data Set 2025-26 PDF, Sections C1 & F1", asOf: "2025-26" },
    },
  },
  {
    id: "wesleyan",
    name: "Wesleyan University",
    type: "Private",
    state: "CT",
    location: "Middletown, CT",
    degrees: "Bachelor's–Doctoral",
    subscores: {
      financial: { score: 28, note: "$130M bond-funded science building under construction, opening Fall 2026" },
      demand: { score: 8, note: "Not independently re-verified this pass" },
      housing: { score: 22, note: "100% first-year / 99% all undergrads housed — near capacity" },
      confirmation: { score: 18, note: "Confirmed under-construction building" },
    },
    flagNote: "Confirms the organic hint in the original brief — real, large, bond-funded construction in progress now.",
    details: {
      admissions: { text: "Not re-verified this pass — flagged via a public campus review mentioning active science building construction; confirmed true (see financial column).", source: "Not pulled this pass", asOf: "—" },
      financial: { text: "$255M new science building under construction (opening Fall 2026), $130M bond-funded per Hartford Business Journal. Also mid-construction on a Public Affairs Center renovation and an integrated arts lab.", source: "Hartford Business Journal; Tradeline Inc.", asOf: "June–Sept 2025" },
      housing: { text: "Waitlist: 2,754 offered, 1,557 accepted, 81 admitted. Housing: 100% of first-years / 99% of all undergrads live in college housing. Note: 2022-23 CDS is the most recent publicly findable PDF; a newer year may exist.", source: "Wesleyan official Common Data Set 2022-23 PDF, Sections C1 & F1", asOf: "2022-23" },
    },
  },
  {
    id: "trinity",
    name: "Trinity College",
    type: "Private",
    state: "CT",
    location: "Hartford, CT",
    degrees: "Bachelor's (limited grad)",
    subscores: {
      financial: { score: 22, note: "$42M + $13M bonds, mostly renovation/refinancing not new build" },
      demand: { score: 17, note: "Class of 2030 deposits up 25%+ YoY — strongest yield in 5+ years" },
      housing: { score: 18, note: "2,468 waitlist offered / 1,387 accepted / 19 admitted; 100%/82% housed" },
      confirmation: { score: 15, note: "Bonds approved and issued, capital budget partly bond-funded" },
    },
    flagNote: "Bond activity stacked with a real enrollment growth story in the same year.",
    details: {
      admissions: { text: "Class of 2030 deposits up >25% year-over-year — strongest yield in 5+ years per the college's own release.", source: "Trinity College news release", asOf: "May 2026" },
      financial: { text: "CHEFA approved a $42M Series T bond (Dec 2025) — ~$10M for on-campus renovation, rest refinancing. Moody's affirmed A2, stable outlook, Feb 2026. Separate $13M Dec 2025 bond for first-year dorm/HVAC upgrades.", source: "Hartford Business Journal; Trinity Tripod; Trinity College news", asOf: "Dec 2025 – May 2026" },
      housing: { text: "Waitlist: 2,468 offered, 1,387 accepted, 19 admitted. Housing: 100% of first-years / 82% of all undergrads live in college housing.", source: "Trinity College official Common Data Set 2025-26 PDF, Sections C1 & F1", asOf: "2025-26" },
    },
  },
  {
    id: "umass",
    name: "UMass Amherst",
    type: "Public",
    state: "MA",
    location: "Amherst, MA",
    degrees: "Bachelor's–Doctoral",
    subscores: {
      financial: { score: 18, note: "P3 housing deal signed but dollar figure undisclosed; state bond bill still pending" },
      demand: { score: 8, note: "Not independently re-verified this pass" },
      housing: { score: 16, note: "11,100 waitlist offered / 7,261 accepted / 2,349 admitted; 97%/58% housed" },
      confirmation: { score: 10, note: "Developer selected, but scope/dollar not yet disclosed and BRIGHT Act unpassed" },
    },
    flagNote: "Real signed housing deal, tied to a statewide bond bill in progress — but neither has a confirmed dollar figure yet.",
    details: {
      admissions: { text: "Not re-verified this pass.", source: "Not pulled this pass", asOf: "—" },
      financial: { text: "Selected American Campus Communities (Blackstone-owned) as P3 developer for a full campus housing modernization, announced May 2026 — long-range, phased, 10–15 year plan. Separate from the pending state BRIGHT Act ($2.5B+ bond bill; House passed Nov 2025, Senate pending).", source: "Daily Hampshire Gazette; UMass Amherst news", asOf: "May 2026" },
      housing: { text: "Waitlist: 11,100 offered, 7,261 accepted, 2,349 admitted. Housing: 97% of first-years / 58% of all undergrads live in college housing.", source: "UMass Amherst official Common Data Set 2025-26 PDF, Sections C1 & F1", asOf: "2025-26" },
    },
  },
  {
    id: "bridgewater",
    name: "Bridgewater State University",
    type: "Public",
    state: "MA",
    location: "Bridgewater, MA",
    degrees: "Bachelor's–Master's",
    subscores: {
      financial: { score: 15, note: "Named in a pending state bond bill; no confirmed BSU-specific new project" },
      demand: { score: 8, note: "Growth cited as a revenue driver, figures not pulled this pass" },
      housing: { score: 5, note: "No waitlist policy; only 36%/17% live in college housing — low pressure" },
      confirmation: { score: 6, note: "Bond bill has passed the House only, not yet law" },
    },
    flagNote: "Closest direct tie to the BRIGHT Act funding wave of any school checked — but nothing campus-specific is confirmed yet.",
    details: {
      admissions: { text: "Enrollment growth cited as a revenue driver in the FY25 annual report (specific figures not pulled this pass).", source: "BSU Annual Comprehensive Financial Report FY25", asOf: "FY ending Jun 2025" },
      financial: { text: "Directly named in the governor's BRIGHT Act announcement (statewide capital bond bill, House passed Nov 2025). Aa3 Moody's rating. FY25 capital funding improved Maxwell Library and renovated Burnell Hall.", source: "BSU Annual Comprehensive Financial Report; Barr & Barr", asOf: "FY25 report" },
      housing: { text: "No waitlist policy — BSU's CDS checks 'No' to having one. Housing: 36% of first-years / 17% of all undergrads live in college housing.", source: "Bridgewater State University official Common Data Set 2020-21 PDF, Sections C2 & F1 (most recent published edition)", asOf: "2020-21" },
    },
  },
  {
    id: "umaine",
    name: "University of Maine",
    type: "Public",
    state: "ME",
    location: "Orono, ME",
    degrees: "Bachelor's–Doctoral",
    subscores: {
      financial: { score: 12, note: "$25M infrastructure bond active, but most capital work is donor-funded not bonded" },
      demand: { score: 5, note: "Credit hours down 4% vs. budget, out-of-state enrollment dropped" },
      housing: { score: 10, note: "Waitlist figures illegible in source PDF; 89.8%/38.0% housed" },
      confirmation: { score: 8, note: "One confirmed bond, but for infrastructure, not a building" },
    },
    flagNote: "Genuine, well-documented need — but most current activity is donor-funded, not bond-driven. Weaker fit for a bond-timing pitch.",
    details: {
      admissions: { text: "President's 2026 address: grad/postgrad enrollment up; credit hours down 4% vs. budget; out-of-state enrollment dropped.", source: "The Maine Campus, reporting the President's State of the University address", asOf: "Mar 2026" },
      financial: { text: "Deferred maintenance backlog cited at three different figures across sources ($1.3B / $1.8B / $1.1B, not apples-to-apples). Active: $25M revenue bond (30-yr) for electrical infrastructure. ~10 capital projects completing 2026, several donor-funded rather than bonded.", source: "UMaine Office of Facilities Management; UMS Board minutes; Bangor Daily News", asOf: "Feb–Mar 2026" },
      housing: { text: "Waitlist fields present in the source PDF but no legible digits could be extracted this pass. Housing: 89.8% of first-years / 38.0% of all undergrads live in college housing.", source: "University of Maine official Common Data Set 2022-23 PDF, Sections C2 & F1 (2024-25/2025-26 editions exist but download access is blocked)", asOf: "2022-23" },
    },
  },
  {
    id: "hartford",
    name: "University of Hartford",
    type: "Private",
    state: "CT",
    location: "West Hartford, CT",
    degrees: "Bachelor's–Doctoral",
    distressFlag: true,
    subscores: {
      financial: { score: 3, note: "Bond rating downgraded to speculative grade; covenant breach; operating deficit" },
      demand: { score: 5, note: "No growth signal found" },
      housing: { score: 0, note: "No Common Data Set published anywhere on the school's site" },
      confirmation: { score: 2, note: "Only past projects; no current pipeline" },
    },
    flagNote: "Real signal, but a warning one: financial distress, not a construction-spend opportunity. Useful as a 'do not prioritize' data point, not a lead.",
    details: {
      admissions: { text: "4,223 undergrads (Fall 2024), 47% four-year grad rate, 74% receiving need-based aid.", source: "US News Best Colleges profile", asOf: "2026 edition (Fall 2024 data)" },
      financial: { text: "S&P downgraded long-term bond rating from BBB- to BB+ (speculative grade), June 2025, on $154.5M in debt; negative outlook. FY operating deficit was $17.1M; breached a debt service coverage covenant on a $132M bond issued 2019.", source: "Hartford Business Journal", asOf: "June 2025" },
      housing: { text: "No Common Data Set found on the university's site. The Institutional Effectiveness 'Fact Book' page hosts only live dashboards, and states further data requests go directly to the office.", source: "—", asOf: "—" },
    },
  },
  {
    id: "snhu",
    name: "Southern New Hampshire University",
    type: "Private",
    state: "NH",
    location: "Manchester, NH",
    degrees: "Bachelor's–Doctoral",
    subscores: {
      financial: { score: 8, note: "Only identified activity is a student center renovation; no bond signal" },
      demand: { score: 6, note: "Small physical campus by design, not a growth story" },
      housing: { score: 0, note: "No Common Data Set published anywhere on the school's site" },
      confirmation: { score: 5, note: "One small, confirmed renovation" },
    },
    flagNote: "Deliberately included as the quiet case — confirms the tool doesn't flag every school as exciting.",
    details: {
      admissions: { text: "2,615 on-campus undergrads (Fall 2024) — small physical campus despite SNHU's very large online enrollment nationally.", source: "US News Best Colleges profile", asOf: "2026 edition (Fall 2024 data)" },
      financial: { text: "Only identified activity: a renovation of the Freese Student Center (contractor selected Oct 2025). No bond issuance or rating signal found this pass.", source: "New England Real Estate Journal (NEREJ)", asOf: "Oct 2025" },
      housing: { text: "No Common Data Set found on the university's site. The Consumer Information page makes no reference to one, and none turned up in library/IR archives.", source: "—", asOf: "—" },
    },
  },
];
