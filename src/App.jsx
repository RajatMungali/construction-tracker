import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, Search, Info, AlertTriangle, X } from "lucide-react";
import {
  RUBRIC,
  RUBRIC_COMPLIANCE,
  RUBRIC_WINNABLE,
  RUBRIC_RECONFIG,
  tierFor,
  scoreTotal,
  reconfigSubscoresFor,
} from "./scoring.js";

/* ============================================================
   DESIGN TOKENS — unchanged from the previous version.
   ============================================================ */
const C = {
  bgPage: "#EFE9DA",
  bgCard: "#FBF8F1",
  bgCardHover: "#F5EFDF",
  bgPanel: "#F5EFDF",
  line: "#DCD3BC",
  lineStrong: "#C8BC9C",
  textPrimary: "#201D16",
  textSecondary: "#524C3E",
  textMuted: "#8C8369",
  accent: "#201D16",
  tiers: {
    "Top pick": { fg: "#8A5E10", bg: "#F5E6C0", border: "#D9B65C" },
    Strong: { fg: "#2F6B3A", bg: "#E1EFE1", border: "#7FA980" },
    Moderate: { fg: "#9A5B10", bg: "#FBE7CF", border: "#DFA968" },
    Caution: { fg: "#A13030", bg: "#F7E2E2", border: "#D98F8F" },
    Quiet: { fg: "#5F5E5A", bg: "#ECEAE3", border: "#B4B2A9" },
  },
};

const display = { fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif" };
const body = { fontFamily: "'IBM Plex Sans', ui-sans-serif, sans-serif" };

function tierColorScale(ratio) {
  if (ratio >= 0.7) return "#2F6B3A";
  if (ratio >= 0.4) return "#9A5B10";
  return "#A13030";
}

/* ============================================================
   LIST CONFIG — renamed per Shikshita's feedback so each label
   is self-explanatory without needing outside context, and each
   entry now carries a short "description" shown under the tab
   row when that category is selected, explaining in plain terms
   what the list captures and why a school ends up on it.
   ============================================================ */
const LIST_CONFIG = [
  {
    key: "confirmed",
    label: "Financial Health",
    description:
      "Ranks schools by capacity to build right now — bond activity, credit standing, enrollment demand, and waitlist or housing pressure. A school lands here because it already has both the money and the demand to fund construction.",
    rubric: RUBRIC,
    getSchools: ({ mainSchools }) => mainSchools,
    getSubscores: (s) => s.subscores,
  },
  {
    key: "compliance",
    label: "Regulatory Compliance",
    description:
      "Surfaces schools facing legal decarbonization deadlines — state net-zero mandates, city ordinances like Boston's BERDO, or binding climate pledges. A school lands here because it has to act, regardless of how wealthy it is.",
    rubric: RUBRIC_COMPLIANCE,
    getSchools: ({ complianceSchools }) => complianceSchools,
    getSubscores: (s) => s.subscores,
  },
  {
    key: "winnable",
    label: "New Leadership",
    description:
      "Flags schools that just hired a new facilities or capital-planning leader with no built-in loyalty to an incumbent architecture firm. A school lands here because the relationship is still up for grabs.",
    rubric: RUBRIC_WINNABLE,
    getSchools: ({ winnableSchools }) => winnableSchools,
    getSubscores: (s) => s.subscores,
  },
  {
    key: "reconfig",
    label: "Underused Space",
    description:
      "Reads declining enrollment as an opportunity rather than a warning sign — surplus dorms and underused buildings mean conversion and renovation work. A school lands here because it has more space than students.",
    rubric: RUBRIC_RECONFIG,
    getSchools: ({ mainSchools }) => mainSchools,
    getSubscores: (s) => reconfigSubscoresFor(s),
  },
];

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */
function ScoreBar({ score, max, color }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: C.line,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
          }}
        />
      </div>
      <span
        style={{
          ...display,
          fontSize: 12,
          color: C.textSecondary,
          minWidth: 42,
          textAlign: "right",
        }}
      >
        {score}/{max}
      </span>
    </div>
  );
}

function TierBadge({ tier }) {
  const t = C.tiers[tier];
  return (
    <span
      style={{
        ...display,
        fontSize: 11,
        fontWeight: 500,
        color: t.fg,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 5,
        padding: "3px 9px",
        whiteSpace: "nowrap",
      }}
    >
      {tier}
    </span>
  );
}

function SourceLine({ label, d }) {
  if (!d) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          ...body,
          fontSize: 13,
          fontWeight: 500,
          color: C.textPrimary,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <p
        style={{
          ...body,
          fontSize: 13.5,
          lineHeight: 1.6,
          color: C.textSecondary,
          margin: "0 0 6px",
        }}
      >
        {d.text}
      </p>
      <div style={{ ...display, fontSize: 11, color: C.textMuted }}>
        {d.source}
        {d.asOf !== "—" ? ` · as of ${d.asOf}` : ""}
      </div>
    </div>
  );
}

function Methodology({ rubric, onClose }) {
  return (
    <div
      style={{
        background: C.bgPanel,
        border: `1px solid ${C.lineStrong}`,
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            ...display,
            fontSize: 15,
            fontWeight: 500,
            color: C.textPrimary,
          }}
        >
          Scoring methodology
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.textMuted,
          }}
        >
          <X size={16} />
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 16,
        }}
      >
        {rubric.map((r) => (
          <div key={r.key}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: r.color,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  ...display,
                  fontSize: 12,
                  color: C.textPrimary,
                  fontWeight: 500,
                }}
              >
                {r.max} pts
              </span>
            </div>
            <div
              style={{
                ...body,
                fontSize: 13,
                color: C.textSecondary,
                lineHeight: 1.5,
              }}
            >
              {r.label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          ...body,
          fontSize: 12.5,
          color: C.textMuted,
          lineHeight: 1.6,
          borderTop: `1px solid ${C.line}`,
          paddingTop: 14,
        }}
      >
        Total is out of 100. Tiers: 80+ top pick, 60–79 strong, 40–59 moderate,
        20–39 caution, under 20 quiet. A missing data point scores as the low
        end of its range rather than being guessed — a gap is not the same as a
        zero finding, and both are shown as such in each school's breakdown.
      </div>
    </div>
  );
}

/* ============================================================
   MAIN
   ============================================================ */
export default function App() {
  const [mainSchools, setMainSchools] = useState(null);
  const [complianceSchools, setComplianceSchools] = useState([]);
  const [winnableSchools, setWinnableSchools] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  // Tracks which school's full sourced write-up is expanded — separate
  // from `expanded` so opening a school always starts with the short
  // summary + scores, and the detailed sourcing is an explicit second step.
  const [sourcesOpenId, setSourcesOpenId] = useState(null);
  const [showMethod, setShowMethod] = useState(false);
  const [activeListKey, setActiveListKey] = useState(LIST_CONFIG[0].key);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/schools.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setMainSchools)
      .catch((e) => setLoadError(e.message));

    fetch(`${import.meta.env.BASE_URL}data/compliance-schools.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setComplianceSchools)
      .catch(() => setComplianceSchools([]));

    fetch(`${import.meta.env.BASE_URL}data/winnable-schools.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setWinnableSchools)
      .catch(() => setWinnableSchools([]));
  }, []);

  const activeList = LIST_CONFIG.find((l) => l.key === activeListKey);

  const rawSchools =
    activeList.getSchools({
      mainSchools: mainSchools || [],
      complianceSchools,
      winnableSchools,
    }) || [];

  const withTotals = useMemo(() => {
    return rawSchools.map((s) => {
      const subscores = activeList.getSubscores(s);
      const total = scoreTotal(subscores, activeList.rubric);
      return { ...s, subscores, total, tier: tierFor(total) };
    });
  }, [rawSchools, activeList]);

  const tierOptions = [
    "All",
    "Top pick",
    "Strong",
    "Moderate",
    "Caution",
    "Quiet",
  ];

  const list = useMemo(() => {
    let l = withTotals.filter(
      (s) =>
        (tierFilter === "All" || s.tier === tierFilter) &&
        (query === "" ||
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.state.toLowerCase().includes(query.toLowerCase())),
    );
    return l.sort((a, b) => b.total - a.total);
  }, [query, tierFilter, withTotals]);

  const dataStillLoading = mainSchools === null;

  return (
    <div
      style={{
        ...body,
        background: C.bgPage,
        minHeight: "100vh",
        color: C.textPrimary,
        padding: "32px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {/* Title block */}
        <div
          style={{
            border: `1px solid ${C.lineStrong}`,
            borderRadius: 8,
            padding: "18px 22px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 12,
            background: C.bgCard,
          }}
        >
          <div>
            <div
              style={{
                ...display,
                fontSize: 11,
                color: C.textMuted,
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              CAPITAL PROJECT INTELLIGENCE — NEW ENGLAND
            </div>
            <div style={{ ...display, fontSize: 21, fontWeight: 500 }}>
              Construction opportunity tracker
            </div>
          </div>
          <div
            style={{
              ...display,
              fontSize: 12,
              color: C.textMuted,
              textAlign: "right",
            }}
          >
            POC · 10 of ~300 schools
            <br />
            Sheet rev. Sept 2026
          </div>
        </div>

        {/* Category button row */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {LIST_CONFIG.map((l) => (
            <button
              key={l.key}
              onClick={() => {
                setActiveListKey(l.key);
                setExpanded(null);
                setSourcesOpenId(null);
              }}
              style={{
                ...display,
                fontSize: 13,
                fontWeight: 500,
                padding: "10px 16px",
                borderRadius: 8,
                border: `1px solid ${activeListKey === l.key ? C.accent : C.line}`,
                background: activeListKey === l.key ? "#E5DEC8" : C.bgCard,
                color:
                  activeListKey === l.key ? C.textPrimary : C.textSecondary,
                cursor: "pointer",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Active list description — shows what this category captures
            and why a school ends up on it, in plain terms. */}
        <div
          style={{
            ...body,
            fontSize: 13,
            lineHeight: 1.5,
            color: C.textSecondary,
            marginBottom: 16,
            padding: "0 2px",
          }}
        >
          {activeList.description}
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 10,
                top: 10,
                color: C.textMuted,
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search school or state"
              style={{
                width: "100%",
                background: C.bgCard,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
                padding: "8px 10px 8px 32px",
                color: C.textPrimary,
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tierOptions.map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                style={{
                  ...display,
                  fontSize: 11,
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: `1px solid ${tierFilter === t ? C.accent : C.line}`,
                  background: tierFilter === t ? "#E5DEC8" : C.bgCard,
                  color: tierFilter === t ? C.textPrimary : C.textSecondary,
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowMethod((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              ...display,
              fontSize: 11,
              padding: "7px 10px",
              borderRadius: 6,
              border: `1px solid ${C.line}`,
              background: C.bgCard,
              color: C.textSecondary,
              cursor: "pointer",
            }}
          >
            <Info size={13} /> Scoring
          </button>
        </div>

        {showMethod && (
          <Methodology
            rubric={activeList.rubric}
            onClose={() => setShowMethod(false)}
          />
        )}

        {loadError && (
          <div
            style={{
              ...body,
              fontSize: 13,
              color: C.tiers.Caution.fg,
              background: C.tiers.Caution.bg,
              border: `1px solid ${C.tiers.Caution.border}`,
              borderRadius: 8,
              padding: 14,
              marginBottom: 16,
            }}
          >
            Couldn't load school data ({loadError}). Check that
            public/data/schools.json exists and is valid JSON.
          </div>
        )}
        {dataStillLoading && !loadError && (
          <div
            style={{
              ...body,
              fontSize: 13,
              color: C.textMuted,
              padding: 24,
              textAlign: "center",
            }}
          >
            Loading schools…
          </div>
        )}
        {!dataStillLoading &&
          !loadError &&
          list.length === 0 &&
          rawSchools.length === 0 && (
            <div
              style={{
                ...body,
                fontSize: 13,
                color: C.textMuted,
                padding: 24,
                textAlign: "center",
              }}
            >
              No schools researched for this category yet.
            </div>
          )}

        {/* Ranked list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((s, i) => {
            const isOpen = expanded === s.id;
            const sourcesOpen = sourcesOpenId === s.id;
            return (
              <div
                key={s.id}
                style={{
                  background: isOpen ? C.bgCardHover : C.bgCard,
                  border: `1px solid ${isOpen ? C.lineStrong : C.line}`,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => {
                    setExpanded(isOpen ? null : s.id);
                    if (isOpen) setSourcesOpenId(null);
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr 90px 24px",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ ...display, fontSize: 13, color: C.textMuted }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{ ...display, fontSize: 14.5, fontWeight: 500 }}
                      >
                        {s.name}
                      </span>
                      {s.distressFlag && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            ...display,
                            fontSize: 10,
                            color: C.tiers.Caution.fg,
                            border: `1px solid ${C.tiers.Caution.border}`,
                            background: C.tiers.Caution.bg,
                            borderRadius: 4,
                            padding: "1px 6px",
                          }}
                        >
                          <AlertTriangle size={10} /> financial distress
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        ...display,
                        fontSize: 11.5,
                        color: C.textMuted,
                        marginTop: 2,
                      }}
                    >
                      {s.type} · {s.location}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ ...display, fontSize: 16, fontWeight: 500 }}>
                      {s.total}
                      <span style={{ color: C.textMuted, fontSize: 11 }}>
                        {" "}
                        /100
                      </span>
                    </span>
                  </div>

                  <ChevronDown
                    size={16}
                    style={{
                      color: C.textMuted,
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.15s",
                    }}
                  />
                </div>

                {!isOpen && (
                  <div
                    style={{
                      padding: "0 16px 14px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <TierBadge tier={s.tier} />
                  </div>
                )}

                {isOpen && (
                  <div
                    style={{
                      padding: "4px 16px 20px",
                      borderTop: `1px solid ${C.line}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        margin: "14px 0 4px",
                      }}
                    >
                      <TierBadge tier={s.tier} />
                    </div>

                    {/* Plain-English summary — moved to the top, ahead of
                        the score grid, so the reader gets the "so what"
                        before the breakdown. This is the same flagNote
                        content as before; only its position/styling
                        changed (no longer buried below the grid). */}
                    {s.flagNote && (
                      <div
                        style={{
                          ...body,
                          fontSize: 14,
                          color: C.textPrimary,
                          lineHeight: 1.6,
                          marginBottom: 16,
                        }}
                      >
                        {s.flagNote}
                      </div>
                    )}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 14,
                        margin: "0 0 16px",
                      }}
                    >
                      {activeList.rubric.map((r) => {
                        const sub = s.subscores[r.key];
                        return (
                          <div key={r.key}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 6,
                              }}
                            >
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 2,
                                  background: r.color,
                                  display: "inline-block",
                                }}
                              />
                              <span
                                style={{
                                  ...body,
                                  fontSize: 12.5,
                                  color: C.textSecondary,
                                }}
                              >
                                {r.label}
                              </span>
                            </div>
                            <ScoreBar
                              score={sub.score}
                              max={r.max}
                              color={tierColorScale(sub.score / r.max)}
                            />
                            <div
                              style={{
                                ...body,
                                fontSize: 12,
                                color: C.textMuted,
                                marginTop: 5,
                                lineHeight: 1.5,
                              }}
                            >
                              {sub.note}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Full sourced write-up is now collapsed behind an
                        explicit toggle instead of always shown — this is
                        the "wall of data" simplification Shikshita asked
                        for. Clicking it stops the row from re-collapsing
                        (stopPropagation) since it sits inside the same
                        clickable card as the row header. */}
                    {s.details && (
                      <div
                        style={{
                          borderTop: `1px solid ${C.line}`,
                          paddingTop: 12,
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSourcesOpenId(sourcesOpen ? null : s.id);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            ...display,
                            fontSize: 11.5,
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: `1px solid ${C.line}`,
                            background: "transparent",
                            color: C.textSecondary,
                            cursor: "pointer",
                            marginBottom: sourcesOpen ? 16 : 0,
                          }}
                        >
                          <ChevronDown
                            size={13}
                            style={{
                              transform: sourcesOpen
                                ? "rotate(180deg)"
                                : "none",
                              transition: "transform 0.15s",
                            }}
                          />
                          {sourcesOpen
                            ? "Hide full sourcing"
                            : "Show full sourcing"}
                        </button>

                        {sourcesOpen && (
                          <div>
                            <SourceLine
                              label="Admissions & enrollment"
                              d={s.details.admissions}
                            />
                            <SourceLine
                              label="Financial health & construction trigger"
                              d={s.details.financial}
                            />
                            <SourceLine
                              label="Waitlist & housing pressure"
                              d={s.details.housing}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
