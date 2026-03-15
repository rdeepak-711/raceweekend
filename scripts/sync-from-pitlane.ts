import { createRequire } from 'module';
import path from 'path';

// Robust module resolution
const require = createRequire(import.meta.url);
let mysql;

const tryPaths = [
  'mysql2/promise',
  path.join(process.cwd(), 'node_modules/mysql2/promise'),
  path.join(process.cwd(), '../f1weekend/node_modules/mysql2/promise'),
  path.join(process.cwd(), '../fightcity/node_modules/mysql2/promise'),
  '/Users/deepak/Desktop/firestormInternet/gyg-based/f1weekend/node_modules/mysql2/promise',
  '/Users/deepak/Desktop/firestormInternet/gyg-based/fightcity/node_modules/mysql2/promise',
];

for (const p of tryPaths) {
  try {
    mysql = require(p);
    console.log(`[db] Loaded mysql2 from: ${p}`);
    break;
  } catch (e) {}
}

if (!mysql) {
  console.error("❌ Could not find mysql2/promise in any standard location.");
  process.exit(1);
}

type PitlaneRace = {
  id: number;
  slug: string;
  race_date: string | null;
  circuit_name: string | null;
  circuit_lat: string | null;
  circuit_lng: string | null;
  timezone: string | null;
  city: string | null;
  country: string | null;
  country_code: string | null;
};

type RaceweekendRace = {
  id: number;
  slug: string;
};

type SourceSession = {
  id: number;
  name: string | null;
  short_name: string | null;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  session_type: string | null;
};

type SourceWindow = {
  id: number;
  slug: string;
  label: string | null;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  max_duration_hours: string | null;
  description: string | null;
  sort_order: number | null;
};

const SOURCE_DB = {
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "raceweekend",
};

const REQUESTED_EXPERIENCE_COLUMNS = [
  "title",
  "slug",
  "description",
  "short_description",
  "abstract",
  "category",
  "duration_hours",
  "duration_label",
  "price_amount",
  "price_currency",
  "price_label",
  "rating",
  "review_count",
  "image_url",
  "image_emoji",
  "photos",
  "affiliate_url",
  "affiliate_product_id",
  "highlights",
  "includes",
  "excludes",
  "important_info",
  "reviews_snapshot",
  "f1_context",
  "guide_article",
  "faq_items",
  "faq_ld",
  "meeting_point",
  "bestseller",
  "original_price",
  "discount_pct",
  "has_pick_up",
  "mobile_voucher",
  "instant_confirmation",
  "skip_the_line",
  "options_snapshot",
  "seo_keywords",
  "lat",
  "lng",
  "languages",
  "distance_km",
  "neighborhood",
  "travel_mins",
  "sort_order",
  "is_featured",
  "affiliate_partner",
  "source_event_id",
  "f1_windows_label",
];

function mapSessionType(sourceType: string | null, practiceIndex: number) {
  if (!sourceType) return { targetType: "event", nextPracticeIndex: practiceIndex };
  if (sourceType === "fp1" || sourceType === "fp2" || sourceType === "fp3" || sourceType === "practice") {
    return { targetType: "practice", nextPracticeIndex: practiceIndex + 1 };
  }
  if (sourceType === "qualifying") return { targetType: "qualifying", nextPracticeIndex: practiceIndex };
  if (sourceType === "race") return { targetType: "race", nextPracticeIndex: practiceIndex };
  if (sourceType === "sprint") return { targetType: "sprint", nextPracticeIndex: practiceIndex };
  if (sourceType === "support") return { targetType: "support", nextPracticeIndex: practiceIndex };
  if (sourceType === "event") return { targetType: "event", nextPracticeIndex: practiceIndex };
  return { targetType: sourceType, nextPracticeIndex: practiceIndex };
}

async function getTableColumns(
  conn: any,
  dbName: string,
  tableName: string
): Promise<Set<string>> {
  const [rows] = await conn.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [dbName, tableName]
  );
  return new Set(rows.map((r: any) => String(r.COLUMN_NAME)));
}

async function main() {
  console.log("🚀 Starting sync from Local to Cloud...");
  
  const source = await mysql.createConnection(SOURCE_DB);
  
  let target;
  const targetUrl = process.env.DATABASE_URL;
  let targetDbName = "raceweekend";

  if (targetUrl) {
    try {
      const url = new URL(targetUrl);
      targetDbName = url.pathname.substring(1);
      target = await mysql.createConnection({
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: url.username,
        password: decodeURIComponent(url.password),
        database: targetDbName,
        ssl: url.searchParams.has('ssl') ? { rejectUnauthorized: false } : undefined,
      });
    } catch (e) {
      console.error("❌ Failed to parse DATABASE_URL", e);
      process.exit(1);
    }
  } else {
    console.error("❌ DATABASE_URL (Target) not found in .env");
    process.exit(1);
  }

  console.log(
    `[sync] Source: ${SOURCE_DB.host}/${SOURCE_DB.database} | Target: ${targetUrl.split('@')[1]} (TiDB)`
  );

  const sourceExperienceColumns = await getTableColumns(source, SOURCE_DB.database, "experiences");
  const targetExperienceColumns = await getTableColumns(target, targetDbName, "experiences");
  const copyExperienceColumns = REQUESTED_EXPERIENCE_COLUMNS.filter(
    (col) => sourceExperienceColumns.has(col) && targetExperienceColumns.has(col)
  );
  console.log(`[sync] Experience columns copied: ${copyExperienceColumns.length}`);

  // Auto-discover all races from target
  const [targetRaces] = await target.execute("SELECT id, slug FROM races");

  for (const targetRace of targetRaces as RaceweekendRace[]) {
    console.log(`\n[sync] Processing: ${targetRace.slug}`);

    const [sourceRaceRows] = await source.execute(
      `SELECT id, slug FROM races WHERE slug = ? LIMIT 1`,
      [targetRace.slug]
    );
    const sourceRace = sourceRaceRows[0] as PitlaneRace | undefined;
    if (!sourceRace) {
      console.warn(`[sync] Source race not found for slug: ${targetRace.slug}`);
      continue;
    }

    // 1. Sync Sessions
    const [sourceSessions] = await source.execute(
      `SELECT * FROM sessions WHERE race_id = ?`,
      [sourceRace.id]
    );
    let practiceIndex = 1;
    for (const s of sourceSessions as SourceSession[]) {
      const { targetType, nextPracticeIndex } = mapSessionType(s.session_type, practiceIndex);
      practiceIndex = nextPracticeIndex;

      await target.execute(
        `INSERT IGNORE INTO sessions (race_id, name, short_name, session_type, day_of_week, start_time, end_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [targetRace.id, s.name, s.short_name, targetType, s.day_of_week, s.start_time, s.end_time]
      );
    }
    console.log(`[sync] Sessions: ${(sourceSessions as any).length} synced`);

    // 2. Sync Windows
    const [sourceWindows] = await source.execute(
      `SELECT * FROM experience_windows WHERE race_id = ?`,
      [sourceRace.id]
    );
    const windowMap = new Map<number, number>(); // sourceId -> targetId
    for (const w of sourceWindows as SourceWindow[]) {
      await target.execute(
        `INSERT INTO experience_windows (race_id, slug, label, day_of_week, start_time, end_time, max_duration_hours, description, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE label=VALUES(label), description=VALUES(description)`,
        [targetRace.id, w.slug, w.label, w.day_of_week, w.start_time, w.end_time, w.max_duration_hours, w.description, w.sort_order]
      );
      const [[tw]] = await target.execute(
        `SELECT id FROM experience_windows WHERE race_id = ? AND slug = ?`,
        [targetRace.id, w.slug]
      );
      windowMap.set(w.id, tw.id);
    }
    console.log(`[sync] Windows: ${(sourceWindows as any).length} synced`);

    // 3. Sync Experiences
    const [sourceExps] = await source.execute(
      `SELECT * FROM experiences WHERE race_id = ?`,
      [sourceRace.id]
    );
    for (const exp of sourceExps as any[]) {
      const colNames = copyExperienceColumns.join(", ");
      const placeholders = copyExperienceColumns.map(() => "?").join(", ");
      const values = copyExperienceColumns.map((col) => {
        const val = exp[col];
        if (typeof val === "object" && val !== null) return JSON.stringify(val);
        return val;
      });

      const updateClause = copyExperienceColumns
        .filter((col) => col !== "affiliate_product_id")
        .map((col) => `${col}=VALUES(${col})`)
        .join(", ");

      await target.execute(
        `INSERT INTO experiences (race_id, ${colNames})
         VALUES (?, ${placeholders})
         ON DUPLICATE KEY UPDATE ${updateClause}`,
        [targetRace.id, ...values]
      );

      // Get target exp ID
      const [[texp]] = await target.execute(
        `SELECT id FROM experiences WHERE race_id = ? AND affiliate_product_id = ?`,
        [targetRace.id, exp.affiliate_product_id]
      );

      if (texp) {
        // Sync experience_windows_map
        const [sourceMaps] = await source.execute(
          `SELECT window_id FROM experience_windows_map WHERE experience_id = ?`,
          [exp.id]
        );
        for (const m of sourceMaps as any[]) {
          const targetWindowId = windowMap.get(m.window_id);
          if (targetWindowId) {
            await target.execute(
              `INSERT IGNORE INTO experience_windows_map (experience_id, window_id) VALUES (?, ?)`,
              [texp.id, targetWindowId]
            );
          }
        }
      }
    }
    console.log(`[sync] Experiences: ${(sourceExps as any).length} synced`);
  }

  await source.end();
  await target.end();
  console.log("\n✨ Sync complete!");
}

main().catch((err) => {
  console.error("💥 Sync failed:", err);
  process.exit(1);
});
