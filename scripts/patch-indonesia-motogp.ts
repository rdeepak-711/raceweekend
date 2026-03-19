/**
 * Patch Indonesia MotoGP 2026:
 *  - Update: round=17, correct name, ticket URLs
 *  - Upsert race_content with full Mandalika/Lombok/Bali guide
 * Run: npx tsx scripts/patch-indonesia-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'indonesia-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Pertamina Grand Prix of Indonesia',
    round: 17,
    official_tickets_url: 'https://tickets.motogp.com/en/21141-indonesia/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-indonesia',
  }).where(eq(races.slug, 'indonesia-motogp-2026'));
  console.log('Updated indonesia-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Mandalika MotoGP Indonesia Guide',
    hero_subtitle: 'Pertamina Mandalika International Street Circuit · Lombok, Indonesia',
    guide_intro: 'The Pertamina Mandalika International Street Circuit sits on the southern coast of Lombok — carved into a hillside above a turquoise bay within the Mandalika Special Economic Zone, a purpose-built resort development on one of Southeast Asia\'s most beautiful islands. Since joining the MotoGP calendar in 2021, Mandalika has established itself as one of the most visually spectacular venues in world motorsport: the circuit winds through tropical terrain with views over the Lombok Strait and, on clear days, the volcanic cone of Mount Rinjani visible to the north. The atmosphere — 150,000 Indonesian fans, deafening home support for local heroes, the heat and colour of tropical October — is unlike anything else on the calendar. Bali, connected by a 30-minute fast boat crossing, is the natural base for most international visitors.',
    why_city_text: 'Mandalika is MotoGP at its most viscerally exciting. The circuit is breathtaking — swooping through the hills above the Indian Ocean, with tropical vegetation pressed right up to the barriers and a backdrop that no purpose-built venue could match. The Indonesian crowd is extraordinary: 150,000 passionate fans who have turned this race into one of the great sporting atmospheres in Asia. October is near-perfect conditions — warm and mostly dry, with the monsoon still weeks away. And then there\'s the setting itself: Lombok\'s south coast beaches are extraordinary, Bali is 30 minutes by fast boat, and the whole trip becomes a genuine tropical holiday wrapped around a race weekend.',
    highlights_list: [
      'Mandalika — Hillside Circuit Above the Sea',
      'Lombok\'s South Coast Beaches',
      'Bali — 30 Minutes by Fast Boat',
      'Mount Rinjani & Volcanic Landscapes',
      'Indonesian Food — Nasi Goreng, Satay, Rendang',
    ],
    city_guide: `## About Mandalika & Lombok

The Pertamina Mandalika International Street Circuit sits within the **Mandalika Special Economic Zone** (KEK Mandalika) on the southern coast of Lombok — a purpose-built integrated resort and infrastructure development that transformed a stretch of wild southern Lombok coastline into a world-class motorsport and tourism destination. The circuit runs through hilly terrain above the sea, with the turquoise **Lombok Strait** visible from most grandstands and **Pantai Kuta Mandalika** (Kuta Beach) immediately adjacent. Mandalika itself is still developing — the resort zone has good hotels, restaurants, and beach access, but for broader urban infrastructure, **Mataram** (Lombok's capital, 60 km north) or **Bali** (accessible by fast boat in 30–40 minutes) are better bases.

## Lombok

Lombok is Bali's quieter, less developed neighbour — same latitude, similar volcanic landscape, but a fraction of the tourist infrastructure. The south coast — **Kuta Lombok**, **Mawun**, **Selong Belanak**, **Tanjung Aan** — has some of the most beautiful beaches in Indonesia: long, uncrowded, turquoise-and-white, surrounded by dry green hills. The north is dominated by **Gunung Rinjani** (3,726 m — Indonesia's second-highest volcano, with a dramatic summit crater lake). Lombok is predominantly Sasak — an indigenous Muslim people with distinct traditions, weaving textiles, and food culture quite different from Bali's Hindu culture. The island rewards slower travel.

## Bali

Bali (30–40 minutes by fast boat from Padang Bai or Bangsal on Lombok's northwest coast; or 25 minutes by charter/inter-island flight from Lombok International Airport) is the natural base for most international visitors. **Seminyak** (upscale beach clubs, rooftop bars, design hotels), **Canggu** (surf culture, cafés, digital nomad energy), **Ubud** (rice terraces, yoga retreats, art and culture), and **Uluwatu** (clifftop temples, world-class surf breaks, dramatic sunset venues) each offer a distinct atmosphere. Bali has Lombok's full range of international hotels, restaurants, and nightlife — plus direct flights from most Asian hubs and increasingly from further afield. Race fans who base in Bali and take the fast boat to Lombok for race days get the best of both worlds.

## Gunung Rinjani

Mount Rinjani (Gunung Rinjani, 3,726 m) is one of Indonesia's most spectacular volcanoes — a UNESCO Global Geopark with a summit crater lake (**Segara Anak**, 2,000 m) that is one of the most extraordinary natural sights in Southeast Asia. A full Rinjani trek (2–3 days) is a serious undertaking requiring fitness and preparation — not compatible with race weekend — but the drive north through the volcanic foothills and the views of Rinjani from the circuit grandstands on a clear morning are stunning in themselves.

## Indonesian Food

Indonesian cuisine is one of the world's great food traditions — and Lombok offers both pan-Indonesian and distinctly Sasak variants. **Nasi goreng** (fried rice — the national dish, eaten at every meal and every time of day), **mie goreng** (fried noodles), **satay** (grilled skewers with peanut sauce), **rendang** (slow-cooked Padang beef with coconut and spice — technically Minangkabau but ubiquitous), **gado-gado** (vegetables with peanut sauce), **soto** (spiced broth soups in many regional varieties), and the distinctly Sasak **ayam taliwang** (grilled chicken with intensely spiced chilli sauce — Lombok's signature dish, fiery and extraordinary) and **plecing kangkung** (water spinach with Lombok chilli sambal). Lombok's chillis are significantly hotter than Bali's — ask for spice level before committing.

## Getting Around Lombok & Bali

Lombok: hire a car with driver (the most practical option — roads to the circuit approach on race weekend are managed by security) or use the official circuit shuttles from Mataram and Lombok International Airport. Bali: hire a car with driver or use ride-hailing apps (Grab, Gojek) for most journeys. Both islands are easy to navigate independently with a hired car.`,
    getting_there_intro: 'Lombok International Airport (LOP) — also known as Zainuddin Abdul Madjid International Airport — is 35 km north of the circuit with direct connections from Bali (25 min, multiple daily), Singapore, Kuala Lumpur, and Jakarta. Bali Ngurah Rai (DPS) is the major regional hub, 30–40 minutes by fast boat from Lombok\'s Bangsal or Padang Bai ferry ports. Flying into Bali and connecting by boat or charter flight is the most common international approach.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Lombok (LOP) direct',
        desc: 'Lombok International Airport (LOP) is 35 km north of Mandalika — 40 minutes by hire car. Direct flights from Bali (25 min, Garuda/Citilink/Wings Air — multiple daily), Singapore (AirAsia, ~2h), Kuala Lumpur (~2.5h), and Jakarta (Garuda/Lion Air, 1h 40min). Most international visitors fly into Bali first and connect. Book LOP connections early — they fill for race weekend.',
      },
      {
        icon: '✈️',
        title: 'Fly to Bali (DPS) then fast boat to Lombok',
        desc: 'Bali Ngurah Rai (DPS) has the widest regional connections — direct from Singapore, Kuala Lumpur, Sydney, Melbourne, Tokyo, Hong Kong, and European charter routes. From Bali: fast boat from Padang Bai (east Bali) to Lembar (west Lombok) takes 90 minutes, or from Sanur/Serangan to Bangsal (north Lombok) in 60–90 minutes. Multiple operators run daily — book Bluewater Express or Gili Fast Boat in advance for race weekend.',
      },
      {
        icon: '🚗',
        title: 'Hire car from Lombok Airport or Mataram',
        desc: 'From Lombok Airport (LOP): south on Bypass BIL road direct to Mandalika — 35 km, 40 minutes. From Mataram (Lombok capital): south via Praya and Pujut — 60 km, approximately 1 hour. On race Sunday, official route management directs traffic to the circuit from 7am — follow official signage. Hire a car with a local driver for the weekend; they\'ll know the best approach routes.',
      },
      {
        icon: '🚌',
        title: 'Official race weekend shuttles',
        desc: 'Mandalika circuit operates shuttle buses from Lombok International Airport, Mataram city, and Praya on race weekend. Check the MotoGP Indonesia official site and MotoGP.com for timetables closer to the event. Shuttle from the airport is the most practical for those flying in on session days — avoids the congestion on the main circuit approach roads.',
      },
    ],
    where_to_stay: `## Mandalika Resort Zone (Circuit-Adjacent)

The Mandalika SEZ has purpose-built hotels immediately adjacent to the circuit — the only option for true walk-to-the-gate proximity. **The Paramount Lombok** (5-star, directly on the resort zone), **Club Med Lombok** (all-inclusive, beachfront), **The Kuta Beach Heritage Hotel** (Marriott Autograph Collection), and **Novotel Lombok** are all within the development. Stock is limited and books out 6+ months ahead for race weekend. Prices during the race are significant.

## Kuta Lombok (5 km from circuit)

**Kuta Lombok** — not to be confused with Kuta Bali — is a small surfer and backpacker town 5 km east of the circuit on the south coast. Lower-key, cheaper, genuine Sasak character. **Kuta Indah Hotel**, **Novotel Lombok** (also listed above as Mandalika), and various guesthouses and surf camps. The beaches here (Kuta, Tanjung Aan, Selong Belanak) are stunning.

## Mataram (Lombok Capital, 60 km north)

Mataram has the widest hotel stock on Lombok — everything from budget guesthouses to business hotels. **Lombok Raya Hotel** and **Harper Mataram** are reliable mid-range options. 60 km to the circuit — plan for 60–90 minutes on race weekend with approach road congestion.

## Bali (Cross the Strait — Recommended for Most International Visitors)

Most international visitors base in Bali and cross to Lombok for race days. **Seminyak**: W Bali, The Layar, Katamama (boutique, luxury). **Canggu**: The Layar, Finns Beach Club area, dozens of boutique hotels. **Ubud**: COMO Uma Ubud, Four Seasons at Sayan (extraordinary setting above a rice paddy valley). **Uluwatu**: Six Senses Uluwatu (clifftop infinity pools). Bali has the full range of international accommodation — book 3–4 months ahead for October race weekend.`,
    travel_tips: [
      {
        heading: 'October is near-perfect conditions — pre-monsoon',
        body: 'October in Lombok sits just before the wet season — warm (28–34°C), mostly sunny, and the humidity is lower than the peak of summer. Rain is possible (brief tropical showers) but the monsoon typically arrives in November. This is genuinely one of the best times to visit Lombok and Bali: post-peak-tourist-season prices, still-excellent weather, and quieter beaches.',
      },
      {
        heading: 'Try ayam taliwang — Lombok\'s fiery signature dish',
        body: 'Ayam taliwang is grilled chicken marinated in a paste of Lombok chilli, garlic, shrimp paste, and spices — then served with sambal that is significantly hotter than anything you\'ll find in Bali. It\'s Lombok\'s defining dish and should be tried at least once, at a local warung rather than a resort restaurant. Order "tidak terlalu pedas" (not too spicy) if you\'re heat-sensitive. Pair with plecing kangkung (water spinach in chilli sambal) for the full Sasak experience.',
      },
      {
        heading: 'The circuit grandstands face the sea — arrive early for the view',
        body: 'The Mandalika circuit wraps around a hillside with most grandstands oriented toward the Lombok Strait and the Indian Ocean beyond. On a clear morning — particularly Friday FP1 — the view of the circuit against the sea is extraordinary. Arrive well before sessions start (gates open 2 hours early) to get settled and appreciate the setting before the crowds pack in.',
      },
      {
        heading: 'Bali fast boat — book in advance and check weather',
        body: 'Fast boats between Bali and Lombok run frequently but can be cancelled in rough weather (October can have swells). Book a reputable operator (Bluewater Express, Gili Fast Boat, Semaya One) and a specific departure — not just a floating ticket. For race weekend, book the return boat early too. Crossings take 60–90 minutes depending on route and sea conditions. Luggage is limited — travel light.',
      },
      {
        heading: 'Respect Islamic culture on Lombok',
        body: 'Lombok is predominantly Muslim (unlike Hindu Bali) — the call to prayer will be part of your daily soundtrack, and the culture is more conservative. Dress modestly when away from beach/resort zones: cover shoulders and knees when visiting mosques or markets. Alcohol is available at tourist establishments and the circuit, but is not as ubiquitous as in Bali. The Sasak people are warmly welcoming — a respectful awareness of local culture is appreciated.',
      },
      {
        heading: 'Warm Up starts at 10:40 — not the usual 09:40',
        body: 'Indonesia Warm Up is 10:40–10:50 (one hour later than the standard slot). Don\'t miss the early part of the morning session if you\'re planning your schedule — this affects the rhythm of the whole Sunday. Moto3 Race follows immediately at 11:00, so the start of Sunday is busier and later than other rounds.',
      },
    ],
    circuit_facts: {
      Circuit: 'Pertamina Mandalika International Street Circuit',
      Lap: '4.319 km',
      Turns: '17',
      'First MotoGP': '2021',
      Capacity: '150,000',
      Location: 'Mandalika, Lombok',
    },
    faq_items: [
      {
        question: 'How do I get from Bali to the Mandalika circuit in Lombok?',
        answer: 'Two options: fly from Bali Ngurah Rai (DPS) to Lombok International (LOP) — 25 minutes, multiple daily flights — then hire car 40 minutes to the circuit. Or take a fast boat from Padang Bai or Sanur (Bali) to Lembar or Bangsal (Lombok) — 60–90 minutes — then hire car or shuttle to the circuit. The flight is faster and more reliable in choppy weather; the boat is cheaper and more scenic.',
      },
      {
        question: 'What is the weather like at the Indonesian MotoGP in October?',
        answer: 'Excellent — October is pre-monsoon in Lombok. Warm (28–34°C), mostly sunny, lower humidity than the summer peak. Brief tropical rain showers are possible but the monsoon typically doesn\'t arrive until November. Bring sunscreen, a hat, and stay hydrated in the grandstands — the tropical sun at a circuit facing south is intense.',
      },
      {
        question: 'Should I stay in Bali or Lombok for the race?',
        answer: 'Most international visitors base in Bali and cross to Lombok for race days — Bali has vastly more hotel choice, better restaurants, nightlife, and established tourism infrastructure. The crossing (fast boat 60–90 min, or 25-min flight) is straightforward. However, staying in Mandalika or Kuta Lombok gives you the full race weekend experience and eliminates the daily crossing logistics. For 3+ night stays, Lombok-based accommodation is worth it.',
      },
      {
        question: 'Which airport is best for the Indonesian MotoGP?',
        answer: 'Lombok International (LOP) is closest — 35 km north of Mandalika, direct flights from Bali, Singapore, KL, and Jakarta. Bali Ngurah Rai (DPS) has the widest international connections and is 30–40 minutes by fast boat from Lombok. Most Europeans and Australians fly into Bali first and connect. Book inter-island flights early — they sell out for race weekend.',
      },
      {
        question: 'What makes Mandalika special as a MotoGP circuit?',
        answer: 'The setting is genuinely world-class — the circuit wraps through tropical hillside terrain above the Lombok Strait, with views over the Indian Ocean and Mount Rinjani visible to the north on clear days. No other circuit on the calendar has this combination of sea views, volcanic landscape, and tropical forest. The 150,000-strong Indonesian crowd is among the most passionate in Asian motorsport, and the atmosphere during races is extraordinary.',
      },
      {
        question: 'What Indonesian food should I try at Mandalika?',
        answer: 'At the circuit: nasi goreng (fried rice — Indonesia\'s national dish), mie goreng (fried noodles), satay with peanut sauce, and ayam taliwang (Lombok\'s signature fiery grilled chicken — ask for it mild first). In Lombok/Bali: rendang (slow-cooked spiced beef), gado-gado (vegetables with peanut sauce), soto (spiced broth soup), and fresh Jimbaran-style grilled seafood on the beach in Bali the night before the race.',
      },
    ],
    page_title: 'Pertamina Grand Prix of Indonesia 2026 — Mandalika MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Pertamina Grand Prix of Indonesia at Pertamina Mandalika International Street Circuit. Tickets, Bali to Lombok transport, hotels, Indonesian food, and Lombok travel tips.',
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
