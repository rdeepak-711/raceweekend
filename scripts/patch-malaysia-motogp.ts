/**
 * Patch Malaysia MotoGP 2026:
 *  - Update: round=19, correct name, ticket URLs
 *  - Upsert race_content with full Sepang/Kuala Lumpur guide
 * Run: npx tsx scripts/patch-malaysia-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'malaysia-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Petronas Grand Prix of Malaysia',
    round: 19,
    official_tickets_url: 'https://tickets.motogp.com/en/21101-malaysia/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-malaysia',
  }).where(eq(races.slug, 'malaysia-motogp-2026'));
  console.log('Updated malaysia-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Sepang MotoGP Malaysia Guide',
    hero_subtitle: 'Sepang International Circuit · Selangor, Malaysia',
    guide_intro: 'Sepang International Circuit — Malaysia\'s iconic tilke-designed venue opened in 1999 — sits 45 km south of Kuala Lumpur in Selangor, just minutes from Kuala Lumpur International Airport. The 5.543 km circuit is one of the longest on the MotoGP calendar: a sweeping main straight, twin back straights, and a complex infield section of slow chicanes and tight hairpins that punishes set-up mistakes and rewards top-end power. Racing in Malaysia in late October and November means full tropical heat and humidity — temperatures above 35°C, the real possibility of heavy tropical downpours, and the atmosphere of an Asian motorsport crowd that has been coming to Sepang since Valentino Rossi\'s era. Kuala Lumpur — extraordinary street food, extraordinary skyline, and one of Asia\'s most underrated city experiences — is the obvious base.',
    why_city_text: 'Sepang has a particular place in MotoGP history — this is where Marco Simoncelli was killed in 2011, and where Valentino Rossi won some of his most celebrated races of the 2000s. The circuit is demanding, the climate unrelenting, and the spectacle of MotoGP machinery at full chat on the Sepang back straight — in heat that makes the air shimmer — is unforgettable. Malaysia is also one of Southeast Asia\'s great food destinations: the hawker centres of KL, the Mamak stalls open at 3am, the char kway teow and nasi lemak that define a street food culture among the world\'s finest. Combine the race with 2–3 days in Kuala Lumpur and this becomes one of the calendar\'s standout travel experiences.',
    highlights_list: [
      'Sepang — One of MotoGP\'s Longest & Fastest Circuits',
      'Kuala Lumpur — Petronas Twin Towers & Skyline',
      'Malaysian Street Food — Hawker Centres & Mamak Stalls',
      'Batu Caves & Cultural Heritage',
      'Tropical November Atmosphere',
    ],
    city_guide: `## About Sepang International Circuit

Sepang International Circuit (SIC) was designed by Hermann Tilke and opened in 1999 — the same year as the first Malaysian Grand Prix. It sits within the Sepang Aeropolis development zone, 2 km from KLIA (Kuala Lumpur International Airport) and 45 km south of central KL. At 5.543 km, it is one of the longest circuits on the MotoGP calendar. The layout is distinctive: a long main straight leading into a tight right-hander, twin back straights through the infield, and a complex series of slow chicanes and hairpins that create intense braking zones and multiple overtaking opportunities. The circuit's roofed grandstands are a practical necessity — tropical downpours arrive without warning in late October, and the covered seating in the main grandstand means you watch the race in relative comfort whatever the weather. Temperatures typically reach 33–38°C with high humidity during the day.

## Kuala Lumpur

Kuala Lumpur (KL) is Malaysia's capital and one of Southeast Asia's great cities — more cosmopolitan, sophisticated, and affordable than its tourist reputation sometimes suggests. The **Petronas Twin Towers** (452 m — the world's tallest buildings from 1998 to 2004) dominate the skyline and are genuinely spectacular up close. The surrounding **KLCC Park** and **Suria KLCC** shopping centre make this a good starting point. But KL's real identity is in its neighbourhoods: **Bukit Bintang** (shopping, nightlife, hawker stalls on Jalan Alor), **Chinatown/Petaling Street** (temples, markets, street food), **Masjid India** (textiles, spices, Indian Muslim food), **Bangsar** (upscale dining, wine bars, expat-friendly), and **Chow Kit** (raw, chaotic, authentic). The **Batu Caves** (30 minutes north — limestone karst complex with Hindu temples, 272 coloured steps, and resident macaques) are one of Malaysia's most iconic sights.

## Malaysian Street Food

Malaysia has one of the world's great street food cultures — a unique fusion of Malay, Chinese, Indian, Nyonya (Peranakan), and Mamak (Indian-Muslim) traditions. **Nasi lemak** (coconut rice with sambal, fried anchovies, peanuts, and egg — Malaysia's national dish, eaten at breakfast, lunch, dinner, and 3am), **char kway teow** (wok-fried flat rice noodles with egg, cockles, and soy sauce — smoky, rich, the hawker centre staple), **roti canai** (layered flatbread with dhal and curry — Mamak breakfast perfection), **laksa** (spiced coconut soup with noodles — dozens of regional varieties), **Hainanese chicken rice** (poached chicken, fragrant rice, ginger sauce — simple, extraordinary), **satay** (grilled skewers over charcoal with peanut sauce), and **cendol** (shaved ice with coconut milk, palm sugar, and pandan jelly — the dessert to order in 35°C heat). **Jalan Alor** in Bukit Bintang is KL's most famous hawker street — go after 7pm when the stalls open. **Mamak stalls** (Indian-Muslim restaurants open 24 hours) are the social heart of Malaysian life — order teh tarik (pulled tea with condensed milk, poured dramatically between cups) and roti canai at midnight.

## Batu Caves & Heritage

**Batu Caves** (Gombak, 30 minutes north of KL by KTM Komuter) is Malaysia's most-visited landmark — a series of limestone caverns housing Hindu temples, topped by a 43-metre golden statue of Lord Murugan with 272 rainbow-painted steps ascending to the main cave. The main Temple Cave is impressive; the Dark Cave (guided tours) is extraordinary for geology. Go early morning to avoid the worst heat and crowds — ideally Thursday before the race. Also worth visiting: **Masjid Negara** (National Mosque), **Sultan Abdul Samad Building** (colonial-era Moorish architecture opposite Merdeka Square), and the **Islamic Arts Museum** (one of the finest of its kind in Southeast Asia).

## Getting Around KL & Sepang

KL has good rail infrastructure: the **MRT** (Mass Rapid Transit) and **LRT** (Light Rail Transit) cover most tourist areas, with interchanges at KL Sentral. For Sepang: the **KLIA Ekspres** train from KL Sentral reaches KLIA in 28 minutes — the circuit is a 5-minute drive from the terminal (race weekend shuttles run from KLIA). Alternatively, hire a car (Grab is excellent in KL — cheaper and more reliable than taxis). On race days, official shuttles run from KL Sentral and designated city points to the circuit — check SIC website for bookings.`,
    getting_there_intro: 'Kuala Lumpur International Airport (KLIA) is 2 km from Sepang Circuit — one of the most airport-adjacent circuits on the MotoGP calendar. KLIA has direct flights from London, Amsterdam, Paris, Frankfurt, Dubai, Singapore, Hong Kong, Tokyo, Sydney, and all regional hubs. The KLIA Ekspres train reaches central KL (KL Sentral) in 28 minutes. Race weekend shuttles run from KLIA directly to circuit gates.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Kuala Lumpur (KLIA) — circuit is 2 km away',
        desc: 'KLIA is one of the few circuits on the MotoGP calendar within minutes of a major international airport. Direct flights from London (13h, Malaysia Airlines/British Airways), Amsterdam (12h, KLM/Malaysia Airlines), Dubai (7h, Emirates), Singapore (50 min), Hong Kong (3.5h), Tokyo (7h), Sydney (8.5h). KLIA and KLIA2 (budget terminal — AirAsia) are both served. Arriving on Thursday gives a day in KL before Friday practice.',
      },
      {
        icon: '🚅',
        title: 'KLIA Ekspres to KL Sentral (28 min)',
        desc: 'The KLIA Ekspres non-stop train connects KLIA to KL Sentral in 28 minutes — the cleanest airport-to-city connection in Southeast Asia. From KL Sentral, the MRT and LRT reach all KL neighbourhoods. On race weekend, shuttles run from KLIA to the circuit (2 km, 5 minutes) — the easiest option for those arriving race day from the airport.',
      },
      {
        icon: '🚗',
        title: 'Hire car or Grab from KL to Sepang',
        desc: 'From central KL: South via the MEX Expressway or ELITE Expressway to the Sepang/KLIA exit — 45 km, approximately 45 minutes without traffic. On race Sunday, approach roads are managed from 8am — arrive before 9:30am or use the shuttle. Grab (ride-hailing, always metered, official app) is the most practical option for KL city journeys. Avoid traditional taxis (unmetered).',
      },
      {
        icon: '🚌',
        title: 'Official race weekend shuttles from KL Sentral',
        desc: 'Sepang International Circuit runs official shuttle buses from KL Sentral on race weekend — departures from approximately 7am on session days. Check sepangcircuit.com.my for timetables and booking. The shuttle is the recommended option for race Sunday — eliminates parking stress and approach road congestion entirely. Return shuttles run until approximately 2 hours after the podium ceremony.',
      },
    ],
    where_to_stay: `## Kuala Lumpur City Centre (Recommended Base)

KL is the obvious base — 45 minutes from the circuit, world-class hotels, extraordinary food. **Mandarin Oriental Kuala Lumpur** (KLCC — Twin Towers views, the finest address in KL), **EQ Kuala Lumpur** (KLCC, contemporary design, excellent rooftop), **The Majestic Hotel Kuala Lumpur** (colonial heritage, near KL Sentral), **Hotel Stripes** (Bukit Bintang — design hotel, walking distance to Jalan Alor), **Aloft Kuala Lumpur Sentral** (KL Sentral — ideal for circuit shuttles, Petronas brand), and **Tune Hotel KLCC** (budget, excellent location). November is off-peak season for KL — rates are reasonable even for good hotels.

## Sepang & KLIA Airport Hotels

For those prioritising circuit proximity: **Sama-Sama Hotel KLIA** (airport hotel, connected to KLIA terminal by covered walkway — 2 km from circuit), **Cititel Express KLIA**, and **ERL Transit Hotel** (at KLIA). Functional rather than atmospheric — circuit is a 5-minute transfer.

## Bukit Bintang (Best Neighbourhood for Food & Nightlife)

Bukit Bintang is KL's entertainment and food district — **Jalan Alor** hawker street, Pavilion KL mall, and dozens of restaurants covering every cuisine. **The Ritz-Carlton Kuala Lumpur**, **JW Marriott Kuala Lumpur**, and numerous mid-range hotels. Walk to everything. The ideal base for those who want the full KL street food experience.

## Petaling Jaya (Near Sepang, 30 mins)

**Petaling Jaya** (southwest of KL, 30–40 km from Sepang) has a growing hotel scene — **Hilton Petaling Jaya**, **Sunway Pyramid Hotel** (connected to a major mall and theme park) — closer to the circuit than central KL but less atmospheric.`,
    travel_tips: [
      {
        heading: 'Race Sunday has a completely different timetable — read it carefully',
        body: 'Malaysia\'s Sunday schedule differs significantly from standard: Warm Up is at 10:40 (not 09:40), Moto2 Race is at 13:15 (not 12:15), and the MotoGP Grand Prix is at 15:00 (not 14:00). This means the races are spaced further apart — plan your Sunday at the circuit around these times, not the usual rhythm.',
      },
      {
        heading: 'November heat is serious — dress and hydrate accordingly',
        body: 'Sepang in late October/November is hot and humid — 33–38°C in the grandstands with humidity above 80%. The main grandstands are covered (essential), but walking between gates and grandstands is relentless. Wear light technical fabric (not denim), carry a refillable water bottle, apply high-SPF sunscreen before entering, and drink at least 2–3 litres of water during the day. Dehydration happens faster than you think in tropical conditions.',
      },
      {
        heading: 'Tropical rain arrives fast — stay in a covered grandstand',
        body: 'Late October/November is the tail end of Malaysia\'s northeast monsoon transition period — heavy tropical downpours can arrive in minutes, turning a dry afternoon into a storm in 20 minutes flat. The main grandstand and grandstands A/B are covered. Bring a small lightweight poncho for movement between areas. Rain-affected MotoGP races at Sepang have produced some of the most dramatic moments in the sport\'s history.',
      },
      {
        heading: 'Eat on Jalan Alor every evening',
        body: 'Jalan Alor (Bukit Bintang, 10 minutes from KLCC by foot or Grab) is KL\'s most famous hawker street — open from 6pm, packed by 8pm, serving char kway teow, satay, barbecue seafood, fresh fruit juices, and cold Carlsberg at plastic tables on the pavement. It\'s touristy but genuinely excellent. Go at least twice. Try the BBQ chicken wings (Wong Ah Wah), char kway teow (any stall with a queue), and cendol for dessert.',
      },
      {
        heading: 'Grab is the only way to get around KL',
        body: 'Grab (Southeast Asia\'s dominant ride-hailing app — equivalent to Uber) is essential for KL. Download before you arrive, add a card, and use it for every journey outside the MRT network. Prices are fixed before you confirm (no surge beyond 2x), drivers are professional, and the car arrives within 5 minutes in most KL neighbourhoods. Traditional metered taxis are unreliable and often try to negotiate fixed fares — avoid them.',
      },
      {
        heading: 'The Petronas Twin Towers at night — don\'t miss it',
        body: 'The Petronas Twin Towers (452 m, Suria KLCC, open daily) look best at night when the tower lights reflect in the KLCC Park fountains. The bridge observation deck (Level 41/42, between the two towers) offers extraordinary views — book in advance at petronastwintowers.com.my. For the best skyline photo: walk to the far end of KLCC Park, near the pool, and shoot at blue hour (30 minutes after sunset).',
      },
    ],
    circuit_facts: {
      Circuit: 'Sepang International Circuit',
      Lap: '5.543 km',
      Turns: '15',
      'First MotoGP': '1999',
      Capacity: '130,000',
      Location: 'Sepang, Selangor',
    },
    faq_items: [
      {
        question: 'How do I get from Kuala Lumpur to Sepang Circuit?',
        answer: 'By official shuttle: buses from KL Sentral to the circuit on race weekend — approximately 45 minutes, check sepangcircuit.com.my for bookings. By Grab/hire car: MEX or ELITE Expressway south from KL, 45 km, 45 minutes without traffic — allow extra time on race Sunday. By KLIA Ekspres + circuit shuttle: train to KLIA (28 min from KL Sentral), then 5-minute shuttle to circuit gates.',
      },
      {
        question: 'What is the weather like at Sepang MotoGP in November?',
        answer: 'Hot and humid — 33–38°C with humidity above 80%. Covered grandstands are essential; all main grandstands at Sepang have roofs. Tropical downpours can arrive with 20 minutes\' warning — bring a lightweight poncho. Stay hydrated (3+ litres during the day). November is the tail end of the monsoon transition — rain is possible but typically comes in short bursts rather than all-day rain.',
      },
      {
        question: 'What time does the MotoGP race start in Malaysia?',
        answer: 'Malaysia has a non-standard Sunday schedule: MotoGP Grand Prix starts at 15:00 MYT (local time), not the usual 14:00. Moto3 Race is at 11:00 and Moto2 Race is at 13:15. Warm Up is at 10:40. Plan your Sunday at the circuit around these times — the gaps between classes are longer than at most other rounds.',
      },
      {
        question: 'Which airport is best for the Malaysian MotoGP?',
        answer: 'Kuala Lumpur International Airport (KLIA) is ideal — it\'s 2 km from the circuit, making it the most airport-adjacent venue on the MotoGP calendar. KLIA has direct flights from London, Amsterdam, Dubai, Singapore, Hong Kong, Tokyo, and Sydney. Budget flights on AirAsia use KLIA2 (same complex). The KLIA Ekspres train to central KL takes 28 minutes.',
      },
      {
        question: 'Is Kuala Lumpur worth visiting during race weekend?',
        answer: 'Absolutely — KL is one of Southeast Asia\'s great cities and thoroughly underrated. The Petronas Twin Towers, Batu Caves, Bukit Bintang food scene, and Jalan Alor hawker street make for a genuinely excellent 2–3 day city break. Malaysian street food — nasi lemak, char kway teow, roti canai, teh tarik — is world-class. The city is safe, clean, affordable, and English-speaking.',
      },
      {
        question: 'What Malaysian food should I try around race weekend?',
        answer: 'Nasi lemak (coconut rice with sambal, anchovies, peanuts, and egg — the national dish, eaten at any hour), char kway teow (wok-fried flat noodles with egg and cockles), roti canai with dhal at a Mamak stall at midnight, laksa (coconut soup noodles), Hainanese chicken rice, and satay. For drinks: teh tarik (pulled tea with condensed milk) and fresh coconut water. Jalan Alor in Bukit Bintang is the essential hawker street.',
      },
    ],
    page_title: 'Petronas Grand Prix of Malaysia 2026 — Sepang MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Petronas Grand Prix of Malaysia at Sepang International Circuit. Tickets, KL transport, hotels, Malaysian street food, Twin Towers, and Sepang travel tips.',
  };

  if (existing) {
    await db.update(race_content).set(contentData).where(eq(race_content.race_id, race.id));
    console.log('Updated existing race_content row.');
  } else {
    await db.insert(race_content).values(contentData);
    console.log('Inserted new race_content row.');
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
