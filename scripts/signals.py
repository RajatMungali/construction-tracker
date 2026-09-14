"""
Tier 3 automation: bond/construction signal monitor.

IMPORTANT — WHY THIS DOESN'T TOUCH EMMA DIRECTLY:
MSRB's Terms of Use for emma.msrb.org explicitly prohibit programmatic
collection ("screen scraping") of its content without prior written
permission. This script does NOT scrape EMMA. Instead it monitors state
conduit issuers' own news pages — CHEFA (CT) and MassDevelopment (MA) so
far, which carry no such restriction — for mentions of your schools, and
produces a review queue with a direct EMMA search link for each hit. A
human still has to open that link and confirm the obligated party matches
before anything is used client-facing — that step is intentionally never
automated, per the brief's own warning about obligated-party mismatches.

HOW MATCHING WORKS:
Rather than parsing each site's exact HTML/CSS (which breaks the moment a
site redesigns), this script extracts every link's URL slug (e.g.
".../eaglebrook-school-to-construct-arts-music-science-building/") and
checks whether any registered school name appears in it. Both CHEFA and
MassDevelopment's article URLs mirror their headlines closely, so this is
a more durable signal than scraping rendered text.

Usage:
    python scripts/check_bond_signals.py

Requires: requests
    pip install requests
"""
import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

import requests

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = REPO_ROOT / "scripts" / "school_registry.json"
QUEUE_PATH = REPO_ROOT / "public" / "data" / "bond_signal_queue.json"

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; opportunity-tracker-bond-monitor/1.0)"}

# Verified working as of Sept 2026. Adding NHHEFA (NH) and RIHEBC (RI) needs
# the same verification pass before adding here — don't guess at their URLs,
# see the mistake made with the Scorecard bulk file URL for why.
SOURCES = [
    {"name": "CHEFA", "state": "CT", "url": "https://chefa.com/news-events/"},
    {"name": "MassDevelopment", "state": "MA", "url": "https://www.massdevelopment.com/news/"},
]

MIN_SLUG_WORDS = 4  # filters out nav links like /about/ or /contact-us/


def load_registry() -> dict:
    if not REGISTRY_PATH.exists():
        print(f"[error] Registry not found at {REGISTRY_PATH}.")
        print("Copy scripts/school_registry.json.example to scripts/school_registry.json first.")
        sys.exit(1)
    registry = json.loads(REGISTRY_PATH.read_text())
    registry.pop("_comment", None)
    return registry


def load_queue() -> list:
    if QUEUE_PATH.exists():
        return json.loads(QUEUE_PATH.read_text())
    return []


def slug_words(url: str) -> str:
    """Turn a URL path into readable, lowercase, space-separated words."""
    path = urlparse(url).path.strip("/")
    last_segment = path.split("/")[-1] if path else ""
    words = re.sub(r"[-_]+", " ", last_segment).strip().lower()
    return words


def fetch_links(source_url: str) -> list:
    resp = requests.get(source_url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    domain = urlparse(source_url).netloc
    hrefs = set(re.findall(r'href="([^"]+)"', resp.text))
    candidates = []
    for href in hrefs:
        full_url = href if href.startswith("http") else f"https://{domain}{href}"
        if urlparse(full_url).netloc != domain:
            continue
        words = slug_words(full_url)
        if len(words.split()) >= MIN_SLUG_WORDS:
            candidates.append((full_url, words))
    return candidates


def match_schools(candidates: list, registry: dict) -> list:
    hits = []
    for full_url, words in candidates:
        for school_id, entry in registry.items():
            names_to_check = [entry["official_name"]] + entry.get("aliases", [])
            for name in names_to_check:
                # require the full name's significant words to all appear in the slug,
                # to avoid one-word coincidental matches (e.g. "Maine" matching unrelated news)
                name_words = [w for w in re.sub(r"[^a-z0-9 ]", "", name.lower()).split() if len(w) > 2]
                if name_words and all(w in words for w in name_words):
                    hits.append((school_id, entry["official_name"], full_url))
                    break
    return hits


def build_emma_hint(school_name: str) -> dict:
    return {
        "emma_search_url": "https://emma.msrb.org/Search/Search.aspx",
        "emma_search_term": school_name,
        "note": "EMMA search link is the general search page — MSRB's Terms of Use prohibit "
                "deep-linking with pre-filled queries via automation, so type the term in by hand.",
    }


def main():
    registry = load_registry()
    queue = load_queue()
    seen_urls = {entry["source_url"] for entry in queue}

    new_count = 0
    for source in SOURCES:
        print(f"Checking {source['name']} ({source['url']}) ...")
        try:
            candidates = fetch_links(source["url"])
        except requests.RequestException as e:
            print(f"[warn] Could not fetch {source['name']}: {e}")
            continue

        hits = match_schools(candidates, registry)
        for school_id, school_name, url in hits:
            if url in seen_urls:
                continue
            entry = {
                "id": f"{school_id}-{hash(url) & 0xffffff:06x}",
                "school_id": school_id,
                "school_name": school_name,
                "source_name": source["name"],
                "source_url": url,
                "found_date": date.today().isoformat(),
                "status": "unverified",
                **build_emma_hint(school_name),
            }
            queue.append(entry)
            seen_urls.add(url)
            new_count += 1
            print(f"  [new] {school_name} <- {url}")

    QUEUE_PATH.parent.mkdir(parents=True, exist_ok=True)
    QUEUE_PATH.write_text(json.dumps(queue, indent=2))
    pending = sum(1 for e in queue if e["status"] == "unverified")
    print(f"\n{new_count} new signal(s) found. {pending} total entries awaiting manual EMMA verification.")
    print(f"Queue written to {QUEUE_PATH}")


if __name__ == "__main__":
    main()