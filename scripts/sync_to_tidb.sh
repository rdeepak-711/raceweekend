#!/bin/bash
# Reusable script to dump local 'raceweekend' and push to TiDB 'fightcity'

# Local MySQL credentials
LOCAL_USER="root"
LOCAL_PASS="12345678"
LOCAL_DB="raceweekend"
LOCAL_HOST="localhost"
LOCAL_PORT="3306"

# TiDB credentials (extracted from connection string)
TIDB_USER="CJaZ7centnuDidP.root"
TIDB_PASS="cczmaRwvZh2z21nY"
TIDB_HOST="gateway01.us-east-1.prod.aws.tidbcloud.com"
TIDB_PORT="4000"
TIDB_DB="raceweekend"

DUMP_FILE="raceweekend_dump.sql"

echo "--- Starting DB Sync ---"
echo "1. Creating dump of local database: $LOCAL_DB"

# Using --set-gtid-purged=OFF for compatibility with cloud databases like TiDB
mysqldump -u "$LOCAL_USER" -p"$LOCAL_PASS" -h "$LOCAL_HOST" -P "$LOCAL_PORT" --set-gtid-purged=OFF "$LOCAL_DB" > "$DUMP_FILE"

if [ $? -ne 0 ]; then
    echo "Error: Local dump failed"
    exit 1
fi

echo "Successfully created $DUMP_FILE"
echo "2. Pushing to TiDB database: $TIDB_DB"

# Connect and push the dump
mysql -u "$TIDB_USER" -p"$TIDB_PASS" -h "$TIDB_HOST" -P "$TIDB_PORT" "$TIDB_DB" < "$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo "Success: Data pushed to TiDB cluster!"
else
    echo "Error: Failed to push data to TiDB"
    exit 1
fi

echo "--- Sync Complete ---"
