#!/usr/bin/env python3
"""Fetch selected Letterboxd lists and save them as local JSON for the site."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from typing import List
from urllib.request import Request, urlopen


LISTS = [
    {
        "title": "2026 Ranked",
        "url": "https://letterboxd.com/ace_as_chase/list/2026-ranked/",
    },
    {
        "title": "Overrated Movies",
        "url": "https://letterboxd.com/ace_as_chase/list/overrated-movies/",
    },
    {
        "title": "Christopher Nolan Ranked",
        "url": "https://letterboxd.com/ace_as_chase/list/christopher-nolan-ranked/",
    },
    {
        "title": "Oscar 2025",
        "url": "https://letterboxd.com/ace_as_chase/list/oscar-2025/",
    },
]

OUTPUT_PATH = Path(__file__).resolve().parents[1] / "assets" / "data" / "letterboxd-lists.json"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"


def fetch_html(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8")


def extract_titles(html: str) -> List[str]:
    titles = []
    matches = re.findall(
        r'<li class="posteritem.*?<div class="poster film-poster">.*?<img[^>]+alt="([^"]+)"',
        html,
        flags=re.DOTALL,
    )

    for title in matches:
        cleaned = unescape(title).strip()
        if cleaned and cleaned not in titles:
            titles.append(cleaned)

    if titles:
        return titles

    fallback_matches = re.findall(r'data-item-name="([^"]+)"', html)
    for title in fallback_matches:
        cleaned = re.sub(r"\s*\(\d{4}\)$", "", unescape(title).strip())
        if cleaned and cleaned not in titles:
            titles.append(cleaned)

    return titles


def scrape_list(url: str) -> List[str]:
    return extract_titles(fetch_html(url))


def build_payload() -> dict:
    payload_lists = []

    for list_info in LISTS:
        films = scrape_list(list_info["url"])
        payload_lists.append(
            {
                "title": list_info["title"],
                "url": list_info["url"],
                "filmCount": len(films),
                "films": films,
            }
        )

    return {
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "lists": payload_lists,
    }


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(build_payload(), indent=2), encoding="utf-8")
    print(f"Saved Letterboxd data to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
