"""
Tier 1 automation: College Scorecard + IPEDS bulk backbone pull.

Unlike a per-school API call, this downloads ONE file covering every
US institution and filters locally — no API key, no rate limits, no
fuzzy name-matching risk. Run this on a schedule (see
.github/workflows/refresh-backbone.yml) and it updates the
"admissions" portion of every school's record in one pass.

Usage:
    python scripts/pull_backbone.py

Requires: requests, pandas
    pip install requests pandas
"""
import json
import sys
from pathlib import Path

import pandas as pd
import requests

NEW_ENGLAND_STATES = {"CT", "MA", "ME", "NH", "RI", "VT"}

# College Scorecard publishes a "Most Recent Cohorts" bulk CSV — no key needed
# for the bulk file (only the API requires a key). Confirm the current file
# name/path at https://collegescorecard.ed.gov/data before running, since
# the filename includes a data-vintage tag that changes periodically.
SCORECARD_BULK_URL = (
    "https://ed-public-download.app.cloud.gov/downloads/"
    "Most-Recent-Cohorts-Institution.csv"
)

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = REPO_ROOT / "scripts" / "school_registry.json"
OUTPUT_PATH = REPO_ROOT / "public" / "data" / "schools.json"

SCORECARD_COLUMNS = {
    "UNITID": "unitid",
    "INSTNM": "scorecard_name",
    "STABBR": "state",
    "CONTROL": "ownership",       # 1=public, 2=private nonprofit, 3=private for-profit
    "UGDS": "enrollment_size",
    "ADM_RATE": "admission_rate",
    "C150_4": "completion_rate_4yr",
}

OWNERSHIP = {1: "Public", 2: "Private", 3: "Private"}


def load_registry() -> dict:
    """The registry maps our internal school ids to IPEDS UnitIDs. This file
    is NOT auto-generated — it's the one-time research pass (see the CDS/
    registry step in the roadmap) that everything else joins against."""
    if not REGISTRY_PATH.exists():
        print(f"[error] Registry not found at {REGISTRY_PATH}.")
        print("Create it first — see scripts/school_registry.json.example")
        sys.exit(1)
    return json.loads(REGISTRY_PATH.read_text())


def fetch_scorecard_bulk() -> pd.DataFrame:
    print(f"Downloading Scorecard bulk file from {SCORECARD_BULK_URL} ...")
    resp = requests.get(SCORECARD_BULK_URL, timeout=120)
    resp.raise_for_status()
    from io import StringIO

    df = pd.read_csv(StringIO(resp.text), usecols=list(SCORECARD_COLUMNS.keys()), low_memory=False)
    df = df.rename(columns=SCORECARD_COLUMNS)
    df["unitid"] = df["unitid"].astype(str)
    return df


def merge_and_write(registry: dict, scorecard: pd.DataFrame) -> None:
    if not OUTPUT_PATH.exists():
        print(f"[error] {OUTPUT_PATH} not found — run this from inside the repo.")
        sys.exit(1)

    schools = json.loads(OUTPUT_PATH.read_text())
    by_id = {s["id"]: s for s in schools}
    scorecard_by_unitid = scorecard.set_index("unitid").to_dict("index")

    updated, missing = 0, []
    for school_id, entry in registry.items():
        unitid = str(entry["unitid"])
        row = scorecard_by_unitid.get(unitid)
        if not row:
            missing.append(school_id)
            continue

        target = by_id.get(school_id)
        if not target:
            continue  # school not yet in schools.json — needs the full record scaffolded first

        admit_rate = row.get("admission_rate")
        completion = row.get("completion_rate_4yr")
        target.setdefault("backbone", {})
        target["backbone"] = {
            "enrollment_size": row.get("enrollment_size"),
            "admission_rate": round(admit_rate, 4) if pd.notna(admit_rate) else None,
            "completion_rate_4yr": round(completion, 4) if pd.notna(completion) else None,
            "ownership_scorecard": OWNERSHIP.get(row.get("ownership"), "Unknown"),
            "source": "College Scorecard bulk data (Most Recent Cohorts)",
            "as_of": pd.Timestamp.today().strftime("%Y-%m-%d"),
        }
        updated += 1

    OUTPUT_PATH.write_text(json.dumps(schools, indent=2))
    print(f"Updated backbone data for {updated} schools.")
    if missing:
        print(f"[warn] No Scorecard match for: {', '.join(missing)} — check UnitIDs in the registry.")


def main():
    registry = load_registry()
    scorecard = fetch_scorecard_bulk()
    ne_scorecard = scorecard[scorecard["state"].isin(NEW_ENGLAND_STATES)]
    print(f"Scorecard bulk file: {len(scorecard)} institutions total, {len(ne_scorecard)} in New England.")
    merge_and_write(registry, ne_scorecard)


if __name__ == "__main__":
    main()
