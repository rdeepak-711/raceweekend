/**
 * Patch Catalan MotoGP 2026:
 *  - Update: round=6, correct name, ticket URLs
 *  - Upsert race_content with full Barcelona/Catalunya guide
 * Run: npx tsx scripts/patch-catalan-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'catalan-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Monster Energy Grand Prix of Catalunya',
    round: 6,
    official_tickets_url: 'https://tickets.motogp.com/en/21031-catalunya',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-catalonia',
  }).where(eq(races.slug, 'catalan-motogp-2026'));
  console.log('Updated catalan-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Barcelona MotoGP Guide',
    hero_subtitle: 'Circuit de Barcelona-Catalunya · Catalonia, Spain',
    guide_intro: 'Barcelona is one of the world\'s great cities — a place where world-class architecture, Mediterranean beaches, exceptional food, and a pulsating nightlife scene combine effortlessly. The Circuit de Barcelona-Catalunya, located in Montmeló just 30 minutes from the city centre, has hosted MotoGP since 1992 and consistently delivers technical, strategic racing at a track that riders both love and respect. The Catalunya round is unique on the calendar: where else can you watch MotoGP in the morning and eat pintxos on the Barceloneta seafront by evening?',
    why_city_text: 'Barcelona is in a different league as a race weekend destination. The circuit is excellent — technical, demanding, with memorable corners like the long right-hander at Turn 3 and the brutal Repsol chicane — but the city itself is the real draw. Gaudí\'s Sagrada Família is unlike anything else in the world. The Boqueria market, the Gothic Quarter, and the beach are all within walking distance of each other. MotoGP in Barcelona means mornings at the circuit and evenings in one of Europe\'s most vibrant cities.',
    highlights_list: [
      'Gaudí & Architecture',
      'Beach & Barceloneta',
      'World-class Tapas',
      'Circuit de Barcelona-Catalunya',
      'Gothic Quarter',
    ],
    city_guide: `## About Barcelona

Barcelona is the capital of Catalonia and one of Europe's most visited cities — yet it never feels overwhelmed by tourism because it has the scale, the culture, and the infrastructure to absorb it. The city sits on the Mediterranean coast, framed by the Collserola hills, and its street grid is one of the most rational and walkable in the world (thanks to Ildefons Cerdà's 19th-century Eixample expansion). For MotoGP fans arriving for race weekend, the circuit is 25 km northeast in Montmeló — easily reached by suburban train (Rodalies line R2 Nord) or by car.

## Food & Tapas

Catalan cuisine is distinct from the rest of Spain — more restrained, product-focused, and influenced by the Mediterranean. **La Boqueria** market on Las Ramblas is touristy but the produce vendors are outstanding. For proper sit-down eating, the Eixample neighbourhood has dozens of excellent restaurants: **Parking Pizza** (yes, really — exceptional pizza), **Bar Calders** (genuine neighbourhood bar), and **Cervecería Catalana** (long queues, worth it). In Barceloneta, **La Cova Fumada** invented the bombas (stuffed potato croquettes) and is still worth seeking out for lunch.

## Architecture & Culture

No city has a greater concentration of Modernista architecture. The **Sagrada Família** (book tickets 2–3 weeks in advance) is a genuine wonder — Gaudí's unfinished basilica that has been under construction since 1882 and is still being built. **Casa Batlló** and **Casa Milà (La Pedrera)** on the Passeig de Gràcia are two more Gaudí buildings open to visitors. The **Palau de la Música Catalana** (Domènech i Montaner) and the **Park Güell** (arrive early to beat queues) round out the essential architectural circuit.

## Race Weekend

The Circuit de Barcelona-Catalunya is a proper GP track — 4.657 km, 16 corners, and a 1 km start/finish straight that gives riders a chance to study each other's data under braking. The main grandstand (Gran Tribuna) offers views of the start/finish and pit lane. The Europcar grandstand at Turn 5 is popular for watching the long right-hander sequence. General Admission lets you roam the infield freely — the hillside between Turns 7 and 10 is less crowded and gives excellent views. May weather in Barcelona is warm and reliable — 20–26°C, low chance of rain.

## Getting Around

The Rodalies R2 Nord train runs from Barcelona Sants and Passeig de Gràcia to Montmeló station (the circuit stop) in about 35–40 minutes. On race weekend, trains run every 15–20 minutes from early morning. A taxi from the city centre costs €35–50 and takes 25 minutes outside peak hours. The metro covers the city centre comprehensively — a T-Casual 10-trip card (€12.15) covers multiple journeys and is the best value for getting around Barcelona itself.`,
    getting_there_intro: 'Barcelona El Prat Airport (BCN) is one of Europe\'s busiest hubs with direct flights from over 200 destinations. The airport is 30 minutes from the city centre and 50 minutes from the circuit via Renfe suburban rail and taxi combination. Multiple transport options serve the circuit from the city on race weekend.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Barcelona (BCN)',
        desc: 'Barcelona El Prat Airport has direct flights from virtually every major European city, plus long-haul routes from North America, Middle East, and Asia. Vueling, Iberia, and Ryanair are the main carriers. Metro line L9 Sud or Aerobús coach connect airport to city centre in 30 minutes.',
      },
      {
        icon: '🚂',
        title: 'Metro & Renfe to Montmeló',
        desc: 'Rodalies line R2 Nord from Barcelona Sants or Passeig de Gràcia to Montmeló station — 35–40 minutes, ~€5. On race weekend, trains run every 15–20 minutes from 7am. Walk 15 minutes from Montmeló station to circuit gates.',
      },
      {
        icon: '🚗',
        title: 'Rental Car',
        desc: 'All major rental companies operate from BCN airport. The circuit is 25 km northeast via the C-17/A-17 motorway (toll). Parking at the circuit is ample but fills quickly — arrive before 9am on race day.',
      },
      {
        icon: '🚌',
        title: 'Official Shuttles',
        desc: 'Race weekend shuttle buses run from Barcelona city centre (Plaça Catalunya and Passeig de Gràcia) directly to the circuit gates. Check the official circuit website for departure times and pricing — typically €8–12 return.',
      },
    ],
    where_to_stay: `## Eixample / City Centre

The Eixample district is Barcelona's most convenient base — walkable to Sagrada Família, Casa Batlló, and the best restaurants, with easy metro access to Las Ramblas and the Renfe station. **Hotel Casa Camper** (Raval, design hotel), **Mandarin Oriental Barcelona** (Passeig de Gràcia, splurge), and **Hotel Praktik Rambla** (mid-range, excellent location) are strong picks. Book 3–4 months ahead for race weekend — Barcelona fills up fast in May.

## Barceloneta & Beach

The waterfront neighbourhood combines beach access with excellent seafood restaurants. **Hotel Arts Barcelona** (5-star, beachfront) and **Equity Point Sea** (hostel-style, great value) offer the full beach experience. Ten minutes from Las Ramblas by foot.

## Gràcia / Sarrià

The residential neighbourhoods above the Eixample are quieter, more local, and better value. **Casa Gracia** (boutique hostel-hotel hybrid) in Gràcia is a favourite with younger travellers. Good metro access (L3/L6) to city centre and Sants station for Renfe trains.

## Near the Circuit (Montmeló/Granollers)

If early morning sessions are your priority, a cluster of business hotels in Granollers (12 km from circuit) offers convenient options. **Hotel Granollers** and **NH Granollers** are reliable. Far less glamorous than Barcelona itself but zero commute stress on race days.`,
    travel_tips: [
      {
        heading: 'Book Sagrada Família tickets in advance',
        body: 'The Sagrada Família sells out weeks in advance, especially in May when the city is at peak tourist season. Book online at sagradafamilia.org as soon as you know your travel dates — time-entry tickets are mandatory.',
      },
      {
        heading: 'Watch for pickpockets on Las Ramblas',
        body: 'Las Ramblas and the Gothic Quarter have a well-known pickpocket problem. Keep phones and wallets in front pockets or a zipped bag. Be especially cautious at busy tourist spots and on the metro.',
      },
      {
        heading: 'Catalan pride matters here',
        body: 'Barcelona is the capital of Catalonia, not just a Spanish city. Locals appreciate hearing "Gràcies" (Catalan) rather than "Gracias." The independence movement is a live political issue — respectful curiosity is welcome, dismissiveness is not.',
      },
      {
        heading: 'Tapas timing is different here',
        body: 'Barcelona restaurants rarely open for dinner before 8:30pm and peak from 9:30–11pm. Lunch runs 1:30–3:30pm. Plan race day meals around the MotoGP schedule: late Saturday lunch before qualifying, Sunday dinner after the Grand Prix.',
      },
      {
        heading: 'May heat at the circuit',
        body: 'Circuit de Barcelona-Catalunya in May is warm — 22–28°C with strong sun. The main grandstands have partial shade but the infield is fully exposed. Pack sunscreen (SPF50+), a hat, and multiple litres of water.',
      },
      {
        heading: 'Circuit parking vs train',
        body: 'Driving to the circuit is straightforward on Friday and Saturday but Sunday traffic is significant — the access roads from the C-17 motorway queue from 11am. The Renfe suburban train to Montmeló is faster and more reliable on race day.',
      },
    ],
    circuit_facts: {
      Circuit: 'Circuit de Barcelona-Catalunya',
      Lap: '4.657 km',
      Turns: '16',
      'First MotoGP': '1992',
      Capacity: '140,000',
      Location: 'Montmeló, Catalonia',
    },
    faq_items: [
      {
        question: 'How do I get from Barcelona to Circuit de Barcelona-Catalunya?',
        answer: 'Rodalies line R2 Nord train from Barcelona Sants or Passeig de Gràcia to Montmeló station in 35–40 minutes. Trains run every 15–20 minutes on race weekend from around 7am. Montmeló station is a 15-minute walk from the circuit gates. Taxis cost €35–50 from the city.',
      },
      {
        question: 'What is the weather like at the Catalan MotoGP in May?',
        answer: 'Barcelona in May is warm and reliably sunny — 20–26°C with low probability of rain. Occasionally hot by Sunday afternoon (28°C+). Pack sunscreen and a hat for the circuit. Evenings in the city are pleasant at 15–18°C.',
      },
      {
        question: 'Which grandstands are best at Circuit de Barcelona-Catalunya?',
        answer: 'The Gran Tribuna (main grandstand) overlooks the start/finish straight and pit lane. The Europcar grandstand at Turn 5 is excellent for the flowing right-hand sequence. General Admission gives free roaming access — the hillside between Turns 7–10 is popular and less crowded than the main areas.',
      },
      {
        question: 'Is the Sagrada Família worth visiting during race weekend?',
        answer: 'Absolutely — it\'s one of the most extraordinary buildings in the world and not to be missed. Book tickets in advance (sagradafamilia.org) as it sells out weeks ahead in May. Allow 2–3 hours. Visit Thursday or Friday to avoid the Sunday post-race rush.',
      },
      {
        question: 'Where can I eat near the circuit?',
        answer: 'The circuit has a large food village with Spanish and international options. In Montmeló village (15 min walk) there are a few local bars and restaurants. Most fans base themselves in Barcelona and eat well in the city before and after sessions — the trip by train is quick enough to make this easy.',
      },
      {
        question: 'Is parking available at Circuit de Barcelona-Catalunya?',
        answer: 'Yes — the circuit has large parking areas reachable from the C-17/A-17 motorway. Paid parking is available but fills quickly on Sunday. Arrive before 9am on race day or take the Renfe R2 Nord train to Montmeló to avoid traffic entirely.',
      },
    ],
    page_title: 'Monster Energy Grand Prix of Catalunya 2026 — Barcelona MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Monster Energy Grand Prix of Catalunya at Circuit de Barcelona-Catalunya. Tickets, transport, hotels, tapas, and Barcelona tips.',
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
