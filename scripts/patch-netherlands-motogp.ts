/**
 * Patch Netherlands MotoGP 2026:
 *  - Update: round=10, correct name, ticket URLs
 *  - Upsert race_content with full Assen/Netherlands guide
 * Run: npx tsx scripts/patch-netherlands-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'netherlands-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Grand Prix of the Netherlands',
    round: 10,
    official_tickets_url: 'https://tickets.motogp.com/en/21141-netherlands/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-netherlands',
  }).where(eq(races.slug, 'netherlands-motogp-2026'));
  console.log('Updated netherlands-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Dutch TT Guide',
    hero_subtitle: 'TT Circuit Assen · Drenthe, Netherlands',
    guide_intro: 'The Dutch TT at Assen is one of the oldest and most iconic rounds on the MotoGP calendar — a race held every year since 1925, which makes it the longest-running event in Grand Prix motorcycle racing history. The TT Circuit Assen has evolved from a public road course into a flowing, technically demanding permanent circuit that riders consistently rate among their favourites. The atmosphere is unique: the Dutch fans are knowledgeable, passionate, and number in the hundreds of thousands. Pair that with the beautiful Dutch countryside, excellent cycling routes, and Amsterdam just 2.5 hours south, and the Dutch TT is a bucket-list MotoGP experience.',
    why_city_text: 'Assen has hosted a Grand Prix every single year since 1925 — no circuit in the world has a longer unbroken MotoGP history. The Dutch fans don\'t just watch racing; they make an event of it. The town of Assen transforms completely for TT weekend: caravans fill the surrounding fields, parties run through the night, and over 100,000 fans create an atmosphere that veterans say is unlike any other round. The circuit itself is exceptional — smooth, flowing, fast, and technically satisfying. This is where legends are made and where the sport\'s history runs deepest.',
    highlights_list: [
      'TT Circuit Assen — World\'s Oldest GP',
      'Dutch TT Festival Atmosphere',
      'Groningen City & Culture',
      'Dutch Countryside & Cycling',
      'Amsterdam Day Trip',
    ],
    city_guide: `## About Assen & Drenthe

Assen is the capital of the Drenthe province — a quiet, pleasant Dutch town of 70,000 people that transforms into one of motorsport's great party venues for TT weekend. The town itself is compact and walkable, with a centre built around the wide Brink square and a handful of good restaurants and bars. But the real draw is the circuit, which sits just outside the town boundary, and the festival atmosphere that builds from Thursday onwards as fans pour in from across the Netherlands, Germany, Belgium, and beyond.

The surrounding Drenthe province is genuinely beautiful — flat agricultural land punctuated by ancient forests, heathland, and the famous hunebedden (megalithic stone tombs, the oldest surviving structures in the Netherlands). Cycling is the natural way to explore it.

## Food & Dutch Cuisine

Dutch food is honest and hearty rather than glamorous. In Assen and surrounds, look for **stroopwafels** (caramel waffle sandwiches, eaten warm over a coffee cup), **haring** (raw herring with onion and pickles — a Dutch institution), **bitterballen** (fried ragout balls, the perfect beer snack), **stamppot** (mashed potato with kale or sauerkraut), and **Dutch cheese** (Gouda and Edam are locals, but Beemster and Old Amsterdam are better). During TT week the circuit and surrounding fields are dotted with food stalls — Dutch frites (chips) with mayonnaise are essential circuit food.

## Groningen City

**Groningen** is 30 km north of Assen and well worth a visit — a lively university city with an excellent Museum Groningen (contemporary art, housed in a spectacular Mendini-designed building), the medieval **Martinitoren** tower, and a vibrant bar and restaurant scene concentrated around the **Grote Markt** and **Poelestraat**. Thursday evening before race weekend, when fans are arriving and the city is buzzing, is a great time to visit. The **Groninger Museum** is a genuine highlight — one of the most architecturally remarkable buildings in the Netherlands.

## TT Festival Atmosphere

The Dutch TT is as much festival as race meeting. The circuit fields surrounding Assen host tens of thousands of campers from Thursday. Music stages, beer tents, and an enormous paddock village create a multi-day event. The Saturday after qualifying traditionally sees an enormous street party in central Assen — the **TT Festival** has been running for decades and draws crowds into the early hours. If you\'re coming for the atmosphere, book a campsite inside the circuit grounds — it\'s the authentic TT experience.

## Amsterdam (Day Trip or Base)

Amsterdam is 180 km south of Assen — 2 hours by car or 2.5 hours by train (Assen → Amsterdam Centraal direct). For fans who want big-city accommodation, restaurants, and nightlife, basing in Amsterdam and driving or training up for race days is a viable option. The **Rijksmuseum**, **Van Gogh Museum**, **Anne Frank House**, and the canal ring are all within the city centre.`,
    getting_there_intro: 'Groningen Airport Eelde (GRQ) is the closest airport — 20 km from Assen — with limited international connections. Amsterdam Schiphol (AMS) is the main international hub, 180 km south, with 2.5 hour train or 2 hour drive to Assen. Eindhoven (EIN) is an alternative for Ryanair/Wizz Air routes. The A28 motorway connects Amsterdam directly to Assen.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Amsterdam Schiphol (AMS)',
        desc: 'Schiphol is one of Europe\'s busiest hubs with direct flights from virtually everywhere. From Schiphol, direct trains run to Assen (Amsterdam Centraal → Assen, 2h 15min, ~€25). Alternatively hire a car at the airport for the 2-hour drive via the A1/A28 motorway.',
      },
      {
        icon: '✈️',
        title: 'Fly to Groningen (GRQ) or Eindhoven (EIN)',
        desc: 'Groningen Airport Eelde (GRQ) is 20 km from Assen — seasonal connections from London City, Munich, and a few other destinations. Eindhoven (EIN) has Ryanair/Wizz Air routes and is 2.5 hours by car. Check GRQ for direct links if your dates work.',
      },
      {
        icon: '🚂',
        title: 'Train from Amsterdam or Groningen',
        desc: 'Direct NS trains run Amsterdam Centraal → Assen in 2h 15min (change at Zwolle). From Groningen → Assen is 30 minutes. On TT weekend, NS runs additional services — check ns.nl for race weekend timetables. Assen station is 2 km from the circuit centre.',
      },
      {
        icon: '🚗',
        title: 'Drive via A28 motorway',
        desc: 'From Amsterdam: A1 east then A28 north to Assen, approximately 2 hours. From Germany (Hamburg/Bremen area): A31/A37 into the Netherlands and A28 south to Assen. Extensive camping and parking surrounds the circuit — arrive Thursday or very early Sunday to avoid queues.',
      },
    ],
    where_to_stay: `## Assen Town Centre

Staying in Assen puts you within 2 km of the circuit — walking distance or a short taxi. **NH Assen** and **Best Western Plus Assen** are the most reliable hotels in the centre. Book 4–6 months ahead for TT weekend — Assen hotels sell out faster than almost any other MotoGP round. Prices increase significantly for race weekend.

## Circuit Camping (Recommended)

The Dutch TT camping experience is legendary — tens of thousands of fans camp in the fields surrounding the circuit from Thursday to Sunday. Multiple campsite zones offer different experiences, from quiet family areas to the famous "party fields." Book official campsites at ttassen.nl well in advance. This is the authentic TT experience and the best way to be part of the festival atmosphere.

## Groningen City (30 km North)

Groningen has a much larger hotel stock and a great city atmosphere. **Hotel Schimmelpenninck Huys** (boutique, canal house), **Martini Hotel** (central, excellent location), and many Airbnb options. Drive or train to Assen for race days. Good base for arriving Thursday with Thursday evening in Groningen city.

## Amsterdam (180 km South)

For those prioritising city experience over circuit proximity. Large accommodation choice, world-class restaurants, and easy train connections to Assen. Best for fans who want to split the trip between city and circuit.`,
    travel_tips: [
      {
        heading: 'Book accommodation 4–6 months ahead',
        body: 'The Dutch TT is one of the most attended events on the MotoGP calendar. Assen hotel rooms and circuit campsites sell out months in advance. Set a reminder for the moment tickets go on sale and book accommodation at the same time.',
      },
      {
        heading: 'Circuit camping is the authentic experience',
        body: 'If you\'ve never camped at a Grand Prix, the Dutch TT is the one to try. The atmosphere in the circuit fields is extraordinary — music, fellow fans, and the circuit just metres away. Book at ttassen.nl. Bring waterproofs — Dutch June weather is unpredictable.',
      },
      {
        heading: 'June weather in Drenthe',
        body: 'Late June in the Netherlands can be warm (18–24°C) but also rainy and cool — the Netherlands is notorious for changeable weather. Pack waterproofs, warm layers, and wellies if camping. The circuit drains well but the campsite fields can get muddy after rain.',
      },
      {
        heading: 'Hire a bike for the countryside',
        body: 'The Netherlands is cycling country and Drenthe is ideal — flat, with well-maintained cycle paths through forests and heathland. Hire bikes in Assen for a Friday morning ride before sessions. The hunebedden (ancient megalithic tombs) route through the province is scenic and short.',
      },
      {
        heading: 'The Saturday TT Festival in Assen centre',
        body: 'After Saturday qualifying, the centre of Assen hosts the TT Festival — music stages, food stalls, and enormous crowds celebrating into the early hours. This is a Dutch institution and not to be missed. Book a table at a restaurant early or expect long waits.',
      },
      {
        heading: 'Dutch payment culture',
        body: 'The Netherlands is highly card-friendly — virtually everywhere accepts contactless payment. However, Dutch people traditionally split bills precisely (the phrase "going Dutch" has national roots). At the circuit, card is accepted at all main vendors.',
      },
    ],
    circuit_facts: {
      Circuit: 'TT Circuit Assen',
      Lap: '4.542 km',
      Turns: '18',
      'First MotoGP': '1949',
      Capacity: '120,000',
      Location: 'Assen, Drenthe',
    },
    faq_items: [
      {
        question: 'How do I get from Amsterdam to TT Circuit Assen?',
        answer: 'By train: Amsterdam Centraal → Assen direct in 2h 15min, change at Zwolle (~€25, check ns.nl). By car: A1 east then A28 north, approximately 2 hours. On race weekend, trains run additional services — book in advance. Assen station is 2 km from the circuit.',
      },
      {
        question: 'What is the weather like at the Dutch TT in late June?',
        answer: 'Variable — temperatures typically 16–24°C but changeable. Rain is common in the Netherlands even in June. Always pack waterproofs and a warm layer, especially if camping. The circuit can be slippery after rain, which often creates mixed-condition sessions.',
      },
      {
        question: 'Is camping at the Dutch TT worth it?',
        answer: 'Absolutely — the Dutch TT camping experience is legendary. Tens of thousands of fans camp in fields surrounding the circuit from Thursday. Multiple zones from quiet to lively. Book at ttassen.nl well in advance. Bring waterproofs, warm sleeping gear, and arrive Thursday to settle in.',
      },
      {
        question: 'Why is the Dutch TT so special?',
        answer: 'It\'s the oldest Grand Prix motorcycle race still on the calendar — held every year since 1925. The Dutch fans are among the most knowledgeable and passionate in the world. The TT Festival (Saturday evening in Assen centre) has been a local institution for decades. There\'s a depth of history and atmosphere here that newer circuits simply can\'t replicate.',
      },
      {
        question: 'What are the best grandstands at TT Circuit Assen?',
        answer: 'The main grandstand (Hoofdtribune) overlooks the start/finish straight and pit lane. The Geert Timmer grandstand at the chicane is excellent for action. General Admission lets you roam the circuit — the elevated section at Stekkenwal gives panoramic views of the back section. Arrive early for GA to claim the best hillside spots.',
      },
      {
        question: 'Is Amsterdam worth visiting during race weekend?',
        answer: 'Yes — Amsterdam is 2 hours south and one of the world\'s great cities. The Rijksmuseum, Van Gogh Museum, Anne Frank House, and canal ring are all walkable from Amsterdam Centraal. Best visited Thursday before the race or the Monday after. The city is very busy in June so book museums in advance.',
      },
    ],
    page_title: 'Grand Prix of the Netherlands 2026 — Dutch TT Assen MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Grand Prix of the Netherlands at TT Circuit Assen. Tickets, transport, camping, hotels, Dutch TT history, and Netherlands travel tips.',
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
