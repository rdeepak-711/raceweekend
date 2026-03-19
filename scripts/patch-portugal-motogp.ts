/**
 * Patch Portugal MotoGP 2026:
 *  - Update: round=21, race_date=2026-11-22, correct name, ticket URLs
 *  - Upsert race_content with full Portimão/Algarve guide
 * Run: npx tsx scripts/patch-portugal-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'portugal-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Repsol Grand Prix of Portugal',
    round: 21,
    official_tickets_url: 'https://tickets.motogp.com/en/21171-portugal/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-portugal',
  }).where(eq(races.slug, 'portugal-motogp-2026'));
  console.log('Updated portugal-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Portimão MotoGP Algarve Guide',
    hero_subtitle: 'Autodromo Internacional do Algarve · Portimão, Algarve, Portugal',
    guide_intro: 'The Autodromo Internacional do Algarve at Portimão is MotoGP\'s most dramatic and technically demanding circuit — a rollercoaster of blind crests, steep descents, and high-speed sweepers carved into the red-earth cliffs above the Atlantic in Portugal\'s Algarve region. Since joining the MotoGP calendar in 2020, Portimão has produced some of the most spectacular and unpredictable races in the sport\'s recent history: its unique topology — particularly the blind crest at Turn 1 and the sweeping downhill complex through Turns 2–5 — rewards riders who are brave enough to trust what they cannot see. November in the Algarve brings mild temperatures, golden low-angle winter light on the ochre cliffs, and the end-of-season atmosphere of a championship nearing its conclusion. The circuit sits 5 km from the Atlantic coast town of Portimão and 60 km from Faro — the Algarve\'s capital and main airport.',
    why_city_text: 'Portimão is MotoGP\'s most extreme circuit — not in terms of length or speed, but in terms of sheer drama. The blind downhill plunge from Turn 1 at the circuit\'s highest point into the valley below, taken flat-out in qualifying, is one of the most heart-stopping pieces of motorcycling on the entire calendar. November here is genuinely beautiful: the summer tourist crowds have gone, the Algarve\'s light turns golden and low, the cliffs and beaches are at their most photogenic, and the race has the urgent atmosphere of a season approaching its final two rounds. The surrounding Algarve — world-famous beaches, dramatic coastline, excellent seafood, and some of the best golf courses in Europe — makes this one of the most enjoyable race weekends for leisure travel.',
    highlights_list: [
      'Portimão — The Most Dramatic Circuit on the Calendar',
      'Algarve Atlantic Coastline & Cliffs',
      'Lagos Old Town & Ponta da Piedade',
      'Portuguese Seafood — Cataplana & Grilled Fish',
      'Late Season Sun & Golden November Light',
    ],
    city_guide: `## About Autodromo Internacional do Algarve

The Autodromo Internacional do Algarve (AIA) opened in 2008 on a spectacular hillside site 5 km northeast of Portimão and 8 km from the Atlantic coast. The 4.653 km circuit has 15 corners and a topology unlike anything else on the MotoGP calendar: an extended ridgeline at the circuit's highest point, a blind downhill plunge (the defining Turn 1 crest — riders arrive at 260+ km/h and cannot see the track below until they're committed), a sweeping valley section through Turns 2–5, and a long uphill straight back to the start-finish. The circuit was rapidly adopted by the MotoGP paddock as one of the most challenging and technically rewarding layouts in world motorcycling. Sunday's race runs at 13:00 — the MotoGP Grand Prix is the midday race, with Moto3 as the final race of the afternoon at 14:30 (reversed order — see tips).

## Portimão & the Algarve Coast

**Portimão** is the western Algarve's largest town — a working fishing and commercial port that has grown into a busy tourist centre. The town itself is pleasant but unremarkable; it's the coastline on either side that's extraordinary. **Praia da Rocha** (3 km south of town — the Algarve's most famous resort beach: wide, golden, flanked by dramatic red sandstone cliffs and sea stacks) is the immediate beach destination. **Lagos** (17 km west — the most beautiful town in the western Algarve) has a perfectly preserved medieval old town, the extraordinary **Ponta da Piedade** sea caves (golden limestone arches and grottos, best seen by boat), and beaches that are frequently ranked among Europe's most beautiful: **Meia Praia**, **Praia Dona Ana**, **Praia do Camilo**.

## Lagos & Ponta da Piedade

**Lagos** warrants a half-day before or after the race. The **old town** (inside the Moorish-origin walls, whitewashed houses, cobbled streets, the Igreja de Santo António with its extraordinary gilded azulejo interior) is beautifully preserved and genuinely atmospheric. The **Ponta da Piedade** headland (2 km south of town) — accessed by a 200-step cliff descent or by boat from Lagos marina — is a maze of golden limestone sea arches, grottos, and sea stacks eroded by the Atlantic into shapes that seem impossible. Go at golden hour (late afternoon in November is perfect) when the light on the ochre rock is extraordinary.

## Sagres & the End of the World

**Sagres** (35 km west of Lagos — the southwestern tip of continental Europe, marked by the **Fortaleza de Sagres** promontory) is where Portugal ends and the Atlantic begins. The **Cabo de São Vicente** lighthouse (3 km further) is the most southwesterly point of mainland Europe — historically called "the end of the world" by medieval sailors before the Age of Discovery. The windswept headland, where two oceans meet, is one of Portugal's most dramatic landscapes. 90 minutes from the circuit in November — no summer crowds, empty clifftop walks, and extraordinary views.

## Portuguese Food in the Algarve

The Algarve has Portugal's finest seafood tradition. **Cataplana de marisco** (clams, prawns, and fish slow-cooked in a copper cataplana — the Algarve's signature dish), **grilled fresh fish** (robalo/sea bass, dourada/gilt-head bream, atum/tuna — on a charcoal grill, drizzled with olive oil and lemon), **açorda de marisco** (bread-thickened seafood broth), **percebes** (barnacles — a peculiar, expensive, and extraordinary shellfish), and **amêijoas à Bulhão Pato** (clams with garlic, coriander, and white wine). For meat: **bifanas** (pork sandwiches — Portugal's greatest fast food) and **leitão** (roast suckling pig from the Bairrada region). Wine: **Alentejo reds** (full-bodied, excellent value), **Vinho Verde** (light, slightly effervescent white from the north — perfect with fish).

## Faro & the Ria Formosa

**Faro** (60 km east — the Algarve's capital and main airport) has a beautiful historic centre (the **Cidade Velha** — walled old town with cathedral and bishop's palace inside the medieval walls, accessed by a Roman arch), the extraordinary **Ria Formosa Natural Park** (a lagoon system of salt marshes, barrier islands, and channels — one of the most important bird habitats in Western Europe, accessible by boat from Faro harbour), and excellent restaurants. Worth a half-day if flying via Faro.`,
    getting_there_intro: 'Faro Airport (FAO) is the primary gateway — 60 km east of the circuit, 45 minutes by hire car. Faro has direct connections from London, Manchester, Birmingham, Dublin, Amsterdam, Frankfurt, and most major Northern European cities, many operating year-round. Lisbon Airport (LIS) is 280 km north — 2h 45min by hire car or 2h 15min by bus (Eva/Rede Expressos to Portimão).',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Faro (FAO) — 60 km from circuit',
        desc: 'Faro Airport has year-round direct connections from London Heathrow, Gatwick, and Stansted (Ryanair, easyJet, British Airways), Manchester, Birmingham, Dublin, Amsterdam, Frankfurt, and most major Northern European cities. 60 km west of the circuit — 45 minutes by hire car via the A22 Via do Infante. Taxis from FAO to Portimão are approximately €70–80. A hire car is strongly recommended for exploring the Algarve.',
      },
      {
        icon: '✈️',
        title: 'Fly to Lisbon (LIS) then drive or bus',
        desc: 'Lisbon Humberto Delgado (LIS) has the widest international connections including TAP from New York, Toronto, and beyond. 280 km north — 2h 45min by hire car via the A2 (Via do Sul) through the Alentejo. Bus: Rede Expressos/Eva Transportes, Lisbon Sete Rios → Portimão, 3h, multiple daily departures. Train: Lisboa → Tunes (change) → Portimão, approximately 3h 30min.',
      },
      {
        icon: '🚗',
        title: 'Hire car — A22 Via do Infante (recommended)',
        desc: 'From Faro: A22 west (Via do Infante) to Portimão — 60 km, 45 minutes. From Lisbon: A2 south through Alentejo, then A22 west — 280 km, 2h 45min. The A22 runs the length of the Algarve coast. A hire car is essential for exploring Lagos, Sagres, Silves, and the Algarve coastline around race weekend. Book well in advance — Algarve hire cars sell out in autumn.',
      },
      {
        icon: '🚌',
        title: 'Bus from Portimão town or Faro',
        desc: 'From Portimão bus station: taxis and local services to the circuit (5 km, 10 minutes, €10–15). Race weekend shuttle buses may run from Portimão town centre to the circuit gates — check AIA official website. From Faro: Eva Transportes Faro → Portimão (1h, multiple daily). The circuit has no direct public transport on non-race days — a hire car or taxi is essential.',
      },
    ],
    where_to_stay: `## Portimão Town (Closest Base)

Portimão is 5 km from the circuit — the most practical on-race-weekend base. **Hotel Bela Vista** (a cliff-top art nouveau manor on Praia da Rocha — the most atmospheric hotel on this coastline), **Tivoli Carvoeiro** (clifftop resort, 15 km east), **Holiday Inn Algarve** (reliable, central), and various apartments in the town centre. Praia da Rocha (the beach resort strip 3 km south) has dozens of 3–4 star hotels right on the beach.

## Lagos (17 km West — Best Atmosphere)

Lagos is the most beautiful base for the Portuguese GP — historic old town, extraordinary beaches, and excellent restaurants. **Cascade Wellness Resort** (Lagos — spa resort, clifftop, quiet), **Bela Vista Hotel & Spa** (Praia da Luz, 6 km from Lagos), and the small boutique hotels in the old town. 17 km from circuit via the EN125 or IC4 — 20 minutes. Book early — Lagos accommodation fills quickly even in November.

## Albufeira (30 km East)

Albufeira (the Algarve's largest resort) has the biggest hotel stock in the region — every category from budget hostels to 5-star resorts. **Sheraton Algarve Penina**, **Vila Galé Albufeira**, and dozens of large resort hotels. 30 km east of the circuit — 30 minutes via A22. More convenient for those flying into Faro.

## Faro (60 km East — Airport City)

Staying in Faro makes sense for those with early or late flights at FAO. **Hotel Eva Faro** (marina views, central), **Faro Hotel** (historic centre, boutique), and airport hotels near FAO. 60 km to circuit — 45 minutes by hire car.`,
    travel_tips: [
      {
        heading: 'Sunday race order is reversed — Moto3 races LAST at 14:30',
        body: 'Portugal 2026 has an unusual Sunday schedule: Moto2 races first at 11:15, MotoGP Grand Prix second at 13:00, and Moto3 closes the day at 14:30 — completely reversed from the standard order. Plan your Sunday around this: the MotoGP Grand Prix is mid-afternoon, not late afternoon. Don\'t leave the circuit after the MotoGP podium — Moto3 still runs over an hour later.',
      },
      {
        heading: 'November Algarve light is extraordinary — bring a camera',
        body: 'November in the Algarve is low-season but arguably the most beautiful time of year. The summer haze has cleared, the sun is low on the horizon all day, and the golden light on the red sandstone cliffs and the white circuit buildings is spectacular. The Algarve in November is empty, peaceful, and bathed in the kind of golden afternoon light that photographers travel thousands of miles for. Pack a camera with a decent lens.',
      },
      {
        heading: 'Visit Ponta da Piedade by boat from Lagos',
        body: 'The sea caves and golden arches of **Ponta da Piedade** (Lagos) are one of the natural wonders of Western Europe — but you need to see them from the water to appreciate them fully. Boat trips from Lagos marina run year-round (45–60 minutes, €20–25). November availability is reduced but trips run most days. Book through Lagos tourist office or Bom Dia boat trips. The caves at golden hour — late afternoon light on the ochre limestone — is unmissable.',
      },
      {
        heading: 'Turn 1 at Portimão is the most spectacular viewing spot on the calendar',
        body: 'The blind downhill crest at Turn 1 — where the circuit peaks at its highest point and plunges into the valley below — is one of the defining moments in MotoGP. Riders arrive at 260+ km/h, cannot see the track below the crest, and commit entirely on memory and trust. From the grandstand above Turn 1, you watch them arrive at full speed, disappear over the lip, and reappear in the valley. This is the single best viewing spot on the entire MotoGP calendar.',
      },
      {
        heading: 'Order cataplana — it takes 30 minutes and is worth it',
        body: 'The cataplana de marisco (clams, prawns, fish, tomatoes, peppers, coriander, and wine slow-cooked in a sealed copper vessel — the Algarve\'s signature dish) is worth any restaurant visit in Portimão or Lagos. It takes 30 minutes to prepare and must be ordered for two or more people. Ask if the restaurant makes it fresh (many tourist restaurants use pre-prepared versions). A proper cataplana from a good Algarvian kitchen is one of the great seafood dishes of Southern Europe.',
      },
      {
        heading: 'Drive to Sagres on Thursday — the end of Europe',
        body: '**Sagres** and **Cabo de São Vicente** (35–50 km west of Lagos) is the most dramatic landscape in Portugal — a wind-blasted promontory at the southwestern tip of continental Europe where the Atlantic stretches uninterrupted to America. Henry the Navigator\'s school of navigation was based here; every Portuguese Age of Discovery voyage departed past this headland. In November, with no tourists and Atlantic gales building, it\'s one of the most moving natural landscapes in Europe. Drive there Thursday before the race.',
      },
    ],
    circuit_facts: {
      Circuit: 'Autodromo Internacional do Algarve',
      Lap: '4.653 km',
      Turns: '15',
      'First MotoGP': '2020',
      Capacity: '65,000',
      Location: 'Portimão, Algarve',
    },
    faq_items: [
      {
        question: 'How do I get from Faro to Portimão Circuit?',
        answer: 'By hire car: A22 west (Via do Infante) from Faro — 60 km, 45 minutes. The most practical option and essential for exploring the Algarve. By bus: Eva Transportes from Faro to Portimão (1 hour), then taxi or shuttle 5 km to circuit. Race weekend shuttles may run from Portimão town — check AIA (autodromodoalgarve.com) for timetables.',
      },
      {
        question: 'What is the weather like at Portimão MotoGP in November?',
        answer: 'Mild and mostly sunny — typical Algarve autumn: 18–24°C during the day, 12–16°C in the evenings. The brutal summer heat is gone, rain is possible but not common (November averages 4–5 rain days), and the low winter sun creates extraordinary golden light on the circuit and surrounding cliffs. Bring a warm jacket for the grandstands after sunset — it cools quickly after the sun drops.',
      },
      {
        question: 'Which airport is best for the Portuguese MotoGP?',
        answer: 'Faro (FAO) — 60 km east, 45 minutes by hire car. Year-round direct connections from London, Manchester, Birmingham, Dublin, Amsterdam, and Frankfurt. Lisbon (LIS) is 280 km north — 2h 45min by hire car or 3h by bus — but has the widest international connections including long-haul TAP routes. Hire a car from either airport; the A22 motorway makes the Faro connection very quick.',
      },
      {
        question: 'What makes Portimão special as a MotoGP circuit?',
        answer: 'The topology — Portimão is built into a hillside with dramatic elevation changes that no other circuit on the calendar can match. The blind downhill plunge at Turn 1 (riders arrive at 260+ km/h and cannot see the track below the crest) is unique in world motorsport. The sweeping downhill complex through Turns 2–5 punishes any mistake and rewards extraordinary bravery. Every MotoGP race at Portimão has been spectacular.',
      },
      {
        question: 'Is the Algarve worth visiting in November for the race?',
        answer: 'Very much so — November is arguably the best month to visit the Algarve. The summer tourist crowds are gone, prices drop significantly, the weather is mild and golden, and the landscape (Atlantic cliffs, golden beaches, red sandstone sea stacks) is at its most photogenic in the low-angle winter light. Lagos, Ponta da Piedade, and Sagres/Cabo de São Vicente are extraordinary in November. The only trade-off: some seasonal restaurants and businesses close in October–November.',
      },
      {
        question: 'What Portuguese food should I try at Portimão?',
        answer: 'Cataplana de marisco (clams, prawns, and fish in a sealed copper vessel — the Algarve\'s signature dish, must be ordered 30 minutes ahead, serves two), grilled fresh fish (robalo/sea bass, dourada/bream on charcoal), amêijoas à Bulhão Pato (clams with garlic and coriander), percebes (barnacles — expensive, extraordinary), and bifanas (pork sandwiches — Portugal\'s greatest street food). For wine: Alentejo reds with the meat, Vinho Verde with the fish.',
      },
    ],
    page_title: 'Repsol Grand Prix of Portugal 2026 — Portimão MotoGP Algarve Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Repsol Grand Prix of Portugal at Autodromo Internacional do Algarve, Portimão. Tickets, Faro transport, hotels, cataplana seafood, Lagos day trip, and Algarve travel tips.',
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
