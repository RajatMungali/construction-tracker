import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, Search, Info, AlertTriangle, X } from "lucide-react";
import {
  RUBRIC,
  RUBRIC_COMPLIANCE,
  RUBRIC_RECONFIG,
  tierFor,
  scoreTotal,
  reconfigSubscoresFor,
} from "./scoring.js";

/* Design tokens, unchanged. */
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
   LIST CONFIG. Newly Winnable removed on purpose, per request,
   the whole list and its data fetch are gone from this file.

   Each entry also carries detailLabels, so the source section at
   the bottom of a school's card uses a label that matches THIS
   list, not a label copied from a different list. This fixes the
   bug where Compliance Pressure schools showed the Confirmed
   Builders label "Financial health & construction trigger" under
   Regulatory data that had nothing to do with construction bonds.
   ============================================================ */
const LIST_CONFIG = [
  {
    key: "confirmed",
    label: "Confirmed Builders",
    description:
      "Schools that already have the money and the demand to build now. This looks at bonds, credit, how many students are applying, and how full the dorms are.",
    rubric: RUBRIC,
    getSchools: ({ mainSchools }) => mainSchools,
    getSubscores: (s) => s.subscores,
    detailLabels: {
      admissions: "Student demand",
      financial: "Money and construction",
      housing: "Waitlist and housing",
    },
  },
  {
    key: "compliance",
    label: "Must build by law",
    description:
      "Schools that have to cut emissions by law, whether or not they have money. This looks at state and city climate rules, deadlines, and any funding already tied to the work.",
    rubric: RUBRIC_COMPLIANCE,
    getSchools: ({ complianceSchools }) => complianceSchools,
    getSubscores: (s) => s.subscores,
    detailLabels: {
      financial: "The law and the money behind it",
    },
  },
  {
    key: "reconfig",
    label: "Declining enrollment",
    description:
      "Schools losing students, which usually means empty dorms and buildings that are not being used well. That is a lead for renovation work, not just a warning sign.",
    rubric: RUBRIC_RECONFIG,
    getSchools: ({ mainSchools }) => mainSchools,
    getSubscores: (s) => reconfigSubscoresFor(s),
    detailLabels: {
      admissions: "Enrollment numbers",
      financial: "Background",
      housing: "Housing numbers",
    },
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
        {d.asOf !== "—" && d.asOf !== "-" ? `, as of ${d.asOf}` : ""}
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
          How scoring works
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
                {r.max} points
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
        The total is out of 100. 80 or more is a top pick, 60 to 79 is strong,
        40 to 59 is moderate, 20 to 39 is a caution, and under 20 is quiet. When
        we could not find a piece of data, we score it low instead of guessing.
        A gap in the data is shown as a gap, not treated as a good or bad
        result.
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
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
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
  }, []);

  const activeList = LIST_CONFIG.find((l) => l.key === activeListKey);

  const rawSchools =
    activeList.getSchools({
      mainSchools: mainSchools || [],
      complianceSchools,
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
        padding: "28px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {/* Title block, trimmed: dropped the internal-sounding revision line. */}
        <div
          style={{
            border: `1px solid ${C.lineStrong}`,
            borderRadius: 8,
            padding: "16px 22px",
            marginBottom: 16,
            background: C.bgCard,
          }}
        >
          <div
            style={{
              ...display,
              fontSize: 12,
              color: C.textMuted,
              marginBottom: 4,
            }}
          >
            New England colleges and universities
          </div>
          <div style={{ ...display, fontSize: 21, fontWeight: 500 }}>
            Construction opportunity tracker
          </div>
        </div>

        {/* Category buttons */}
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
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

        {/* What this list means, in plain words, plus a live count so
            the number always matches what is actually shown. */}
        <div
          style={{
            ...body,
            fontSize: 13,
            lineHeight: 1.5,
            color: C.textSecondary,
            marginBottom: 14,
          }}
        >
          {activeList.description} {rawSchools.length} school
          {rawSchools.length === 1 ? "" : "s"} shown here.
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 14,
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
            Could not load school data ({loadError}). Check that
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
            Loading schools...
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
              No schools in this list yet.
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
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{ ...display, fontSize: 14.5, fontWeight: 500 }}
                      >
                        {s.name}
                      </span>
                      {/* FIX: a real space character now sits between the
                          name and the badge, not just a CSS gap. Without
                          this, the name and badge text run together as
                          one word ("University of Hartfordfinancial
                          distress") anywhere the visual gap is not
                          preserved, like copied text or a screen reader. */}
                      {s.distressFlag && (
                        <>
                          {" "}
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
                        </>
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
                      {s.type}, {s.location}
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
                          {sourcesOpen ? "Hide sources" : "Show sources"}
                        </button>

                        {sourcesOpen && (
                          <div>
                            <SourceLine
                              label={activeList.detailLabels.admissions}
                              d={s.details.admissions}
                            />
                            <SourceLine
                              label={activeList.detailLabels.financial}
                              d={s.details.financial}
                            />
                            <SourceLine
                              label={activeList.detailLabels.housing}
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
