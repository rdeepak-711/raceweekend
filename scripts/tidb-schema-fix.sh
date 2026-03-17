#!/usr/bin/env bash
# One-time script: apply pending schema changes to TiDB that drizzle-kit
# can't apply non-interactively (unique constraints + year(4) → year fix).
# Run once, then delete.

set -euo pipefail

SECRETS="$HOME/Desktop/.secrets/raceweekend.env"
[[ -f "$SECRETS" ]] || { echo "ERROR: $SECRETS not found"; exit 1; }

load_env() {
  local file="$1" prefix="$2"
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    [[ "$line" == "${prefix}"* ]] || continue
    local key="${line%%=*}" val="${line#*=}"
    val="${val%\"}" val="${val#\"}" val="${val%\'}" val="${val#\'}"
    export "$key=$val"
  done < "$file"
}
load_env "$SECRETS" "TIDB_"

mysql \
  --host "$TIDB_HOST" --port "${TIDB_PORT:-4000}" \
  -u "$TIDB_USER" -p"$TIDB_PASSWORD" --ssl-mode=REQUIRED \
  "${TIDB_DB:-raceweekend}" <<'SQL'

SET FOREIGN_KEY_CHECKS=0;

-- Fix year(4) → year (cosmetic only, no data change)
ALTER TABLE races MODIFY COLUMN season YEAR;

-- Add unique constraints (safe if data is already unique)
CREATE UNIQUE INDEX IF NOT EXISTS races_slug_unique             ON races(slug);
CREATE UNIQUE INDEX IF NOT EXISTS ux_session_full              ON sessions(race_id, day_of_week, start_time, short_name);
CREATE UNIQUE INDEX IF NOT EXISTS ux_window_race_slug          ON experience_windows(race_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS ux_exp_race_product          ON experiences(race_id, affiliate_product_id);
CREATE UNIQUE INDEX IF NOT EXISTS race_content_race_id_unique  ON race_content(race_id);

SET FOREIGN_KEY_CHECKS=1;

SELECT 'Schema fix applied successfully.' AS status;

SQL

echo "Done. TiDB schema is now in sync. Future 'git push' will be a no-op for schema."
