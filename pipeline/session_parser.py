from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

DAY_ORDER = {"Thursday": 0, "Friday": 1, "Saturday": 2, "Sunday": 3}

SERIES_LABEL_RE = re.compile(r"(MotoGP™:|Moto2™:|Moto3™:)", re.IGNORECASE)

SESSION_RE = re.compile(
    r"(Sprint\s+Qualifying|Free\s+Practice(?:\s+Nr\.\s*[123])?|Practice(?:\s*[123])?|FP[123]|Qualifying(?:\s+Nr\.\s*[12])?|Qualifying\s*[12]?|Sprint|Race|Warm\s*up|Tissot\s+Sprint|Grand\s+Prix|Gear\s*Up|Pre-Event\s+Press\s+Conference|After\s+the\s+Flag|Sunday\s+Press\s+Conference|Press\s+Conference)\s+(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?",
    re.IGNORECASE,
)

NAME_MAP = {
    # Series Labels (Trigger state change)
    "MOTOGP™:": ("MotoGP", "GP", "race", "motogp", "MotoGP"),
    "MOTO2™:": ("Moto2", "M2", "race", "moto2", "Moto2"),
    "MOTO3™:": ("Moto3", "M3", "race", "moto3", "Moto3"),
    
    # MotoGP Sessions
    "FP1": ("Free Practice 1", "FP1", "fp1", "motogp", "MotoGP"),
    "FP2": ("Free Practice 2", "FP2", "fp2", "motogp", "MotoGP"),
    "FP3": ("Free Practice 3", "FP3", "fp3", "motogp", "MotoGP"),
    "FREEPRACTICENR.1": ("Free Practice 1", "FP1", "fp1", "motogp", "MotoGP"),
    "FREEPRACTICENR.2": ("Free Practice 2", "FP2", "fp2", "motogp", "MotoGP"),
    "FREEPRACTICENR.3": ("Free Practice 3", "FP3", "fp3", "motogp", "MotoGP"),
    "PRACTICE": ("Practice", "P", "fp2", "motogp", "MotoGP"),
    "PRACTICE1": ("Free Practice 1", "FP1", "fp1", "motogp", "MotoGP"),
    "PRACTICE2": ("Free Practice 2", "FP2", "fp2", "motogp", "MotoGP"),
    "PRACTICE3": ("Free Practice 3", "FP3", "fp3", "motogp", "MotoGP"),
    "QUALIFYING": ("Qualifying", "Q", "qualifying", "motogp", "MotoGP"),
    "QUALIFYING1": ("Qualifying 1", "Q1", "qualifying", "motogp", "MotoGP"),
    "QUALIFYING2": ("Qualifying 2", "Q2", "qualifying", "motogp", "MotoGP"),
    "QUALIFYINGNR.1": ("Qualifying 1", "Q1", "qualifying", "motogp", "MotoGP"),
    "QUALIFYINGNR.2": ("Qualifying 2", "Q2", "qualifying", "motogp", "MotoGP"),
    "SPRINTQUALIFYING": ("Sprint Qualifying", "SQ", "qualifying", "motogp", "MotoGP"),
    "SPRINT": ("Sprint", "SPR", "sprint", "motogp", "MotoGP"),
    "TISSOTSPRINT": ("Sprint", "SPR", "sprint", "motogp", "MotoGP"),
    "RACE": ("Race", "R", "race", "motogp", "MotoGP"),
    "GRANDPRIX": ("Race", "R", "race", "motogp", "MotoGP"),
    "WARMUP": ("Warm Up", "WU", "warmup", "motogp", "MotoGP"),
    "GEARUP": ("GearUp", "GU", "event", "motogp", "MotoGP"),
    "PRE-EVENTPRESSCONFERENCE": ("Pre-Event Press Conference", "PC", "event", "motogp", "MotoGP"),
    "PRESSCONFERENCE": ("Press Conference", "PC", "event", "motogp", "MotoGP"),
    "AFTERTHEFLAG": ("After the Flag", "ATF", "event", "motogp", "MotoGP"),
    "SUNDAYPRESSCONFERENCE": ("Sunday Press Conference", "SPC", "event", "motogp", "MotoGP"),

    # Moto2
    "MOTO2™": ("Moto2", "M2", "race", "moto2", "Moto2"),
    
    # Moto3
    "MOTO3™": ("Moto3", "M3", "race", "moto3", "Moto3"),
}


def parse_sessions(schedule_string: str, race_id: int) -> list[dict[str, Any]]:
    sessions: list[dict[str, Any]] = []

    # State tracking to catch the series label that precedes the session
    current_series_key = "motogp"
    current_series_label = "MotoGP"

    for raw_line in schedule_string.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        
        # Reset state for each new day line - force a series match to occur
        current_series_key = None
        current_series_label = None

        day_match = re.match(r"^(Thursday|Friday|Saturday|Sunday)\s+\d{1,2}\s+\w{3}\s*:\s*(.+)$", line, re.IGNORECASE)
        if day_match:
            day = day_match.group(1).capitalize()
            payload = day_match.group(2)

            # Merge series label matches and session matches sorted by position
            # so series labels always update state before the sessions that follow them.
            events = []
            for m in SERIES_LABEL_RE.finditer(payload):
                events.append((m.start(), "label", m))
            for m in SESSION_RE.finditer(payload):
                events.append((m.start(), "session", m))
            events.sort(key=lambda x: x[0])

            for _, kind, m in events:
                if kind == "label":
                    key = re.sub(r"\s+", "", m.group(1)).upper()
                    _, _, _, current_series_key, current_series_label = NAME_MAP[key]
                    continue

                # Session match
                raw_name, start_hm, end_hm = m.groups()
                key = re.sub(r"\s+", "", raw_name).upper()

                if key not in NAME_MAP:
                    continue

                if not current_series_label:
                    continue

                if not end_hm:
                    # Default to 45 mins if no end time provided (e.g. Race start time only)
                    h, m_val = map(int, start_hm.split(':'))
                    dt = datetime(2000, 1, 1, h, m_val) + timedelta(minutes=45)
                    end_hm = dt.strftime("%H:%M")

                full_name, short_name, session_type, _, _ = NAME_MAP[key]

                # Prefix short_name with series to avoid unique constraint conflicts
                # e.g. "Moto3 FP1" vs "MotoGP FP1"
                prefixed_short_name = f"{current_series_label} {short_name}"

                sessions.append(
                    {
                        "race_id": race_id,
                        "name": f"{current_series_label} {full_name}",
                        "short_name": prefixed_short_name,
                        "session_type": session_type,
                        "day_of_week": day,
                        "start_time": _to_hms(start_hm),
                        "end_time": _to_hms(end_hm),
                        "series_key": current_series_key,
                        "series_label": current_series_label,
                    }
                )

    sessions.sort(
        key=lambda s: (
            DAY_ORDER.get(str(s["day_of_week"]), 9),
            str(s["start_time"]),
            str(s["short_name"]),
        )
    )
    return sessions


def derive_experience_windows(
    sessions: list[dict[str, Any]], race_id: int
) -> list[dict[str, Any]]:
    by_day: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for s in sessions:
        by_day[str(s["day_of_week"])].append(s)

    windows: list[dict[str, Any]] = []
    sort_order = 1

    for day in ["Thursday", "Friday", "Saturday", "Sunday"]:
        day_sessions = sorted(by_day.get(day, []), key=lambda s: str(s["start_time"]))
        if not day_sessions:
            continue

        first_start = _parse_time(day_sessions[0]["start_time"])
        if first_start > _parse_time("10:00:00"):
            start = _parse_time("08:00:00")
            end = first_start - timedelta(minutes=45)
            if end > start:
                dur = (end - start).total_seconds() / 3600
                windows.append(
                    _window_record(
                        race_id=race_id,
                        slug=f"{day.lower()}-morning",
                        label=f"{day} Morning (Pre-{day_sessions[0]['short_name']})",
                        day=day,
                        start=start,
                        end=end,
                        max_hours=min(4.0, dur),
                        description=f"Best slot before {day_sessions[0]['name']}.",
                        sort_order=sort_order,
                    )
                )
                sort_order += 1

        for i in range(len(day_sessions) - 1):
            current = day_sessions[i]
            nxt = day_sessions[i + 1]
            gap_start = _parse_time(current["end_time"])
            gap_end = _parse_time(nxt["start_time"])
            gap_mins = int((gap_end - gap_start).total_seconds() // 60)
            if gap_mins >= 90:
                dur = gap_mins / 60
                windows.append(
                    _window_record(
                        race_id=race_id,
                        slug=f"{day.lower()}-gap-{i + 1}",
                        label=f"{day} Gap ({current['short_name']}–{nxt['short_name']})",
                        day=day,
                        start=gap_start,
                        end=gap_end,
                        max_hours=min(4.0, dur),
                        description=f"Session gap between {current['name']} and {nxt['name']}.",
                        sort_order=sort_order,
                    )
                )
                sort_order += 1

        last_end = _parse_time(day_sessions[-1]["end_time"])
        evening_end = _parse_time("22:00:00")
        if last_end < evening_end:
            dur = (evening_end - last_end).total_seconds() / 3600
            windows.append(
                _window_record(
                    race_id=race_id,
                    slug=f"{day.lower()}-evening",
                    label=f"{day} Evening (Post-{day_sessions[-1]['short_name']})",
                    day=day,
                    start=last_end,
                    end=evening_end,
                    max_hours=min(4.0, dur),
                    description=f"Evening window after {day_sessions[-1]['name']}.",
                    sort_order=sort_order,
                )
            )
            sort_order += 1

    return windows


def _window_record(
    race_id: int,
    slug: str,
    label: str,
    day: str,
    start: datetime,
    end: datetime,
    max_hours: float,
    description: str,
    sort_order: int,
) -> dict[str, Any]:
    return {
        "race_id": race_id,
        "slug": slug,
        "label": label,
        "day_of_week": day,
        "start_time": start.strftime("%H:%M:%S"),
        "end_time": end.strftime("%H:%M:%S"),
        "max_duration_hours": round(max_hours, 1),
        "description": description,
        "sort_order": sort_order,
    }


def _to_hms(value: str) -> str:
    hh, mm = value.split(":")
    return f"{int(hh):02d}:{int(mm):02d}:00"


def _parse_time(value: str) -> datetime:
    return datetime.strptime(str(value), "%H:%M:%S")
