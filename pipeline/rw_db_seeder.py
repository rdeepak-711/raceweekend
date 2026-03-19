from __future__ import annotations

import json
from typing import Any

import mysql.connector

import sys
from pathlib import Path

# Shared GYG library
SHARED_DIR = Path(__file__).resolve().parents[2] / "getyourguideapi" / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from config import DB_HOST, DB_PASSWORD, DB_PORT, DB_USER


class DBSeeder:
    def __init__(self, db_name: str = "raceweekend"):
        self.db_name = db_name
        self.conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=db_name,
            autocommit=False,
        )

    def close(self):
        if self.conn:
            self.conn.close()

    def upsert_race(self, config: Any) -> int:
        """Upsert the core race record and return its ID. Matches by series/season/round."""
        cur = self.conn.cursor(buffered=True)
        
        # 1. Try to find existing race by Series, Season and Round
        cur.execute(
            "SELECT id FROM races WHERE series = %s AND season = %s AND round = %s",
            (config.series, config.season, config.round)
        )
        row = cur.fetchone()
        
        if row:
            race_id = int(row[0])
            print(f"   Found existing record for {config.series} Round {config.round} (ID: {race_id}). Updating...")
            sql = """
                UPDATE races SET
                    slug=%s, name=%s, circuit_name=%s, city=%s, country=%s,
                    country_code=%s, circuit_lat=%s, circuit_lng=%s, timezone=%s,
                    race_date=%s, flag_emoji=%s
                WHERE id=%s
            """
            params = (
                config.slug, config.name, config.circuit_name, config.city, config.country,
                config.country_code, config.circuit_lat, config.circuit_lng, config.timezone,
                config.race_date, config.flag_emoji, race_id
            )
            cur.execute(sql, params)
        else:
            print(f"   No existing record for {config.series} Round {config.round}. Inserting new...")
            sql = """
                INSERT INTO races (
                    slug, name, series, season, round, circuit_name, city, country, country_code,
                    circuit_lat, circuit_lng, timezone, race_date, flag_emoji, is_active
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0)
            """
            params = (
                config.slug, config.name, config.series, config.season, config.round, config.circuit_name,
                config.city, config.country, config.country_code, config.circuit_lat,
                config.circuit_lng, config.timezone, config.race_date, config.flag_emoji
            )
            cur.execute(sql, params)
            race_id = cur.lastrowid

        self.conn.commit()
        cur.close()
        return race_id

    def clear_race_data(self, race_id: int) -> None:
        """Delete all seeded data for this race. FK-safe order."""
        cur = self.conn.cursor(buffered=True)
        cur.execute(
            "DELETE ewm FROM experience_windows_map ewm "
            "JOIN experience_windows ew ON ewm.window_id = ew.id "
            "WHERE ew.race_id = %s",
            (race_id,),
        )
        cur.execute("DELETE FROM experiences WHERE race_id = %s", (race_id,))
        cur.execute("DELETE FROM experience_windows WHERE race_id = %s", (race_id,))
        cur.execute("DELETE FROM sessions WHERE race_id = %s", (race_id,))
        cur.execute("DELETE FROM race_content WHERE race_id = %s", (race_id,))
        cur.execute("DELETE FROM tickets WHERE race_id = %s", (race_id,))
        self.conn.commit()
        cur.close()

    def upsert_sessions(self, race_id: int, sessions: list[dict[str, Any]]) -> None:
        if not sessions:
            return
        
        cur = self.conn.cursor(buffered=True)
        # Clear existing sessions for this race to avoid conflicts on unique keys (race_id, short_name)
        # since MotoGP has multiple races (Moto3, Moto2, MotoGP) on the same day.
        cur.execute("DELETE FROM sessions WHERE race_id = %s", (race_id,))
        
        sql = (
            "INSERT INTO sessions (race_id, name, short_name, session_type, day_of_week, start_time, end_time, series_key, series_label) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        )
        params = [
            (
                race_id,
                s.get("name"),
                s.get("short_name"),
                s.get("session_type"),
                s.get("day_of_week"),
                s.get("start_time"),
                s.get("end_time"),
                s.get("series_key"),
                s.get("series_label"),
            )
            for s in sessions
        ]
        cur.executemany(sql, params)
        self.conn.commit()
        cur.close()

    def upsert_experience_windows(self, race_id: int, windows: list[dict[str, Any]]) -> None:
        if not windows:
            return
        sql = (
            "INSERT INTO experience_windows "
            "(race_id, slug, label, day_of_week, start_time, end_time, max_duration_hours, description, sort_order) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) "
            "ON DUPLICATE KEY UPDATE "
            "label=VALUES(label), day_of_week=VALUES(day_of_week), start_time=VALUES(start_time), "
            "end_time=VALUES(end_time), max_duration_hours=VALUES(max_duration_hours), "
            "description=VALUES(description), sort_order=VALUES(sort_order)"
        )
        params = [
            (
                race_id,
                w.get("slug"),
                w.get("label"),
                w.get("day_of_week"),
                w.get("start_time"),
                w.get("end_time"),
                w.get("max_duration_hours"),
                w.get("description"),
                w.get("sort_order"),
            )
            for w in windows
        ]
        cur = self.conn.cursor(buffered=True)
        cur.executemany(sql, params)
        self.conn.commit()
        cur.close()

    def link_experience_windows(self, race_id: int) -> int:
        """Automatically link experiences to windows based on duration."""
        cur = self.conn.cursor(buffered=True)
        cur.execute("SELECT id, duration_hours FROM experiences WHERE race_id = %s", (race_id,))
        exps = cur.fetchall()
        cur.execute("SELECT id, max_duration_hours FROM experience_windows WHERE race_id = %s", (race_id,))
        windows = cur.fetchall()
        links = []
        for eid, e_dur in exps:
            e_dur = float(e_dur or 4.0)
            for wid, w_max in windows:
                w_max = float(w_max or 10.0)
                if e_dur <= w_max:
                    links.append((eid, wid))
        if links:
            cur.executemany("INSERT IGNORE INTO experience_windows_map (experience_id, window_id) VALUES (%s, %s)", links)
            self.conn.commit()
        count = len(links)
        cur.close()
        return count

    def has_sessions(self, race_id: int) -> bool:
        """Return True if sessions already exist for this race."""
        cur = self.conn.cursor(buffered=True)
        cur.execute("SELECT COUNT(*) FROM sessions WHERE race_id = %s", (race_id,))
        count = cur.fetchone()[0]
        cur.close()
        return count > 0

    def has_experiences(self, race_id: int) -> bool:
        """Return True if experiences already exist for this race."""
        cur = self.conn.cursor(buffered=True)
        cur.execute("SELECT COUNT(*) FROM experiences WHERE race_id = %s", (race_id,))
        count = cur.fetchone()[0]
        cur.close()
        return count > 0

    def has_content(self, race_id: int) -> bool:
        """Return True if race_content already exists for this race."""
        cur = self.conn.cursor(buffered=True)
        cur.execute("SELECT COUNT(*) FROM race_content WHERE race_id = %s", (race_id,))
        count = cur.fetchone()[0]
        cur.close()
        return count > 0

    def set_race_active(self, race_id: int, active: bool = True) -> None:
        """Activate the race in the UI."""
        cur = self.conn.cursor(buffered=True)
        cur.execute("UPDATE races SET is_active = %s WHERE id = %s", (1 if active else 0, race_id))
        self.conn.commit()
        cur.close()

    def upsert_race_content(self, race_id: int, content: dict[str, Any]) -> None:
        table_columns = set(self._get_table_columns("race_content"))
        payload = {k: v for k, v in dict(content).items() if k in table_columns}
        payload["race_id"] = race_id

        columns = list(payload.keys())
        values = [self._sql_value(payload[c]) for c in columns]
        updates = [c for c in columns if c != "race_id"]

        sql = (
            f"INSERT INTO race_content ({', '.join(columns)}) "
            f"VALUES ({', '.join(['%s'] * len(columns))}) "
            f"ON DUPLICATE KEY UPDATE {', '.join(f'{c}=VALUES({c})' for c in updates)}"
        )

        cur = self.conn.cursor(buffered=True)
        cur.execute(sql, values)
        self.conn.commit()
        cur.close()

    def upsert_experiences(self, race_id: int, experiences: list[dict[str, Any]]) -> None:
        if not experiences:
            return
        table_columns = set(self._get_table_columns("experiences"))
        mapped_rows: list[dict[str, Any]] = []

        for idx, exp in enumerate(experiences):
            row = {
                "race_id": race_id,
                "title": exp.get("title"),
                "slug": exp.get("slug"),
                "category": exp.get("category"),
                "description": exp.get("description"),
                "short_description": exp.get("short_description"),
                "abstract": exp.get("abstract"),
                "price_amount": exp.get("price_amount"),
                "price_currency": exp.get("price_currency"),
                "price_label": exp.get("price_label"),
                "duration_hours": min(exp.get("duration_hours") or 0, 99.9) or None,
                "duration_label": exp.get("duration_label"),
                "rating": exp.get("rating"),
                "review_count": exp.get("review_count"),
                "image_url": exp.get("image_url"),
                "image_emoji": exp.get("image_emoji"),
                "affiliate_url": exp.get("affiliate_url"),
                "affiliate_product_id": exp.get("gyg_product_id") or exp.get("affiliate_product_id"),
                "is_featured": bool(exp.get("is_featured") or False),
                "sort_order": idx,
                "is_active": bool(exp.get("is_active", True)),
                "highlights": exp.get("highlights") or [],
                "includes": exp.get("includes") or [],
                "excludes": exp.get("excludes") or [],
                "important_info": exp.get("important_info"),
                "photos": exp.get("photos_hires") or exp.get("photos") or [],
                "reviews_snapshot": exp.get("reviews_snapshot") or [],
                "f1_context": exp.get("f1_context"),
                "meeting_point": exp.get("meeting_point"),
                "bestseller": bool(exp.get("bestseller") or False),
                "original_price": exp.get("original_price"),
                "discount_pct": exp.get("discount_pct"),
                "has_pick_up": bool(exp.get("has_pick_up") or False),
                "mobile_voucher": bool(exp.get("mobile_voucher") or False),
                "instant_confirmation": bool(exp.get("instant_confirmation") or False),
                "skip_the_line": bool(exp.get("skip_the_line") or False),
                "options_snapshot": exp.get("options_snapshot") or [],
                "seo_keywords": exp.get("seo_keywords") or [],
                "f1_windows_label": exp.get("f1_windows_label"),
                "lat": exp.get("lat"),
                "lng": exp.get("lng"),
                "languages": exp.get("languages") or [],
                "distance_km": exp.get("distance_km"),
                "neighborhood": exp.get("neighborhood"),
                "travel_mins": exp.get("travel_mins"),
                "faq_items": exp.get("faq_items") or [],
                "guide_article": exp.get("guide_article"),
            }
            filtered = {k: v for k, v in row.items() if k in table_columns}
            mapped_rows.append(filtered)

        columns = sorted(mapped_rows[0].keys())
        value_rows = [tuple(self._sql_value(r.get(c)) for c in columns) for r in mapped_rows]
        update_cols = [c for c in ["rating", "review_count", "f1_context", "photos", "reviews_snapshot", "price_amount", "is_active", "sort_order", "description", "short_description", "image_url", "distance_km", "travel_mins"] if c in columns]

        sql = (
            f"INSERT INTO experiences ({', '.join(columns)}) "
            f"VALUES ({', '.join(['%s'] * len(columns))}) "
            f"ON DUPLICATE KEY UPDATE {', '.join(f'{c}=VALUES({c})' for c in update_cols)}"
        )
        cur = self.conn.cursor(buffered=True)
        cur.executemany(sql, value_rows)
        self.conn.commit()
        cur.close()

    def upsert_tickets(self, race_id: int, tickets: list[dict[str, Any]]) -> None:
        if not tickets:
            return
        cols = set(self._get_table_columns("tickets"))
        event_col = "tm_event_id" if "tm_event_id" in cols else "stubhub_event_id"
        
        sql = (
            f"INSERT INTO tickets (race_id, {event_col}, title, category, price_min, price_max, "
            "currency, quantity_available, ticket_url, section, `row`, zone, last_synced_at) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()) "
            "ON DUPLICATE KEY UPDATE "
            "title=VALUES(title), category=VALUES(category), price_min=VALUES(price_min), "
            "price_max=VALUES(price_max), currency=VALUES(currency), "
            "quantity_available=VALUES(quantity_available), ticket_url=VALUES(ticket_url), "
            "section=VALUES(section), `row`=VALUES(`row`), zone=VALUES(zone), "
            "last_synced_at=VALUES(last_synced_at)"
        )
        params = [(race_id, t.get("ticketmaster_event_id") or t.get("stubhub_event_id"), t.get("title"), t.get("category"), t.get("price_min"), t.get("price_max"), t.get("currency"), t.get("quantity_available"), t.get("ticket_url"), t.get("section"), t.get("row"), t.get("zone")) for t in tickets]
        cur = self.conn.cursor(buffered=True)
        cur.executemany(sql, params)
        self.conn.commit()
        cur.close()

    def _get_table_columns(self, table_name: str) -> list[str]:
        cur = self.conn.cursor(buffered=True)
        cur.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s", (self.db_name, table_name))
        rows = [r[0] for r in cur.fetchall()]
        cur.close()
        return rows

    @staticmethod
    def _sql_value(value: Any) -> Any:
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False)
        if isinstance(value, bool):
            return 1 if value else 0
        return value
