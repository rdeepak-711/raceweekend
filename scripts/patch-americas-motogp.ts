/**
 * Patch Americas MotoGP 2026:
 *  - Update race name, country, official_tickets_url, official_event_url
 *  - Upsert race_content with full Austin/COTA guide content
 * Run: npx tsx scripts/patch-americas-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const RACE_SLUG = 'americas-motogp-2026';

async function main() {
  // 1. Fetch race ID
  const [race] = await db.select().from(races).where(eq(races.slug, RACE_SLUG)).limit(1);
  if (!race) {
    console.error(`Race not found: ${RACE_SLUG}`);
    process.exit(1);
  }
  console.log(`Found race id=${race.id} "${race.name}"`);

  // 2. Update races table
  await db.update(races).set({
    name: 'Red Bull Grand Prix of the Americas',
    country: 'USA',
    official_tickets_url: 'https://tickets.motogp.com/en/20981-americas/?utm_source=motogp.com&utm_medium=web&utm_campaign=widget_rail_ame26',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-usa',
  }).where(eq(races.slug, RACE_SLUG));
  console.log('Updated races row.');

  // 3. Upsert race_content
  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Austin Motorsports Guide',
    hero_subtitle: 'Circuit of the Americas · Texas, USA',
    guide_intro: 'Austin, Texas is one of motorsport\'s most vibrant destinations — a city that pairs world-class racing at Circuit of the Americas with legendary live music, Texas BBQ, and a festival culture unlike anywhere else on the MotoGP calendar. Whether you\'re a first-timer or a COTA regular, this guide covers everything you need for an unforgettable race weekend.',
    why_city_text: 'COTA is the USA\'s purpose-built Grand Prix venue — 5.5 km of swooping elevation changes, a giant wheel, a stadium-spec grandstand, and a crowd that treats every racing series like the Super Bowl. Austin adds the rest: Sixth Street, Franklin Barbecue, and the eternal soundtrack of live music drifting through the night air.',
    highlights_list: ['World-class BBQ', 'Live Music Capital', 'Circuit of the Americas', 'SXSW Season', 'Texas Hill Country'],
    city_guide: `## About Austin

Austin is the capital of Texas and home to the University of Texas Longhorns, a booming tech scene, and one of the most distinctive cultures in American motorsport. The city earned its "Live Music Capital of the World" title honestly — Sixth Street, Rainey Street, and the Red River Cultural District pump out live bands seven nights a week. For race fans, Austin delivers the full package: incredible food, warm hospitality, and a crowd-favourite track that produces some of the best racing on the calendar.

## Food & BBQ

No visit to Austin is complete without sampling the legendary Texas BBQ scene. **Franklin Barbecue** on East 11th Street is the most famous — arrive before opening and expect a two-hour queue. Worth it. **La Barbecue** and **Terry Black's** offer more accessible queues with equally smoky, tender brisket. Beyond BBQ, South Congress Avenue (SoCo) is lined with great taquerias, burger joints, and elevated Tex-Mex. For something lighter, the East Austin food truck parks near Cesar Chavez serve everything from Vietnamese banh mi to Nashville hot chicken.

## Music & Nightlife

Austin lives and breathes live music. On any given weekend — race weekend especially — you'll find a dozen shows within walking distance on Sixth Street. For a more local flavour, head to **Rainey Street** (converted bungalows turned bars, younger crowd) or the **Red River Cultural District** for indie rock and country. The Continental Club on South Congress has been Austin's best live music room since 1957. Late nights typically run until 2am, and the city has an energy that keeps going well after the chequered flag.

## Race Weekend

COTA hosts multiple motorsport events, and the MotoGP round is one of the largest. The venue has a genuine festival atmosphere — outdoor stages, food vendors, and activities beyond the track itself. General Admission gives access to the infield and multiple viewing mounds; the Main Grandstand opposite Turn 12 is the premium grandstand pick. The famous **Big Wheel** (observation wheel inside the circuit) offers a panoramic view of the entire layout.

Race weekend typically brings hundreds of thousands of fans to Austin over three days. Book accommodation and restaurants early — the city fills up fast.

## Getting Around

Austin-Bergstrom International Airport (AUS) is approximately 20 miles from COTA. Ride-shares (Uber/Lyft) are the most convenient option. During peak race weekend traffic, official shuttles running from downtown hotels to COTA gates are worth using — they avoid the worst of the I-35 congestion. If you're renting a car, TX-130 is a toll road that bypasses central Austin and is significantly faster than I-35 on race days.`,
    getting_there_intro: 'Austin-Bergstrom International Airport (AUS) is approximately 20 miles from Circuit of the Americas. The airport is well connected with direct flights from most major US cities and international hubs. During race weekend, the city\'s transport infrastructure is stretched — plan your arrivals and departures accordingly.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly into AUS',
        desc: 'Austin-Bergstrom International (AUS) is ~20 miles from COTA. Taxis, Uber/Lyft, and rental cars available curbside. Direct flights from London, Cancún, and most major US hubs.'
      },
      {
        icon: '🚗',
        title: 'Rental Car',
        desc: 'A rental car gives maximum flexibility. Take TX-130 (toll road) south from Austin to avoid I-35 congestion on race days. COTA has large on-site parking lots — arrive early.'
      },
      {
        icon: '🚌',
        title: 'Official Shuttles',
        desc: 'Race weekend shuttles run from downtown Austin hotels and the Austin Convention Center direct to COTA gates. Tickets sold separately — book via the COTA website. Best way to avoid traffic.'
      }
    ],
    where_to_stay: `## Downtown Austin

Staying downtown puts you within walking distance of the best restaurants, bars, and live music. **The Driskill** (historic landmark), **W Austin**, and **Hotel Van Zandt** on Rainey Street are the top picks for race weekend. Expect premium pricing — book 3–4 months out.

## South Congress (SoCo)

A 15-minute Uber from COTA, SoCo has a relaxed, creative vibe. **Hotel San José** and **South Congress Hotel** are boutique options with great walkable dining on their doorstep.

## Near the Circuit

Several hotels cluster around the Bergstrom/COTA area on US-183 and Airport Boulevard. Less atmosphere than downtown, but closer to the track and easier parking. Best for those arriving late Friday and leaving Sunday night.

## The Domain

Austin's north side tech corridor. Marriott, Westin, and Aloft options with easy freeway access. Good choice if you're flying in to Austin and don't need to stay downtown — prices are noticeably lower than the city centre during race weekend.`,
    travel_tips: [
      {
        heading: 'SXSW overlap',
        body: 'If the MotoGP round falls near SXSW (March), Austin will be even more packed than usual. Book hotels and restaurants months in advance.'
      },
      {
        heading: 'Texas heat',
        body: 'Spring in Austin can be warm and humid. Pack sunscreen, a hat, and stay hydrated — race day on the COTA infield in full sun can feel intense. Light layers for evenings.'
      },
      {
        heading: 'Book everything early',
        body: 'Austin race weekend sells out fast. Hotels within 10 miles of COTA book up 2–3 months out. Franklin BBQ queues start forming before 9am.'
      },
      {
        heading: 'Cash for food vendors',
        body: 'Some of Austin\'s best BBQ trucks and taco stands are cash-only. Bring $100–$200 in smaller bills for street food and market vendors.'
      },
      {
        heading: 'Earplugs',
        body: 'MotoGP bikes are loud. Paddock and grandstand spectators should bring quality earplugs — the exhaust note of a prototype through Turn 1 is spectacular but unforgiving at close range.'
      },
      {
        heading: 'Parking strategy',
        body: 'COTA parking is large but fills quickly on Sunday. Arrive 90 minutes before morning warm-up or use the official downtown shuttle service to skip the lot.'
      }
    ],
    circuit_facts: {
      Circuit: 'Circuit of the Americas',
      Lap: '5.513 km',
      Turns: '20',
      'First MotoGP': '2013',
      Capacity: '120,000',
      Location: 'Austin, Texas'
    },
    faq_items: [
      {
        question: 'How do I get from Austin airport to COTA?',
        answer: 'Uber/Lyft are the easiest options (~$40–$60 one way). Official race weekend shuttles run from downtown hotels and the Convention Center. Rental cars are available at AUS airport — take TX-130 south to avoid I-35 race weekend traffic.'
      },
      {
        question: 'What is the weather like for the Americas MotoGP?',
        answer: 'The Austin round typically takes place in spring (April). Expect temperatures of 20–28°C (68–82°F) with possible afternoon showers. Conditions can change quickly — pack light rain gear and sunscreen.'
      },
      {
        question: 'Does the MotoGP round overlap with SXSW?',
        answer: 'SXSW runs in mid-March, while the Americas MotoGP is typically in April, so there\'s usually no direct overlap. However, Austin\'s hotels and restaurants are busy from late February through April — book early regardless.'
      },
      {
        question: 'Where can I get the best BBQ near COTA?',
        answer: 'Franklin Barbecue (East 11th St) is the most famous — arrive early and expect a queue. La Barbecue, Terry Black\'s, and LeRoy & Lewis are excellent alternatives with shorter waits. All are 15–25 minutes from COTA by car.'
      },
      {
        question: 'Are there hotels near Circuit of the Americas?',
        answer: 'Yes — several hotels cluster around the US-183/Airport Boulevard corridor near COTA. Downtown Austin options (20 min away) offer more atmosphere. Book 2–3 months in advance for race weekend. The official COTA website lists partner hotels.'
      },
      {
        question: 'What are the best grandstands at COTA?',
        answer: 'The Main Grandstand on the back straight opposite Turn 12 offers great views of the chicane. Turn 1 grandstands give a dramatic view of the opening corner. The infield observation wheel is great for a panoramic perspective. General Admission lets you roam the infield freely.'
      }
    ],
    page_title: 'Red Bull Grand Prix of the Americas 2026 — Austin Travel Guide',
    page_description: 'Your complete guide to attending the 2026 MotoGP Red Bull Grand Prix of the Americas at Circuit of the Americas, Austin, Texas. Tickets, transport, hotels, BBQ, and tips.',
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

main().catch(err => {
  console.error(err);
  process.exit(1);
});
