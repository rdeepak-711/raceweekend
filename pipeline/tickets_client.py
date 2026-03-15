from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import requests


class TicketmasterClient:
    BASE_URL = "https://app.ticketmaster.com/discovery/v2"

    def __init__(self, api_key: str):
        self.api_key = (api_key or "").strip()

    def fetch_tickets(self, keyword: str, city: str, race_date: str) -> list[dict[str, Any]]:
        if not self.api_key:
            print("[tickets] TM_API_KEY missing; skipping ticket fetch")
            return []

        start_dt = datetime.strptime(race_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end_dt = (start_dt + timedelta(days=4)).replace(hour=23, minute=59, second=59)

        params = {
            "keyword": keyword,
            "city": city,
            "startDateTime": start_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "endDateTime": end_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "classificationName": "Sports",
            "apikey": self.api_key,
            "size": 50,
            "sort": "date,asc",
        }

        res = requests.get(f"{self.BASE_URL}/events.json", params=params, timeout=30)
        if not res.ok:
            print(f"[tickets] Ticketmaster API failed: {res.status_code} {res.text[:180]}")
            return []

        payload = res.json()
        events = ((payload.get("_embedded") or {}).get("events") or [])
        out = []

        for event in events:
            classifications = event.get("classifications") or [{}]
            segment = (classifications[0] or {}).get("segment") or {}
            ranges = event.get("priceRanges") or [{}]
            pr = ranges[0] if ranges else {}
            venues = ((event.get("_embedded") or {}).get("venues") or [{}])
            venue = venues[0] if venues else {}

            out.append(
                {
                    "ticketmaster_event_id": event.get("id"),
                    "title": event.get("name"),
                    "category": segment.get("name") or "",
                    "price_min": pr.get("min"),
                    "price_max": pr.get("max"),
                    "currency": pr.get("currency") or "USD",
                    "quantity_available": None,
                    "ticket_url": event.get("url"),
                    "section": None,
                    "row": None,
                    "zone": venue.get("name"),
                }
            )

        print(f"[tickets] fetched {len(out)} candidate ticket events")
        return out
