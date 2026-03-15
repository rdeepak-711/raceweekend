#!/usr/bin/env bash
# sync-db-to-tidb.sh
# Exports seeded tables from local MySQL and imports them into TiDB Cloud.
# Local creds from .env.local, TiDB creds from .env.tidb.
# Safe to run repeatedly — truncates content tables before import.
# Does NOT touch itineraries, affiliate_clicks, or contacts (user-generated data).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

# ── Parse a .env file and export matching vars ─────────────────────────────────
load_env() {
  local file="$1" prefix="$2"
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    [[ "$line" == "${prefix}"* ]] || continue
    local key="${line%%=*}"
    local val="${line#*=}"
    val="${val%\"}" val="${val#\"}" val="${val%\'}" val="${val#\'}"
    export "$key=$val"
  done < "$file"
}

# ── Load local DB credentials ──────────────────────────────────────────────────
LOCAL_ENV="$FRONTEND_DIR/.env.local"
if [[ ! -f "$LOCAL_ENV" ]]; then
  echo "ERROR: $LOCAL_ENV not found" >&2
  exit 1
fi
load_env "$LOCAL_ENV" "DATABASE_"

LOCAL_HOST="${DATABASE_HOST:-localhost}"
LOCAL_PORT="${DATABASE_PORT:-3306}"
LOCAL_USER="${DATABASE_USER:-root}"
LOCAL_PASS="${DATABASE_PASSWORD:-}"
LOCAL_DB="${DATABASE_NAME:-raceweekend}"

# ── Load TiDB credentials ──────────────────────────────────────────────────────
TIDB_ENV="$FRONTEND_DIR/.env.tidb"
if [[ ! -f "$TIDB_ENV" ]]; then
  echo "ERROR: $TIDB_ENV not found. Create it with TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD, TIDB_DB" >&2
  exit 1
fi
load_env "$TIDB_ENV" "TIDB_"

TIDB_HOST="${TIDB_HOST:?TIDB_HOST not set in .env.tidb}"
TIDB_PORT="${TIDB_PORT:-4000}"
TIDB_USER="${TIDB_USER:?TIDB_USER not set in .env.tidb}"
TIDB_PASS="${TIDB_PASSWORD:?TIDB_PASSWORD not set in .env.tidb}"
TIDB_DB="${TIDB_DB:-raceweekend}"

# ── Tables to sync (seeded content only) ──────────────────────────────────────
# Excludes: itineraries, affiliate_clicks, contacts (user-generated data)
TABLES="races sessions race_content experiences experience_windows experience_windows_map tickets"

# ── Export from local ─────────────────────────────────────────────────────────
TMPFILE="$(mktemp /tmp/raceweekend_sync_XXXXXX.sql)"
trap 'rm -f "$TMPFILE"' EXIT

echo "→ Exporting from local MySQL ($LOCAL_DB)..."
mysqldump \
  -h "$LOCAL_HOST" -P "$LOCAL_PORT" -u "$LOCAL_USER" -p"$LOCAL_PASS" \
  --no-create-info --skip-add-drop-table --complete-insert \
  "$LOCAL_DB" $TABLES \
  2>/dev/null > "$TMPFILE"

LINES=$(wc -l < "$TMPFILE" | tr -d ' ')
echo "  Exported $LINES lines."

# ── Truncate TiDB content tables (dependency order) ───────────────────────────
echo "→ Truncating TiDB content tables..."
mysql --host "$TIDB_HOST" --port "$TIDB_PORT" \
  -u "$TIDB_USER" -p"$TIDB_PASS" --ssl-mode=REQUIRED \
  "$TIDB_DB" 2>/dev/null <<'SQL'
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE experience_windows_map;
TRUNCATE TABLE experience_windows;
TRUNCATE TABLE experiences;
TRUNCATE TABLE sessions;
TRUNCATE TABLE race_content;
TRUNCATE TABLE tickets;
TRUNCATE TABLE races;
SET FOREIGN_KEY_CHECKS=1;
SQL

# ── Import to TiDB ────────────────────────────────────────────────────────────
echo "→ Importing to TiDB ($TIDB_DB)..."
mysql --host "$TIDB_HOST" --port "$TIDB_PORT" \
  -u "$TIDB_USER" -p"$TIDB_PASS" --ssl-mode=REQUIRED \
  "$TIDB_DB" 2>/dev/null < "$TMPFILE"

echo "✓ Sync complete."

# ── Verify ────────────────────────────────────────────────────────────────────
echo ""
echo "Row counts in TiDB:"
mysql --host "$TIDB_HOST" --port "$TIDB_PORT" \
  -u "$TIDB_USER" -p"$TIDB_PASS" --ssl-mode=REQUIRED \
  "$TIDB_DB" 2>/dev/null -e \
  "SELECT 'races'                  AS tbl, COUNT(*) AS cnt FROM races
   UNION ALL SELECT 'sessions',               COUNT(*) FROM sessions
   UNION ALL SELECT 'race_content',           COUNT(*) FROM race_content
   UNION ALL SELECT 'experiences',            COUNT(*) FROM experiences
   UNION ALL SELECT 'experience_windows',     COUNT(*) FROM experience_windows
   UNION ALL SELECT 'experience_windows_map', COUNT(*) FROM experience_windows_map
   UNION ALL SELECT 'tickets',               COUNT(*) FROM tickets;"
