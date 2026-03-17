
import sys
from pathlib import Path

# Add shared dir to path for config
SHARED_DIR = Path(__file__).resolve().parents[1] / "getyourguideapi" / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from rw_db_seeder import DBSeeder

def check_db():
    db = DBSeeder()
    cur = db.conn.cursor(dictionary=True)
    
    race_id = 46
    print(f"--- Sessions for Race ID {race_id} ---")
    cur.execute(
        "SELECT name, day_of_week, start_time, end_time FROM sessions WHERE race_id = %s ORDER BY FIELD(day_of_week, 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time",
        (race_id,)
    )
    rows = cur.fetchall()
    for row in rows:
        print(f"{row['day_of_week']}: {row['name']} ({row['start_time']} - {row['end_time']})")
    
    print(f"\n--- Windows for Race ID {race_id} ---")
    cur.execute(
        "SELECT label, day_of_week, start_time, end_time FROM experience_windows WHERE race_id = %s ORDER BY sort_order",
        (race_id,)
    )
    rows = cur.fetchall()
    for row in rows:
        print(f"{row['day_of_week']}: {row['label']} ({row['start_time']} - {row['end_time']})")
        
    db.close()

if __name__ == "__main__":
    check_db()
