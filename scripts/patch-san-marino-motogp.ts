/**
 * Patch San Marino MotoGP 2026:
 *  - Update: round=14, correct name, ticket URLs
 *  - Upsert race_content with full Misano/Rimini Riviera guide
 * Run: npx tsx scripts/patch-san-marino-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'san-marino-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Red Bull Grand Prix of San Marino and the Rimini Riviera',
    round: 14,
    official_tickets_url: 'https://tickets.motogp.com/en/21121-san-marino/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-san-marino',
  }).where(eq(races.slug, 'san-marino-motogp-2026'));
  console.log('Updated san-marino-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Misano MotoGP Guide',
    hero_subtitle: 'Misano World Circuit Marco Simoncelli · Rimini Riviera, Italy',
    guide_intro: 'The Misano World Circuit Marco Simoncelli — named in honour of the beloved Italian rider lost in 2011 — sits on the Adriatic coast of Emilia-Romagna, just minutes from the beach resort of Misano Adriatico and 12 km south of Rimini. The San Marino Grand Prix is one of the most Italian weekends on the calendar: tifosi in maximum numbers, the spirit of Simoncelli palpable everywhere, and the unique combination of world-class motorsport and seaside resort. September in Romagna means warm Mediterranean evenings, fresh seafood on the seafront, and a circuit atmosphere charged with emotion and national pride.',
    why_city_text: 'Misano has a special place in the hearts of Italian MotoGP fans. The circuit is named after Marco Simoncelli — "Super Sic" — and his presence is felt in every corner of the paddock and grandstands. The tifosi pack Misano in numbers that rival Mugello, and the emotion here is raw and genuine. But the setting is what makes this round unique: the circuit is literally minutes from the Adriatic Sea. After Friday practice, you\'re on the beach. Saturday qualifying ends, and you\'re eating grilled fish at a seafront restaurant in Misano Adriatico. No other MotoGP circuit offers this combination of elite motorsport and Mediterranean holiday.',
    highlights_list: [
      'Misano Circuit — Simoncelli\'s Home',
      'Adriatic Beach & Seafront',
      'Rimini & Federico Fellini',
      'Republic of San Marino',
      'Emilia-Romagna Food & Wine',
    ],
    city_guide: `## About Misano & the Rimini Riviera

The Misano World Circuit Marco Simoncelli sits in the hills above Misano Adriatico — a small Adriatic coast resort 12 km south of Rimini. The circuit is unusual in that it's genuinely close to the sea: from the top of the main grandstand on a clear September day, you can see the Adriatic. The surrounding area is the Rimini Riviera — a long strip of Adriatic beach resorts that extends from Rimini south toward Cattolica. In September, the summer crowds have thinned but the weather is still warm and the sea is at its best temperature.

## Marco Simoncelli — Super Sic

The circuit was renamed in 2012 in honour of Marco Simoncelli, the extraordinarily talented Italian rider from nearby Cattolica who was killed in a racing accident at Sepang in October 2011. He was 24 years old, the 2008 250cc World Champion, and was widely considered a future MotoGP World Champion. His face is everywhere at Misano — murals, tribute displays, the iconic #58. The emotion among Italian fans at this circuit is unlike anywhere else on the calendar.

## Rimini

**Rimini** (12 km north) is a city of two halves: a modern Adriatic beach resort stretching along the coast, and a compact historic centre with genuine Roman and Renaissance monuments. The **Arco d'Augusto** (Augustus Arch, 27 BC — one of the best-preserved Roman arches in Italy), the **Ponte di Tiberio** (Tiberius Bridge, 20 AD, still in use), and the **Tempio Malatestiano** (Renaissance masterpiece by Alberti) are all within the walkable historic centre. Rimini is also the birthplace of Federico Fellini — the **Fellini Museum** opened in 2021 and is excellent.

## Beach & Adriatic

The Rimini Riviera in September is ideal — warm (24–28°C), less crowded than August, and the sea temperature peaks in late summer. The beach at **Misano Adriatico** is immediately adjacent to the circuit; the beach at **Rimini** stretches for kilometres. Evening on the seafront promenade — aperitivo, fresh seafood, and the Adriatic light — is the quintessential race weekend experience here.

## Republic of San Marino

The circuit is named for San Marino but the tiny republic is actually 25 km inland — a medieval fortress-state on top of Monte Titano, one of the smallest and oldest countries in the world. The **Guaita** and **Cesta** towers on the ridge are extraordinary. The old town is touristy but genuinely historic. Worth a 2–3 hour visit on Thursday or the Monday after. Duty-free shopping is a bonus.

## Emilia-Romagna Food

Emilia-Romagna is Italy's greatest food region — no contest. **Piadina romagnola** (flatbread with prosciutto, squacquerone cheese, and rocket — the Romagna street food classic), **tagliatelle al ragù** (Bolognese, from Bologna itself), **tortellini in brodo** (pasta in broth), **parmigiano-reggiano**, **prosciutto di Parma**, **mortadella**, **aceto balsamico di Modena** (balsamic vinegar), and **Lambrusco** wine. In Rimini and Misano, look especially for **brodetto romagnolo** (Adriatic fish stew — the local seafood masterpiece) and grilled fresh Adriatic fish at the seafront restaurants.`,
    getting_there_intro: 'Bologna Guglielmo Marconi Airport (BLQ) is the primary international gateway — 110 km northwest, 70 minutes by hire car. Rimini Federico Fellini Airport (RMI) is 15 km north of the circuit with seasonal connections. The circuit is just off the SS16 Adriatic coast road, making it easily accessible from the entire Adriatic resort strip.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Bologna (BLQ) or Rimini (RMI)',
        desc: 'Bologna Airport has year-round connections from London, Amsterdam, Paris, Frankfurt, and beyond. 110 km northwest — 70 minutes by hire car via the A14 motorway. Rimini Federico Fellini Airport (RMI) has seasonal summer/autumn flights from London, Manchester, and Northern Europe — 15 km from the circuit, 15 minutes by hire car.',
      },
      {
        icon: '🚂',
        title: 'Train to Rimini, then taxi',
        desc: 'Rimini is on the main Adriatic rail line — frequent Frecciargento and regional trains from Bologna (50 min), Venice (2h), Ancona (1h 20min), and Rome (3h 30min via Bologna). Rimini station is 12 km from the circuit. Taxis (€20–25) and race weekend shuttles run from the station.',
      },
      {
        icon: '🚗',
        title: 'Drive via A14 motorway',
        desc: 'From Bologna: A14 southeast to Riccione exit, then SS16 south — 70 minutes. From Venice: A13/A14, approximately 2h 30min. From Florence: A1 to Bologna then A14, 2 hours. Circuit parking is ample. On race Sunday, arrive before 9am as the SS16 coast road and circuit approaches congest from 9:30am.',
      },
      {
        icon: '🚌',
        title: 'Shuttle from Rimini or Riccione',
        desc: 'Race weekend shuttle buses run from Rimini station, Riccione station, and Cattolica to the circuit gates. Departures every 20–30 minutes from 8am on session days. The most practical option for those staying in Rimini or the northern Riviera hotels — avoids parking queues entirely.',
      },
    ],
    where_to_stay: `## Misano Adriatico (Circuit Town)

Misano Adriatico is the ideal base — the circuit is a 5-minute walk or short taxi from the seafront hotel strip. **Hotel Mistral**, **Hotel Adriatico**, and dozens of 3-4 star seafront hotels line the beach. The town is small, pleasant, and completely oriented around the race weekend in September. Book 4–6 months ahead — the town fills completely.

## Riccione (5 km North)

Riccione is a livelier, slightly larger resort town just north of Misano. More hotels, better restaurants and nightlife. **Grand Hotel Riccione** and the beach hotel strip on Viale Ceccarini are excellent options. Race weekend shuttles run from Riccione station to the circuit.

## Rimini (12 km North)

Rimini has the largest hotel stock on the Riviera — everything from budget to luxury. **Grand Hotel Rimini** (the legendary Fellini hotel on the seafront), **Hotel Savoia** (seafront, good value), and hundreds of smaller hotels along the beach strip. Historic centre accommodation is more atmospheric. 15–20 minutes by shuttle or taxi to circuit.

## Cattolica (8 km South)

Cattolica is a smaller, quieter resort south of the circuit — popular with Italian families. **Hotel Kursaal** and several seafront hotels. Closer to the San Marino republic and slightly calmer than the bigger resort towns.`,
    travel_tips: [
      {
        heading: 'September Adriatic is perfect',
        body: 'September at Misano is arguably the best time to be on the Adriatic Riviera. The summer crowds have gone, prices drop, the sea is warmest of the year (24–26°C), and the weather is reliably warm (24–29°C). After practice or qualifying, swimming in the Adriatic is genuinely on the schedule.',
      },
      {
        heading: 'Eat piadina at every opportunity',
        body: 'Piadina romagnola — flatbread stuffed with prosciutto crudo, squacquerone (fresh creamy cheese), and rocket — is the Romagna street food you\'ll crave for months after the race. Roadside piadina kiosks (chioschi) are everywhere in the region. The circuit food village has excellent piadine. Eat one at every session day.',
      },
      {
        heading: 'Visit San Marino for the view',
        body: 'The Republic of San Marino is 25 km inland — 30 minutes by car, worth a half-day on Thursday. The medieval towers on Monte Titano give extraordinary views over the Adriatic coast and the Apennine hills. The old town is small and walkable. Duty-free alcohol, tobacco, and electronics in the shops — bring a shopping list.',
      },
      {
        heading: 'Respect Marco Simoncelli\'s memory',
        body: 'The circuit is named for Marco Simoncelli, killed at Sepang in 2011 and beloved by Italian fans like no rider before or since. The tributes, murals, and #58 displayed throughout the circuit are genuinely moving. Italian fans appreciate visitors who understand and respect his significance to the sport.',
      },
      {
        heading: 'Arrive before 9am on race Sunday',
        body: 'The SS16 coast road and the circuit approach roads congest severely from 9:30am on race day. Arrive at the circuit before 9am or use the shuttle from Rimini/Riccione stations. The early morning at Misano in September — warm, golden Adriatic light — is worth arriving early for anyway.',
      },
      {
        heading: 'Try brodetto romagnolo — Adriatic fish stew',
        body: 'Brodetto romagnolo is the signature seafood dish of the Romagna coast — a rich stew of whatever fresh Adriatic fish the fishermen caught that morning, cooked in tomato, white wine, and vinegar. Every seafront restaurant in Rimini and Misano does their own version. Ask for the brodetto whenever you see it on a menu.',
      },
    ],
    circuit_facts: {
      Circuit: 'Misano World Circuit Marco Simoncelli',
      Lap: '4.226 km',
      Turns: '16',
      'First MotoGP': '2007',
      Capacity: '75,000',
      Location: 'Misano Adriatico, Emilia-Romagna',
    },
    faq_items: [
      {
        question: 'How do I get from Rimini to Misano World Circuit?',
        answer: 'By shuttle: race weekend buses run from Rimini station and Riccione station every 20–30 minutes from 8am — the easiest option. By car: SS16 south from Rimini to Misano Adriatico, 12 km, 15 minutes (allow extra time on Sunday). By taxi: €20–25 from Rimini centre.',
      },
      {
        question: 'What is the weather like at Misano MotoGP in September?',
        answer: 'Excellent — September on the Adriatic Riviera is warm (24–29°C), sunny, and less humid than August. The sea is at peak temperature (24–26°C) — swimming after sessions is entirely practical. Rain is possible but uncommon. One of the most pleasant climatic settings on the entire MotoGP calendar.',
      },
      {
        question: 'Can I visit the Republic of San Marino during race weekend?',
        answer: 'Yes — San Marino is 25 km inland, 30 minutes by car. The medieval fortress town on Monte Titano has extraordinary views and a well-preserved old town. Visit Thursday before the race or Monday after. Duty-free shopping is a bonus. The race is named after San Marino but the circuit is actually in Italy (Misano Adriatico).',
      },
      {
        question: 'Who was Marco Simoncelli and why is the circuit named after him?',
        answer: 'Marco Simoncelli was an Italian MotoGP rider from nearby Cattolica — the 2008 250cc World Champion and one of the most charismatic and talented riders of his generation. He was killed in a racing accident at Sepang, Malaysia in October 2011 at age 24. The circuit was renamed in his honour in 2012. He is mourned and celebrated by Italian fans to this day.',
      },
      {
        question: 'Which airport is best for Misano MotoGP?',
        answer: 'Bologna (BLQ) is the main international hub — 110 km northwest, 70 minutes by hire car or train to Rimini. Rimini Federico Fellini Airport (RMI) is just 15 km away with seasonal connections from UK, Germany, and Northern Europe — check availability for September dates. Hire a car from either airport.',
      },
      {
        question: 'What local food should I try at Misano?',
        answer: 'Piadina romagnola (flatbread with prosciutto, squacquerone cheese, and rocket — the Romagna street food staple), brodetto romagnolo (Adriatic fish stew), grilled fresh Adriatic fish, tagliatelle al ragù (proper Bolognese — you\'re in its home region), and parmigiano-reggiano. For wine: Sangiovese di Romagna and Lambrusco.',
      },
    ],
    page_title: 'Red Bull Grand Prix of San Marino 2026 — Misano MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Red Bull Grand Prix of San Marino at Misano World Circuit Marco Simoncelli. Tickets, Rimini transport, Adriatic hotels, seafood, and San Marino tips.',
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
