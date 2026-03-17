import argparse
import sys
import os
from pathlib import Path

# Shared GYG library
SHARED_DIR = Path(__file__).resolve().parents[2] / "getyourguideapi" / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from config import DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, TM_API_KEY, assert_runtime_config
from gyg_client import GYGClient
from experience_ranker import ExperienceRanker
from rw_content_generator import ContentGenerator
# Note: we use rw specific ones
from rw_db_seeder import DBSeeder
from rw_race_config import load_race_config
from session_parser import parse_sessions, derive_experience_windows
from tickets_client import TicketmasterClient

def main():
    parser = argparse.ArgumentParser(description="RaceWeekend Automation Pipeline")
    parser.add_argument("--race", required=True, help="Race slug (e.g. australia-f1-2026)")
    parser.add_argument("--track-image", help="Override track image path")
    parser.add_argument("--start-over", action="store_true", help="Wipe existing data for this race")
    parser.add_argument("--skip-gyg", action="store_true", help="Skip GYG fetch/score")
    parser.add_argument("--skip-sessions", action="store_true", help="Skip session/window seeding (preserve manually-set sessions)")
    
    args = parser.parse_args()
    
    # 0. Load TOML
    try:
        config = load_race_config(args.race)
    except FileNotFoundError as e:
        print(f"❌ {e}")
        sys.exit(1)
        
    # 1. Validate env
    assert_runtime_config()
    
    # Target raceweekend DB
    db = DBSeeder(db_name="raceweekend")
    rw_partner_id = os.getenv("RW_GYG_PARTNER_ID") or os.getenv("GYG_PARTNER_ID", "")
    gyg = GYGClient(
        circuit_lat=config.circuit_lat,
        circuit_lng=config.circuit_lng,
        city_slug=config.slug,
        location_slug=config.gyg_location_slug,
        partner_id=rw_partner_id
    )
    ranker = ExperienceRanker(config.scoring_agent)
    generator = ContentGenerator(config.content_agent)
    tickets_client = TicketmasterClient(api_key=TM_API_KEY)
    
    try:
        # 2. Upsert race
        print(f"\n🏎️  Step 2/8: Upserting race record for {config.slug}...")
        race_id = db.upsert_race(config)
        print(f"✅ Race ID: {race_id}")
        
        if args.start_over:
            print(f"🗑️  Wiping existing data for race {race_id}...")
            db.clear_race_data(race_id)
            
        # 3. Parse schedule
        if args.skip_sessions:
            print(f"\n📅 Step 3/8: Skipping session/window seeding (--skip-sessions).")
        else:
            print(f"\n📅 Step 3/8: Parsing schedule and seeding sessions/windows...")
            sessions = parse_sessions(config.schedule_string, race_id)
            windows = derive_experience_windows(sessions, race_id)
            db.upsert_sessions(race_id, sessions)
            db.upsert_experience_windows(race_id, windows)
            print(f"✅ Seeded {len(sessions)} sessions and {len(windows)} windows.")
        
        experiences = []
        if not args.skip_gyg:
            # 4. Fetch + filter GYG tours
            print(f"\n📦 Step 4/8: Fetching experiences for '{config.gyg_search_query}'...")
            experiences = gyg.fetch_and_filter(query=config.gyg_search_query, pages=config.gyg_pages)
            
            # 5. Fetch details
            print(f"\n🔍 Step 5/8: Fetching details for {len(experiences)} experiences...")
            experiences = gyg.fetch_details(experiences)
            
            # 6. Gemini scoring
            print(f"\n⚖️  Step 6/8: Scoring experiences via Gemini...")
            experiences = ranker.score_and_select(
                experiences=experiences,
                city_name=config.city,
                schedule_string=config.schedule_string,
                circuit_lat=config.circuit_lat,
                circuit_lng=config.circuit_lng,
                top_n=config.top_n,
                series=config.series
            )
            
            # 7. Enrichments (photos/reviews)
            print(f"\n🖼️  Step 7/8: Fetching enrichments...")
            experiences = gyg.fetch_enrichments(experiences)
            
            # Seed experiences
            db.upsert_experiences(race_id, experiences)
        
        # 7b. Tickets (Domain specific)
        print(f"\n🎟️  Step 7b: Fetching tickets from Ticketmaster...")
        tickets = tickets_client.fetch_tickets(config.name, config.city, config.race_date)
        db.upsert_tickets(race_id, tickets)
        print(f"✅ Seeded {len(tickets)} ticket options.")
        
        # 8. Gemini content + activation
        print(f"\n🤖 Step 8/8: Generating race content via Gemini...")
        race_content = generator.generate_all(
            city_name=config.city,
            race_name=config.name,
            circuit_name=config.circuit_name,
            schedule_string=config.schedule_string,
            series=config.series,
            track_image_path=config.track_image_path,
        )
        db.upsert_race_content(race_id, race_content)
        
        # Add track image copy
        if args.track_image:
            import shutil
            raceweekend_tracks = Path(__file__).resolve().parents[2] / "raceweekend" / "public" / "tracks"
            raceweekend_tracks.mkdir(parents=True, exist_ok=True)
            src = Path(args.track_image)
            if src.exists():
                shutil.copy2(src, raceweekend_tracks / src.name)
                print(f"✅ Copied track image → {raceweekend_tracks / src.name}")
            else:
                print(f"⚠️  Track image not found: {src}")
        
        print("🔗 Linking experiences to windows...")
        db.link_experience_windows(race_id)
        
        print("🏁 Activating race...")
        db.set_race_active(race_id, True)
        
        print(f"\n✅ Pipeline complete! {config.name} is now LIVE on raceweekend.")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
