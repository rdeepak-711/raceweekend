/**
 * Enrichment Pipeline for Race Content.
 * Uses title-based heuristics and factual mapping to backfill travel/stay info.
 */
import mysql from 'mysql2/promise';

const CIRCUIT_INTEL: Record<string, any> = {
  'italy-f1-2026': {
    stay: "For the 'Temple of Speed', staying in Milan is the most popular choice, offering endless dining and nightlife options just 30 minutes away by train. Alternatively, the town of Monza or near Lake Como provides a more scenic, relaxed atmosphere closer to the park.",
    getting: "The best way to reach Monza is by train from Milano Centrale or Porta Garibaldi to Monza Station. During race weekend, special shuttle buses run frequently from the station directly to the circuit gates. Driving is highly discouraged due to extreme traffic and limited parking.",
    tips: [
      { heading: "Secure Milan Centrale Base", body: "Stay within walking distance of Milano Centrale. This is the primary hub for the 'Trenord' race specials that run directly to Monza, saving you hours of transit time across the weekend." },
      { heading: "Radio Frequency Intel", body: "Bring a handheld radio to the track. Monza's grandstands are atmospheric but the public address system can be hard to hear over the V6 engines; tuning into 102.2 FM will keep you updated on the tactical battle." },
      { heading: "Comfort Over Style", body: "The walk through the Royal Park of Monza is legendary but exhausting. You will likely clock 15,000+ steps per day on gravel and dirt paths, so prioritize broken-in sneakers over team gear." }
    ]
  },
  'singapore-f1-2026': {
    stay: "The Marina Bay area is the heart of the action, with luxury hotels offering trackside views. For more budget-friendly options, look toward Clarke Quay or Bugis, which are well-connected by the MRT system.",
    getting: "Singapore's MRT is the ultimate way to get to the street circuit. Most gates are within a 5-10 minute walk of City Hall, Raffles Place, or Esplanade stations. Taxis are difficult to find during track sessions due to widespread road closures.",
    tips: [
      { heading: "Hydration Strategy", body: "Singapore's 90% humidity is punishing even at night. Most zones allow you to bring in one small clear plastic bottle of water; utilize the refilling stations throughout the circuit early before queues form." },
      { heading: "MRT Top-Up Protocol", body: "Avoid the post-race ticket machine chaos. Use a contactless credit card or top up your EZ-Link card with at least $20 before heading to the circuit on Friday to ensure a smooth exit after the concerts." },
      { heading: "Post-Race Concert Exit", body: "If you're watching the main stage acts at the Padang, exit via Gate 3 or 4. These gates offer the most direct routes back to the MRT lines that bypass the heaviest crowds in the Marina Bay sector." }
    ]
  },
  'las-vegas-f1-2026': {
    stay: "Stay on the Strip to be at the center of the spectacle. Hotels like the Bellagio, Caesars Palace, and the Venetian offer the most iconic views, while downtown Fremont Street provides a different vibe and often better value.",
    getting: "Walking is the primary way to move around the Strip circuit, but be prepared for complex pedestrian bridges and security checkpoints. The Las Vegas Monorail is a great alternative for bypassing surface-level traffic.",
    tips: [
      { heading: "Desert Thermal Management", body: "Don't let the neon fool you—November in the Mojave desert is cold after midnight. Temperatures regularly drop to 10°C (50°F); bring a medium-weight jacket for the late-night qualifying and race sessions." },
      { heading: "Monorail Tactical Advantage", body: "The Monorail is the 'secret' way to bypass Strip closures. Buy a multi-day pass in advance. It runs behind the casinos on the east side of the track and is the only reliable transport during live track sessions." },
      { heading: "Dinner Reservation Window", body: "Vegas restaurants reach 100% capacity during race weekend. Book your 'Apex' dining times 60-90 days in advance, focusing on venues inside your ticketed zone to avoid crossing track bridges." }
    ]
  },
  'united-states-f1-2026': {
    stay: "Downtown Austin is the best place to stay for the full 'Live Music Capital' experience. If you prefer to be closer to the track, look for rentals in the Del Valle area, though dining options there are limited.",
    getting: "The COTA Shuttle program from downtown or Barton Creek Mall is the most reliable way to reach the track. Uber and Lyft are available but expect significant surge pricing and long wait times after the race.",
    tips: [
      { heading: "The Turn 1 Hike", body: "The climb from the Main Grandstand to Turn 1 is significantly steeper than it looks on TV. If you have GA tickets, arrive when gates open at 8:00 AM to secure a spot at the top of the hill for the best viewing angle." },
      { heading: "Shuttle Hub Selection", body: "The Waterloo Park shuttle is the most efficient. It's located in the heart of the nightlife district, allowing you to transition from the track to 6th Street bars in under 45 minutes after the session ends." },
      { heading: "Sun Protection Protocol", body: "COTA has very little natural shade. Even in October, the Texas sun is intense. A wide-brimmed hat and high-SPF sunscreen are mandatory tactical gear to avoid a weekend-ruining sunburn." }
    ]
  }
};

const DEFAULT_TIPS = [
  { heading: "Early Booking Protocol", body: "Race weekend accommodation prices increase by 300% as the event nears. Secure your base at least 6 months out, preferably with a flexible cancellation policy in case your travel plans shift." },
  { heading: "Official Transport Sync", body: "Private vehicles are a logistical nightmare at most circuits. Always prioritize the official event shuttle buses or local rail networks, which usually have dedicated lanes and bypass major trackside traffic jams." },
  { heading: "Circuit Amenity Intelligence", body: "Download the official circuit app before arriving. Most modern tracks now offer real-time queue lengths for food and restrooms, along with digital maps that show the fastest walking routes between fan zones." }
];

const DEFAULT_STAY = "We recommend booking accommodation in the city center for the best balance of transport links and local culture. Use our integrated maps to find highly-rated hotels with easy access to the circuit shuttle points.";
const DEFAULT_GETTING = "Official shuttle buses usually operate from the main city transport hubs directly to the circuit gates. We recommend using public transport or official event shuttles over private vehicles to avoid race-day traffic.";

function getRaceIntel(race: any) {
  const intel = CIRCUIT_INTEL[race.slug] || {};
  return {
    where_to_stay: intel.stay || DEFAULT_STAY,
    getting_there: intel.getting || DEFAULT_GETTING,
    travel_tips: JSON.stringify(intel.tips || DEFAULT_TIPS)
  };
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'raceweekend',
  });

  const [rows] = await conn.execute('SELECT id, slug, city, series FROM races WHERE is_active = 1');
  const races = rows as any[];
  
  console.log(`🔍 Enriching race content with rich tips for ${races.length} races...`);

  for (const race of races) {
    const intel = getRaceIntel(race);
    
    // Check if entry exists in race_content
    const [existing] = await conn.execute('SELECT id FROM race_content WHERE race_id = ?', [race.id]);
    
    if ((existing as any[]).length > 0) {
      await conn.execute(
        'UPDATE race_content SET where_to_stay = ?, getting_there = ?, travel_tips = ? WHERE race_id = ?',
        [intel.where_to_stay, intel.getting_there, intel.travel_tips, race.id]
      );
    } else {
      await conn.execute(
        'INSERT INTO race_content (race_id, where_to_stay, getting_there, travel_tips) VALUES (?, ?, ?, ?)',
        [race.id, intel.where_to_stay, intel.getting_there, intel.travel_tips]
      );
    }
    console.log(`✅ Processed ${race.slug}`);
  }

  console.log('✨ Rich content enrichment complete.');
  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
