/**
 * Patch Britain MotoGP 2026:
 *  - Update: round=12, correct name, ticket URLs
 *  - Upsert race_content with full Silverstone/GB guide
 * Run: npx tsx scripts/patch-britain-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'britain-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Qatar Airways Grand Prix of Great Britain',
    round: 12,
    official_tickets_url: 'https://tickets.motogp.com/en/21071-great-britain/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-great-britain',
  }).where(eq(races.slug, 'britain-motogp-2026'));
  console.log('Updated britain-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Silverstone MotoGP Guide',
    hero_subtitle: 'Silverstone Circuit · Northamptonshire, England',
    guide_intro: 'Silverstone is the home of British motorsport — a fast, flowing circuit built on a wartime airfield in the Northamptonshire countryside that has been at the heart of Grand Prix racing since 1948. The MotoGP British Grand Prix at Silverstone is one of the calendar\'s great events: a well-organised, enthusiastic British crowd, a circuit that rewards brave, committed riding with its long high-speed corners, and the full English motorsport hospitality experience. All times run on BST (British Summer Time, UTC+1). London is 90 minutes south, Oxford is 40 minutes away, and the Cotswolds are on the doorstep.',
    why_city_text: 'Silverstone has a place in motorsport history that few circuits can match — it hosted the very first Formula 1 World Championship round in 1950 and has been synonymous with high-speed racing ever since. The MotoGP British Grand Prix brings that same heritage to two wheels. The circuit\'s layout — dominated by Maggotts, Becketts, and Chapel, one of the most demanding corner sequences in motorsport — produces spectacular, committed racing. The British crowd is knowledgeable and supportive, the organisation is efficient, and the English summer countryside provides a beautiful backdrop.',
    highlights_list: [
      'Silverstone — Home of British Motorsport',
      'The Cotswolds Villages',
      'Oxford University City',
      'London Day Trip',
      'English Countryside & Pubs',
    ],
    city_guide: `## About Silverstone & Northamptonshire

Silverstone Circuit sits in the rural heart of Northamptonshire — a county of rolling agricultural land, stone villages, and historic market towns. The circuit itself is a converted WWII RAF bomber base; the runways and perimeter roads became the original circuit layout in 1948. Today it's a world-class motorsport venue with a permanent pit and paddock complex, extensive spectator infrastructure, and The Wing — one of the most impressive pit lane buildings in the world.

The nearest towns are **Towcester** (6 km, market town with good pubs), **Brackley** (12 km, home of the Mercedes F1 team), and **Northampton** (20 km, regional centre). For a proper city base, **Oxford** (40 km southwest) and **Milton Keynes** (20 km northeast) are the most practical.

## The Cotswolds

The Cotswolds AONB (Area of Outstanding Natural Beauty) begins 20–30 km west of Silverstone. The honey-stone villages — **Bourton-on-the-Water**, **Burford**, **Chipping Campden**, **Bourton**, and **Stow-on-the-Wold** — are England at its most photogenic. A drive through the Cotswolds on Thursday before the race or Monday after is one of the great English experiences. Village pubs serving real ales and Sunday roasts are everywhere.

## Oxford

Oxford (40 km southwest) is 40 minutes by car and one of England's unmissable cities. The university colleges — particularly **Christ Church**, **Magdalen**, and **Bodleian Library** — are extraordinary. The covered **Oxford Market** and **Covered Market** have excellent food stalls. **The Trout Inn** at Godstow (5 km from centre) is a legendary riverside pub. Book any Oxford restaurant for Saturday evening well in advance — the city fills up in summer.

## Food & English Pub Culture

English food has improved enormously in the past decade. At Silverstone, the circuit catering is extensive — pies, fish and chips, burgers, and the full English breakfast experience. In the surrounding villages and towns, look for a proper **Sunday roast** (beef or lamb, roast potatoes, Yorkshire pudding, gravy), **ploughman's lunch** (bread, cheese, pickle), and **fish and chips** from a proper chippy. For beer, this is real ale country — **Hook Norton Brewery** is 25 km west and one of England's finest traditional breweries.

## London

London is 90 minutes south via the M1/A5 motorway or 1 hour from Milton Keynes by train (London Euston → Milton Keynes Central, 35 min, then taxi to circuit ~20 min). For fans arriving Thursday or leaving Monday, basing in London for a night with a day trip to Silverstone is entirely feasible.

## Race Weekend Notes

All session times are BST (UTC+1). The Sunday race order is unusual — Moto2 races at 11:15, MotoGP Grand Prix at 13:00, and Moto3 closes proceedings at 14:30. This is different from most rounds where Moto3 races before Moto2, so plan your day accordingly.`,
    getting_there_intro: 'London Heathrow (LHR) and London Gatwick (LGW) are the main international gateways — 90 minutes from Silverstone by hire car. Birmingham (BHX) is 60 km northwest. The circuit sits at the junction of the A43 and B4525. On race weekend, the recommended approach is via the M1 Junction 15A from the south or A43 from the north.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to London Heathrow (LHR) or Gatwick (LGW)',
        desc: 'Heathrow is 90 km south of Silverstone — 90 minutes by hire car via the M25/M1. Gatwick is 130 km south, 2 hours. Both have the broadest international connections. Hire a car at the airport for full flexibility. Alternatively, train to Milton Keynes Central (from London Euston, 35 min) then taxi to circuit (~25 min, ~£35).',
      },
      {
        icon: '✈️',
        title: 'Fly to Birmingham (BHX)',
        desc: 'Birmingham Airport is 60 km northwest of Silverstone — 50 minutes by hire car via the M40/A43. Good connections from Ireland, Scotland, and European cities. Often cheaper than London for UK domestic and short-haul European flights.',
      },
      {
        icon: '🚂',
        title: 'Train to Milton Keynes or Northampton',
        desc: 'London Euston → Milton Keynes Central in 35 minutes (Avanti West Coast). Milton Keynes to circuit by taxi is ~25 minutes (£30–40). London Euston → Northampton in 55 minutes; Northampton to circuit ~20 minutes by taxi (£20–25). On race weekend, pre-book taxis in advance — demand is very high.',
      },
      {
        icon: '🚗',
        title: 'Drive via M1 or A43',
        desc: 'From London: M1 north to Junction 15A (A43), then follow race signs — approximately 90 minutes. From Birmingham: M40 south to Junction 11, then A422 and A43 — 50 minutes. Circuit parking is extensive but fills by 9am on Sunday. Use the designated arrival routes — the circuit website publishes race weekend traffic management plans.',
      },
    ],
    where_to_stay: `## Silverstone & Towcester (On-site / Nearby)

**Silverstone Wing** has limited premium on-site accommodation — check silverstone.co.uk for availability. The circuit also has extensive **camping** (book at silverstone.co.uk) which sells out months ahead. **Towcester** (6 km) and **Brackley** (12 km) have smaller hotels and B&Bs — book very early.

## Northampton (20 km)

Northampton has a reasonable hotel stock. **Holiday Inn Northampton**, **Hilton Northampton**, and several budget chains are available. The town centre has good restaurants and pubs. 20 km from the circuit — taxi is the most practical option on race day.

## Milton Keynes (20 km Northeast)

Milton Keynes has the largest hotel concentration near Silverstone, including **Doubletree by Hilton**, **Holiday Inn**, and many branded chains around the shopping centre. 25 minutes by taxi to the circuit. Good train connections from London Euston.

## Oxford (40 km Southwest)

Oxford is the most atmospheric base — a world-class university city with excellent restaurants, pubs, and hotels. **The Randolph Hotel** (grand Victorian, central), **Malmaison Oxford** (boutique, in the old castle), and **Graduate Oxford** (riverside, excellent views) are top choices. Book 3–4 months ahead for August race weekend.

## London (90 km South)

For fans wanting maximum city experience. The full range of London accommodation — use hotels near Euston station for easiest access to trains north. The commute to Silverstone is long on race day but manageable if using the train to Milton Keynes and taxi from there.`,
    travel_tips: [
      {
        heading: 'All times are BST — 1 hour ahead of Central Europe',
        body: 'Silverstone runs on British Summer Time (UTC+1). Sessions start significantly later in local time than at continental European rounds — MotoGP Free Practice 1 at 11:45 BST, Grand Prix at 13:00 BST. If you\'re watching from Europe, add 1 hour to BST for CET.',
      },
      {
        heading: 'Sunday race order is reversed — Moto3 races last',
        body: 'Unusually for a MotoGP round, the Sunday order at Silverstone 2026 is: Moto2 at 11:15, MotoGP Grand Prix at 13:00, and Moto3 at 14:30. Plan your Sunday accordingly — don\'t leave after MotoGP if you want to see Moto3.',
      },
      {
        heading: 'Book accommodation 4–6 months ahead',
        body: 'August is peak summer in England and Silverstone is one of the most attended UK sporting events of the year. Hotels within 30 km sell out extremely early. Book as soon as your plans are confirmed — prices double in the weeks before the event.',
      },
      {
        heading: 'August weather is variable',
        body: 'August in England can be warm and sunny (20–26°C) or cool and wet. Always pack a waterproof jacket and a warm layer. The Northamptonshire countryside can be grey and windy even in summer. The circuit can dry quickly after rain but camping fields get muddy.',
      },
      {
        heading: 'Drive to the circuit via designated routes only',
        body: 'Silverstone has strict traffic management on race weekend — only approach from the directions indicated on your ticket/parking pass. The circuit publishes a full traffic management plan before the event. Ignoring the signed routes adds hours to your journey.',
      },
      {
        heading: 'The Cotswolds are on your doorstep',
        body: 'If arriving Thursday, a drive through the Cotswold villages (30 min west) is one of England\'s great pleasures. Bourton-on-the-Water, Burford, and Chipping Campden are all within easy reach. The villages are busiest on Saturday and Sunday — visit Thursday or Friday for a quieter experience.',
      },
    ],
    circuit_facts: {
      Circuit: 'Silverstone Circuit',
      Lap: '5.900 km',
      Turns: '18',
      'First MotoGP': '1977',
      Capacity: '150,000',
      Location: 'Silverstone, Northamptonshire',
    },
    faq_items: [
      {
        question: 'How do I get to Silverstone Circuit from London?',
        answer: 'By car: M1 north to Junction 15A then A43 — approximately 90 minutes. By rail: London Euston → Milton Keynes Central (35 min, Avanti West Coast), then taxi to circuit (~25 min, £30–40). Pre-book taxis from Milton Keynes well in advance — demand is very high on race weekend.',
      },
      {
        question: 'What are the session times at Silverstone MotoGP?',
        answer: 'All times are BST (British Summer Time, UTC+1). Sessions start later than at continental rounds — FP1 at 10:00/11:45 BST on Friday, Sprint at 16:00 BST Saturday, Grand Prix at 13:00 BST Sunday. Note the unusual Sunday order: Moto2 at 11:15, MotoGP at 13:00, Moto3 at 14:30.',
      },
      {
        question: 'What is the weather like at the British MotoGP in August?',
        answer: 'Variable — August in England can be warm and sunny (20–26°C) but rain is always possible. Pack a waterproof jacket regardless of the forecast. The circuit can produce mixed conditions. Layers are essential for evenings and early morning sessions.',
      },
      {
        question: 'Is camping available at Silverstone?',
        answer: 'Yes — Silverstone has extensive camping that sells out months ahead. Book via silverstone.co.uk. Multiple camping areas from basic to premium. The on-site camping experience is excellent — thousands of fans create a great atmosphere. Bring a good tent and waterproofs.',
      },
      {
        question: 'Is Oxford worth visiting during race weekend?',
        answer: 'Absolutely. Oxford is 40 km southwest — 40 minutes by car. The university colleges (Christ Church, Magdalen, Bodleian Library), covered market, and riverside pubs are excellent. Visit Thursday or Friday morning before sessions start. Book restaurants in advance for Saturday evening.',
      },
      {
        question: 'Why is the Sunday race order different at Silverstone?',
        answer: 'The 2026 British Grand Prix Sunday schedule has Moto2 racing first (11:15), then MotoGP (13:00), and Moto3 last (14:30). This is the reverse of the usual Moto3-before-Moto2 order seen at most rounds. Plan your Sunday accordingly if you want to watch all three races.',
      },
    ],
    page_title: 'Qatar Airways Grand Prix of Great Britain 2026 — Silverstone MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Qatar Airways Grand Prix of Great Britain at Silverstone. Tickets, transport from London, hotels, camping, Cotswolds, and British MotoGP tips.',
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
