#!/usr/bin/env python3
import argparse
import sys
import os
from pathlib import Path

# Shared GYG library
SHARED_DIR = Path(__file__).resolve().parents[2] / "getyourguideapi" / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from rw_db_seeder import DBSeeder
from rw_content_generator import ContentGenerator
from rw_race_config import load_race_config

def backfill(race_slug=None):
    db = DBSeeder("raceweekend")
    generator = ContentGenerator()
    
    try:
        if race_slug:
            # Single race
            cursor = db.conn.cursor(dictionary=True)
            cursor.execute("SELECT id, slug, series, name, city, circuit_name FROM races WHERE slug = %s", (race_slug,))
            races = cursor.fetchall()
        else:
            # All races with missing hero_title OR city_guide
            cursor = db.conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT r.id, r.slug, r.series, r.name, r.city, r.circuit_name 
                FROM races r
                LEFT JOIN race_content rc ON r.id = rc.race_id
                WHERE rc.hero_title IS NULL OR rc.hero_title = ''
                   OR rc.city_guide IS NULL OR rc.city_guide = ''
            """)
            races = cursor.fetchall()

        if not races:
            print("No races found that need backfilling.")
            return

        print(f"Found {len(races)} races to backfill.")

        for r in races:
            slug = r['slug']
            series = r['series']
            race_id = r['id']
            print(f"\n🔄 Backfilling {slug} (ID: {race_id})...")
            
            try:
                # Try raw slug first, then slug with -f1 or -motogp suffix permutations
                config = None
                paths_to_try = [slug, f"{slug.replace('-2026', '')}-{series}-2026", f"{slug}-{series}"]

                for p in paths_to_try:
                    try:
                        config = load_race_config(p)
                        print(f"  Found config: {p}.toml")
                        break
                    except FileNotFoundError:
                        continue

                # Fallback: scan all TOML files and match by city name
                if not config:
                    races_dir = Path(__file__).resolve().parent / "races"
                    city_lower = r['city'].lower()
                    for toml_path in sorted(races_dir.glob("*.toml")):
                        if toml_path.stem == "_template":
                            continue
                        try:
                            candidate = load_race_config(toml_path.stem)
                            if (candidate.series == series and
                                    str(candidate.season) in slug and
                                    candidate.city.lower() in city_lower):
                                config = candidate
                                print(f"  Found config by city match: {toml_path.stem}.toml")
                                break
                        except Exception:
                            continue

                if not config:
                    print(f"  ⚠️  Config not found for {slug} (tried: {', '.join(paths_to_try)} + city scan), skipping.")
                    continue

                print(f"  🤖 Generating content for {config.name}...")
                content = generator.generate_all(
                    city_name=config.city,
                    race_name=config.name,
                    circuit_name=config.circuit_name,
                    schedule_string=config.schedule_string,
                    series=config.series,
                    track_image_path=config.track_image_path
                )
                db.upsert_race_content(race_id, content)
                print(f"  ✅ Updated content for {slug}")
            except FileNotFoundError:
                print(f"  ⚠️  Config not found for {slug}, skipping.")
            except Exception as e:
                print(f"  ❌ Error backfilling {slug}: {e}")

    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill missing raceweekend content")
    parser.add_argument("--race", help="Specific race slug to backfill")
    args = parser.parse_args()
    
    backfill(args.race)
