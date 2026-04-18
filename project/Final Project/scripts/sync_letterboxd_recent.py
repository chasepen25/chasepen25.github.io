#!/usr/bin/env python3
"""Fetch recent Letterboxd watches from RSS and save them as local JSON."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET


RSS_URL = "https://letterboxd.com/ace_as_chase/rss/"
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "assets" / "data" / "letterboxd-recent.json"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
MAX_ITEMS = 8

NAMESPACES = {
    "letterboxd": "https://letterboxd.com",
    "tmdb": "https://themoviedb.org",
}


def fetch_rss(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=20) as response:
        return response.read()


def extract_poster_url(description: str) -> str:
    match = re.search(r'<img[^>]+src="([^"]+)"', description)
    return unescape(match.group(1)).strip() if match else ""


def strip_html(value: str) -> str:
    text = re.sub(r"<br\s*/?>", " ", value, flags=re.IGNORECASE)
    text = re.sub(r"</p>", "\n\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def shorten_text(value: str, limit: int = 240) -> str:
    if len(value) <= limit:
        return value

    shortened = value[: limit + 1].rsplit(" ", 1)[0].strip()
    return (shortened or value[:limit].strip()) + "..."


def format_pub_date(pub_date: str) -> str:
    try:
        parsed = parsedate_to_datetime(pub_date)
    except (TypeError, ValueError):
        return pub_date

    return parsed.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def build_payload(xml_bytes: bytes) -> dict:
    root = ET.fromstring(xml_bytes)
    items = root.findall("./channel/item")
    recent_watches = []

    for item in items:
        title = item.findtext("{https://letterboxd.com}filmTitle")
        if not title:
            continue

        description = item.findtext("description", default="")
        excerpt = shorten_text(strip_html(description))
        watched_date = item.findtext("{https://letterboxd.com}watchedDate", default="")
        year = item.findtext("{https://letterboxd.com}filmYear", default="")
        rating = item.findtext("{https://letterboxd.com}memberRating", default="")
        tmdb_id = item.findtext("{https://themoviedb.org}movieId", default="")

        recent_watches.append(
            {
                "title": title,
                "year": year,
                "url": item.findtext("link", default=""),
                "watchedDate": watched_date,
                "publishedAt": format_pub_date(item.findtext("pubDate", default="")),
                "rating": rating,
                "liked": item.findtext("{https://letterboxd.com}memberLike", default="No") == "Yes",
                "rewatch": item.findtext("{https://letterboxd.com}rewatch", default="No") == "Yes",
                "posterUrl": extract_poster_url(description),
                "excerpt": excerpt,
                "tmdbId": tmdb_id,
            }
        )

        if len(recent_watches) >= MAX_ITEMS:
            break

    return {
        "profileUrl": "https://letterboxd.com/ace_as_chase/",
        "rssUrl": RSS_URL,
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "watchCount": len(recent_watches),
        "watches": recent_watches,
    }


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = build_payload(fetch_rss(RSS_URL))
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Saved recent Letterboxd watches to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
