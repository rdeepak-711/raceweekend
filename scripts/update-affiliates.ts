import { db } from '../src/lib/db';
import { experiences } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Path to the CSV file relative to the raceweekend folder
const CSV_PATH = path.join(__dirname, '../../getyourguideapi/fetch_new/1experiences.csv');

async function main() {
  console.log('🚀 Starting affiliate link update...');

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found at: ${CSV_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n');
  
  // Skip header
  const dataLines = lines.slice(1);
  
  let updatedCount = 0;
  let errorCount = 0;
  let skipCount = 0;

  console.log(`📊 Processing ${dataLines.length} potential updates...`);

  for (const line of dataLines) {
    if (!line.trim()) continue;

    // Basic CSV parser for "title","url"
    // Regex matches quoted strings or unquoted content between commas
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    
    if (!matches || matches.length < 2) {
      skipCount++;
      continue;
    }

    const title = matches[0].replace(/^"|"$/g, '').trim();
    const affiliateUrl = matches[1].replace(/^"|"$/g, '').trim();

    try {
      // Find and update all experiences with this title
      const result = await db.update(experiences)
        .set({ affiliate_url: affiliateUrl })
        .where(eq(experiences.title, title));
      
      // result[0].affectedRows if using mysql2 driver directly, 
      // but with drizzle it depends on the driver. 
      // For mysql2 it returns an array where the first element is the ResultSetHeader
      const affectedRows = (result[0] as any).affectedRows;
      
      if (affectedRows > 0) {
        updatedCount += affectedRows;
        if (updatedCount % 50 === 0) {
          console.log(`✅ Updated ${updatedCount} rows...`);
        }
      } else {
        // console.log(`⚠️ No match found for: "${title}"`);
      }
    } catch (error) {
      console.error(`❌ Error updating "${title}":`, error);
      errorCount++;
    }
  }

  console.log('\n✨ Update Complete!');
  console.log(`✅ Total Rows Updated: ${updatedCount}`);
  console.log(`⚠️ Errors: ${errorCount}`);
  console.log(`⏭️  Lines Skipped (invalid format): ${skipCount}`);
  
  process.exit(0);
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
