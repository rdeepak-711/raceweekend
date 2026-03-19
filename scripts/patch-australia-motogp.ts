/**
 * Patch Australia MotoGP 2026:
 *  - Update: round=18, correct name, ticket URLs
 *  - Upsert race_content with full Phillip Island/Melbourne guide
 * Run: npx tsx scripts/patch-australia-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'australia-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Grand Prix of Australia',
    round: 18,
    official_tickets_url: 'https://tickets.motogp.com/en/21151-australia/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-australia',
  }).where(eq(races.slug, 'australia-motogp-2026'));
  console.log('Updated australia-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Phillip Island MotoGP Australia Guide',
    hero_subtitle: 'Phillip Island Circuit · Victoria, Australia',
    guide_intro: 'Phillip Island Circuit is one of the oldest and most beloved venues on the MotoGP calendar — a clifftop track on a windswept island 140 km south of Melbourne, where sweeping high-speed corners face directly into the Southern Ocean. The Gardner Straight, the Hayshed Hairpin, and — above all — the iconic Lukey Heights and the fast right-hand sweep of Turn 4 overlooking the sea define a circuit that rewards pure bravery and commitment. The Australian GP has been held here almost continuously since 1989, and the combination of passionate home crowd, breathtaking scenery, and a layout that produces spectacular racing makes it one of the genuinely unmissable rounds of the season. Melbourne, one of the world\'s great cities for food, coffee, and culture, is the natural base — 140 km north on the South Gippsland Highway.',
    why_city_text: 'Phillip Island is MotoGP at its most cinematic. The circuit sits on a peninsula above the Bass Strait — a narrow strip of land where the wind comes off Antarctica and the sea is visible from almost every corner of the track. Riders lap at speeds approaching 300 km/h through corners perched above the Southern Ocean. The Australian crowd is knowledgeable, passionate, and famously welcoming — this is the home race for multiple Australian champions, and that heritage is felt everywhere. Then there\'s Melbourne: one of the world\'s great food and coffee cities, with a café culture that is genuinely world-class. The combination of Phillip Island racing and Melbourne exploration makes this one of the best trips on the calendar.',
    highlights_list: [
      'Phillip Island — Clifftop Circuit Above the Southern Ocean',
      'Melbourne — World\'s Greatest Coffee City',
      'The Lukey Heights & Gardner Straight',
      'Penguin Parade & Island Wildlife',
      'Great Ocean Road Day Trip',
    ],
    city_guide: `## About Phillip Island Circuit

Phillip Island Circuit (opened 1956, current layout established 1989) occupies a dramatic position on the northern tip of Phillip Island — a narrow peninsula in Western Port Bay, connected to the Victorian mainland by a single bridge. The circuit is 4.448 km of pure high-speed racing: the **Gardner Straight** (named for Wayne Gardner, 1987 World Champion) is one of the longest straights on the calendar, leading into the **MG Hairpin**. **Lukey Heights** — a blind high-speed crest — and the fast right-hand exit of **Turn 4** (overlooking the Southern Ocean) are the circuit's defining moments. October in Victoria is spring — unpredictable weather, strong Bass Strait winds, and occasional sun all in one afternoon. The microclimate on the island means conditions can change dramatically between sessions.

## Melbourne

Melbourne (140 km north of the circuit, approximately 2 hours by car or direct bus/coach on race weekend) is one of the world's most liveable cities — and one of its great food and culture capitals. The city's **café culture** is a genuine phenomenon: Melbourne invented the flat white (alongside Sydney, depending on who you ask), the café fitout as art, and the laneway coffee culture that now defines Australian cities. The **CBD laneways** — **Degraves Street**, **Centre Place**, **Hardware Lane** — are where Melbourne's food and coffee identity lives. **Fitzroy** and **Collingwood** are the inner-city creative neighbourhoods: independent cafés, bars, galleries, and restaurants. **St Kilda** is the beach suburb with a slightly bohemian edge, Port Phillip Bay views, and the famous Luna Park. **South Yarra** and **Toorak** are upscale shopping and dining. The **Queen Victoria Market** is one of the great urban food markets in the southern hemisphere.

## Victorian Food & Coffee Culture

Victoria has Australia's finest food culture. Beyond the legendary coffee, Melbourne is defined by its multicultural dining: **Vietnamese** pho and banh mi in Richmond's Victoria Street, **Greek** tavernas in Oakleigh, **Chinese** yum cha in Box Hill, **Italian** in Carlton, and some of the world's best **Japanese** omakase counters in the CBD. Victorian produce is exceptional — **Mornington Peninsula** wines (Pinot Noir and Chardonnay from cool-climate vineyards 1 hour from Melbourne), **Gippsland** dairy and beef, **Yarra Valley** salmon and cheese. **Flat white** (espresso, micro-foamed milk — NOT a latte), **magic** (3/4 flat white in a smaller cup), and **piccolo** are the coffee orders that signal you've done your research.

## Phillip Island Beyond the Circuit

The island has substantial wildlife appeal beyond the racing. The **Penguin Parade** at Summerlands Beach (nightly, year-round) is one of Australia's most famous wildlife experiences: hundreds of little penguins (the world's smallest penguin species) returning from sea at dusk to their burrows in the dunes. Book well in advance — it sells out on race weekend. **Koalas** are found in the eucalyptus gum trees around the circuit and across the island (Koala Conservation Reserve at Fiveways). **Fur seals** at Seal Rocks (viewed from the Nobbies boardwalk) are visible from the western tip of the island.

## Great Ocean Road

The **Great Ocean Road** — one of Australia's iconic coastal drives — begins at Torquay, 70 km west of the circuit. The road follows the surf coast to **Lorne** (charming beach town), **Apollo Bay**, and eventually the **Twelve Apostles** (limestone sea stacks, 260 km from Melbourne). The stretch from Torquay to Lorne (100 km) is doable as a post-race Monday detour before heading back to Melbourne. The **Bells Beach** surf break (Torquay) is one of surfing's most sacred sites — host of the Rip Curl Pro, the world's oldest professional surf contest.`,
    getting_there_intro: 'Melbourne Tullamarine Airport (MEL) is the primary international gateway — direct flights from London (21h, Qantas/British Airways), Dubai, Singapore, Hong Kong, Los Angeles, and all Australian capitals. From Melbourne, Phillip Island is 140 km south: approximately 2 hours by hire car on the South Gippsland Highway via the Phillip Island bridge. Race weekend coaches also run from Melbourne CBD and Southern Cross Station.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Melbourne (MEL)',
        desc: 'Melbourne Tullamarine (MEL) has direct flights from London Heathrow (Qantas, 21h), Dubai (Emirates), Singapore (Singapore Airlines, Jetstar), Hong Kong (Cathay Pacific), Los Angeles (Qantas), and all Australian capitals (Qantas, Virgin Australia, Jetstar — 1h from Sydney, 3h from Perth). Second airport: Melbourne Avalon (AVV), 90 km west — mainly Jetstar domestic and some international. MEL is strongly preferred for connections.',
      },
      {
        icon: '🚗',
        title: 'Hire car from Melbourne — South Gippsland Highway',
        desc: 'From Melbourne CBD or Airport: South Gippsland Highway (M420 → Princes Freeway → South Gippsland) to Phillip Island via Lang Lang and the San Remo bridge — 140 km, approximately 2 hours without traffic. On race Sunday, the bridge to the island (single approach road) is managed by traffic control and can add 30–60 minutes — arrive early (before 9am) or use the coach. Return traffic on Sunday evening is heavy.',
      },
      {
        icon: '🚌',
        title: 'Race weekend express coach from Melbourne',
        desc: 'Direct express coaches run from Melbourne CBD (Southern Cross Station and Federation Square) to the circuit gates on race weekend — typically Friday through Sunday. Check Phillip Island Grand Prix Circuit website and V/Line for bookings. The coach eliminates the bridge traffic stress entirely and is strongly recommended for Sunday race day. Departs early morning, returns after the podium.',
      },
      {
        icon: '🚌',
        title: 'Stay on the island — walk or local shuttle',
        desc: 'If staying in Cowes (Phillip Island\'s main town, 20 km from the circuit), local shuttles and taxis run on race weekend. Cowes has a ferry connection to Stony Point on the Mornington Peninsula (removing the need to cross the San Remo bridge). Some visitors arrive from Melbourne via ferry to Stony Point → ferry to Cowes → local transport — worth considering for race day to avoid the bridge.',
      },
    ],
    where_to_stay: `## Melbourne City (Recommended Base)

Melbourne (140 km north) is the best base — world-class hotels, extraordinary food scene, and easy race weekend coach or car connection. **The Langham Melbourne** (riverside, elegant), **Park Hyatt Melbourne** (cathedral views, CBD), **QT Melbourne** (design hotel, excellent rooftop bar), **Hotel Windsor** (1883, the grande dame of Melbourne hotels), **Ovolo Laneways** (boutique, CBD laneway location), and **ibis Melbourne** (reliable budget, CBD). Book 3–4 months ahead — Melbourne is always busy in October (spring racing carnival overlaps).

## Cowes — Phillip Island's Main Town

Cowes (20 km from circuit, Phillip Island's main township) is the most practical on-island base. **Clifftop at Hepburn** style accommodation, **BIG4 Phillip Island Caravan Park**, and numerous holiday houses and beach apartments available via Airbnb/Stayz. Cowes has restaurants, a supermarket, and a pleasant waterfront. Walk or use local shuttles to the circuit. Books out completely for race weekend — book many months in advance.

## Circuit-Adjacent Accommodation

Holiday houses and farms in Cowes, Rhyll, and Newhaven (all within 30 km of the circuit) are popular with fans who want to stay on the island. Camping is also available near the circuit. All on-island accommodation sells out very early for the MotoGP weekend — check booking platforms immediately.

## Mornington Peninsula (Alternate Base)

The **Mornington Peninsula** (north of Phillip Island, accessible via the Stony Point → Cowes ferry) has upscale accommodation in Portsea, Sorrento, and Red Hill — wine country, beach, and day spa territory. **The Baths Sorrento**, **Jackalope Hotel** (Red Hill — extraordinary design hotel in a vineyard), and **Port Phillip Estate** combine Peninsula wine with race proximity. Slower access to the circuit but a more relaxed atmosphere.`,
    travel_tips: [
      {
        heading: 'October weather — spring in Victoria, plan for everything',
        body: 'Late October in Victoria is spring — temperatures ranging from 12°C to 24°C in the same day. The island microclimate is more extreme: strong Bass Strait winds (always), sudden rain showers (frequent), and occasionally brilliant sunshine. Bring a proper waterproof jacket, warm mid-layer, and sunscreen. The grandstands on the seaward side of the circuit are fully exposed to the wind — dress in layers.',
      },
      {
        heading: 'Order a flat white — not a latte',
        body: 'Melbourne\'s coffee culture is a serious matter. Order a **flat white** (espresso with micro-foamed milk, served in a ceramic cup — 200ml). A **magic** (3/4 flat white in a smaller 150ml cup — stronger ratio) is the local insider order. Do NOT ask for a "latte with extra foam" — that\'s a cappuccino. Cafés in Fitzroy, Collingwood, and Degraves Street lane are the places to calibrate. The circuit café will serve reasonable coffee by Australian standards.',
      },
      {
        heading: 'Book the Penguin Parade well in advance',
        body: 'The **Penguin Parade** at Summerlands Beach (Phillip Island\'s western tip) is one of Australia\'s most iconic wildlife experiences — little penguins returning from sea at dusk, every evening of the year. On race weekend, it sells out completely. Book at penguins.org.au immediately. The Underground Viewing is worth the premium — you\'re at ground level as hundreds of penguins waddle past within arm\'s reach.',
      },
      {
        heading: 'The Gardner Straight is the best viewing spot',
        body: 'The **Gardner Straight** — the long main straight named after 1987 World Champion Wayne Gardner — is where top speed is achieved and braking into the MG Hairpin is most dramatic. Grandstand D (MG Hairpin) gives the view of 200+ km/h approaches and extreme late braking. Lukey Heights (Turn 4 area) is the other defining spot — riders arrive blind over a crest at 250+ km/h. Both are worth the ticket premium.',
      },
      {
        heading: 'Daylight Saving is in effect — AEDT (UTC+11)',
        body: 'Victoria enters Daylight Saving Time on the first Sunday of October — so by race weekend (late October), clocks are on AEDT (UTC+11), one hour ahead of standard AEST. All session times on the schedule are in AEDT local time. For European viewers: the race (14:00 AEDT Sunday) broadcasts at 04:00 Saturday morning CET — Sunday night in Australia is Saturday morning in Europe.',
      },
      {
        heading: 'Mornington Peninsula wines — Pinot Noir country',
        body: 'The **Mornington Peninsula** wine region (1 hour from Melbourne, 45 minutes from Phillip Island via ferry) is one of Australia\'s finest cool-climate wine areas — renowned for **Pinot Noir** and **Chardonnay** from vineyards on ancient volcanic soil. **Stonier**, **Port Phillip Estate**, **Paringa Estate**, and **Ten Minutes by Tractor** are exceptional producers. A Peninsula wine lunch on the Monday after the race — before flying home — is the ideal conclusion to an Australian race trip.',
      },
    ],
    circuit_facts: {
      Circuit: 'Phillip Island Circuit',
      Lap: '4.448 km',
      Turns: '12',
      'First MotoGP': '1989',
      Capacity: '65,000',
      Location: 'Phillip Island, Victoria',
    },
    faq_items: [
      {
        question: 'How do I get from Melbourne to Phillip Island Circuit?',
        answer: 'By hire car: South Gippsland Highway from Melbourne CBD — 140 km, approximately 2 hours. On race Sunday, allow 30–60 minutes extra for bridge traffic — arrive before 9am. By race weekend coach: express buses depart from Southern Cross Station and Federation Square directly to the circuit — the stress-free option for race day. Check Phillip Island Circuit website for coach bookings.',
      },
      {
        question: 'What is the weather like at Phillip Island MotoGP in October?',
        answer: 'Spring in Victoria — highly variable. Temperatures of 12–24°C in one day, with strong Bass Strait winds almost certain. Rain is possible at any time; brilliant sunshine is also possible in the same afternoon. Bring a waterproof jacket, warm mid-layer, and sunscreen. The island microclimate is more extreme than Melbourne — always pack layers regardless of the morning forecast.',
      },
      {
        question: 'Which airport is best for the Australian MotoGP?',
        answer: 'Melbourne Tullamarine (MEL) — Australia\'s second-busiest airport with the widest international connections. Direct from London, Dubai, Singapore, Hong Kong, Los Angeles, and all Australian capitals. Melbourne Avalon (AVV) is mainly domestic Jetstar — useful if that fits your routing but MEL is strongly preferred. From MEL to the circuit is 170 km (Melbourne city is 140 km from circuit).',
      },
      {
        question: 'Is Melbourne worth visiting during race weekend?',
        answer: 'Absolutely — Melbourne is consistently ranked among the world\'s most liveable cities, and it\'s a genuine food, coffee, and culture capital. The CBD laneways, Fitzroy and Collingwood dining scenes, Queen Victoria Market, and the beach suburb of St Kilda are all worth exploring before or after the race. Allow at least 2 days in Melbourne.',
      },
      {
        question: 'What makes Phillip Island special for MotoGP?',
        answer: 'The setting — a clifftop circuit on a windswept island with the Southern Ocean visible from the grandstands — is unique in world motorsport. The Gardner Straight is one of the fastest sections on the calendar, and the circuit\'s flowing layout (only 12 corners) produces spectacular racing. It has hosted MotoGP almost continuously since 1989, and the Australian crowd — knowledgeable, passionate, and welcoming — creates one of the best atmospheres on the calendar.',
      },
      {
        question: 'What should I do on Phillip Island beyond the racing?',
        answer: 'The Penguin Parade (little penguins returning to shore at dusk — book well in advance at penguins.org.au), koala spotting at the Koala Conservation Reserve, fur seals at The Nobbies viewpoint, and the island\'s coastal walks and beaches. For a day trip from Melbourne before the race: the Great Ocean Road begins at Torquay (70 km west of the circuit) — the Torquay to Lorne coastal stretch is one of Australia\'s great scenic drives.',
      },
    ],
    page_title: 'Grand Prix of Australia 2026 — Phillip Island MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Grand Prix of Australia at Phillip Island Circuit. Tickets, transport from Melbourne, hotels, coffee culture, Penguin Parade, and Victoria travel tips.',
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
