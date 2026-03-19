/**
 * Patch Czech MotoGP 2026:
 *  - Update: round=9, correct name, ticket URLs
 *  - Upsert race_content with full Brno/Czechia guide
 * Run: npx tsx scripts/patch-czech-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'czech-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Grand Prix of Czechia',
    round: 9,
    official_tickets_url: 'https://tickets.motogp.com/en/21041-czech-republic/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-czechia',
  }).where(eq(races.slug, 'czech-motogp-2026'));
  console.log('Updated czech-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Brno MotoGP Guide',
    hero_subtitle: 'Automotodrom Brno · South Moravia, Czechia',
    guide_intro: 'Brno has been one of MotoGP\'s most beloved venues for decades — a flowing, undulating circuit cut through the Moravian hills that tests every aspect of a motorcycle\'s performance. The Automotodrom Brno is fast, technical, and dramatic, with steep elevation changes and corners that reward commitment. Brno itself is Czechia\'s second city — a lively university town with an exceptional Old Town, world-class underground ossuary, and the most unpretentious and affordable food and drink scene in Central Europe. This is one of the best-value MotoGP rounds on the calendar.',
    why_city_text: 'Brno punches well above its weight as a race weekend destination. The circuit is genuinely great — old-school in character, with a rhythm that builds through the lap and a final sector that\'s among the most demanding in MotoGP. The city is young, vibrant, and completely free of the tourist crowds that clog Prague. A beer costs under €2. The food is outstanding. The locals are warm and knowledgeable about racing. And in June, Moravia is at its most beautiful — the vineyards are lush, the days are long, and evenings on the terrace bars of náměstí Svobody are hard to beat.',
    highlights_list: [
      'Automotodrom Brno',
      'Brno Old Town & Ossuary',
      'Moravian Wine & Beer',
      'Villa Tugendhat (UNESCO)',
      'Affordable & Authentic'],
    city_guide: `## About Brno

Brno is the capital of the South Moravian Region and Czechia's second-largest city — a place most international visitors overlook, which is exactly why it's so good. The city has a large student population (Masaryk University alone has 35,000 students), which gives it an energy and nightlife scene that outperforms its size. The historic Old Town centres on the grand **náměstí Svobody** (Freedom Square) and climbs up to **Špilberk Castle**, which looms over the city from a wooded hill. Brno has significant Jewish heritage (the old Jewish Quarter is well-preserved), a strong modernist architecture legacy, and a deeply local food and drinking culture that hasn't been inflated by mass tourism.

## Food & Drink

Moravian cuisine is central European comfort food done well. Look for **svíčková na smetaně** (beef sirloin in cream sauce with bread dumplings and cranberry — the national dish), **vepřo-knedlo-zelo** (roast pork, dumplings, sauerkraut), **bramboráky** (potato pancakes with marjoram and garlic), and **trdelník** (chimney cake — a fair-weather street food). For beer, Moravia has its own brewing tradition — **Starobrno** is the local Brno brewery, but the craft scene has exploded in recent years with excellent taprooms in the city centre. Notably, Brno and South Moravia are also serious wine country — more on that below.

## Moravian Wine

South Moravia produces around 95% of all Czech wine, and it's seriously good — light, aromatic whites (Welschriesling, Müller-Thurgau, Palava) and increasingly impressive reds (Blaufränkisch, Zweigeltrebe). The wine villages of **Mikulov**, **Znojmo**, and **Valtice** are 45–70 km south of Brno and have been producing wine since Roman times. Wine cellars (sklepy) in the villages open for tastings on weekends. Even in Brno itself, wine bars (vinotéky) stock excellent local bottles at remarkable prices.

## Architecture & Culture

**Villa Tugendhat** is Brno's UNESCO World Heritage masterpiece — a 1930 house by Mies van der Rohe, widely considered one of the most important buildings of the 20th century. Book visits months in advance (tugendhat.eu) as slots are extremely limited. **Špilberk Castle** (on the hill above the old town) has a museum and panoramic city views. The **Brno Ossuary** (second largest in Europe after Paris) beneath St James's Church is extraordinary — the bones of 50,000 people arranged beneath the city centre. The **Functionalist Villa** architecture trail takes in dozens of remarkable interwar buildings.

## Race Weekend at Automotodrom Brno

The circuit sits 15 km southwest of the city centre, in a natural bowl in the Moravian hills. It's old-school in the best possible way — a proper flowing layout with camber changes, blind crests, and corners that demand full commitment. The long back section through Sectors 2 and 3 is where fast riders make up time. The main grandstand overlooks the start/finish and pit lane. The hillside grandstands along the back straight are famously atmospheric — Czech fans and a strong contingent of travelling fans from neighbouring Austria, Slovakia, and Poland make it loud. The circuit fills to capacity on Sunday and the party in the paddock village runs late.`,
    getting_there_intro: 'Brno has its own international airport (BRQ) with seasonal connections, but Vienna International Airport (VIE) is 130 km south and has far broader connectivity — it\'s the most practical international entry point. Prague (230 km north) is another option with superb train connections. A hire car is recommended for the final leg to the circuit.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Vienna (VIE) or Brno (BRQ)',
        desc: 'Vienna International Airport is 130 km south of Brno — 80 minutes by hire car or direct bus (FlixBus/RegioJet runs Vienna–Brno in 90 min, ~€10). Brno Tuřany Airport (BRQ) has seasonal flights from London, Amsterdam, and Eindhoven on Ryanair — check availability. Taxi from BRQ to city centre is 15 minutes.',
      },
      {
        icon: '🚂',
        title: 'Train from Prague or Vienna',
        desc: 'RegioJet and České dráhy run Prague–Brno in 2h 30min (~€10–20, book in advance). From Vienna Hauptbahnhof, trains run to Brno in 90 minutes via the Wien–Břeclav–Brno line. Brno hlavní nádraží (main station) is in the city centre — 15 km from the circuit.',
      },
      {
        icon: '🚗',
        title: 'Drive from Prague, Vienna or Bratislava',
        desc: 'Prague: D1/D2 motorway, 230 km, 2h 30min. Vienna: A2/D2 motorway, 130 km, 80 min. Bratislava: D2 motorway, 130 km, 80 min. The circuit is 15 km southwest of Brno — follow signs to Automotodrom. On race Sunday, approach roads queue from 10am — arrive by 8:30am.',
      },
      {
        icon: '🚌',
        title: 'Official Race Shuttles',
        desc: 'Race weekend shuttle buses run from Brno city centre (hlavní nádraží and náměstí Svobody) to the circuit gates. Departures every 20–30 minutes from 8am on session days. Check the official circuit website for timetables. Recommended over driving on race Sunday.',
      },
    ],
    where_to_stay: `## Brno City Centre

Staying in the centre puts you 15 km from the circuit with easy shuttle or taxi access. **Hotel International Brno** (grand communist-era tower, excellent views, good value), **Barceló Brno Palace** (best luxury option, right on the square), and **Hotel Grandezza** (boutique, Old Town) are top picks. Book 2–3 months ahead for race weekend — the city is popular with travelling MotoGP fans from across Central Europe.

## Near the Circuit

A cluster of guesthouses and smaller hotels sit along the D52/R52 road between Brno and the circuit — including the towns of **Ostopovice** and **Troubsko**. Practical for those prioritising circuit access and not interested in the city. Limited stock — book early.

## Camping at the Circuit

Automotodrom Brno has established campsite areas on circuit grounds — a popular option with the racing community, especially fans driving from Germany, Austria, and Poland. Check the official ticketing and circuit website for camping packages.

## Vienna or Prague (for early arrivals)

If arriving the Wednesday or Thursday before, basing yourself in Vienna (130 km) or Prague (230 km) for a night before driving in gives you two of Europe's great capital cities as a bonus. Both have excellent rail connections to Brno.`,
    travel_tips: [
      {
        heading: 'Brno is extraordinarily good value',
        body: 'Czech Republic is one of the cheapest countries in the EU for food and drink. A half-litre of beer in a local pub costs €1.50–2.00. A full restaurant meal is €8–15. This is a race weekend where you can eat and drink very well without spending much — take advantage of it.',
      },
      {
        heading: 'Book Villa Tugendhat months in advance',
        body: 'Villa Tugendhat (Mies van der Rohe\'s UNESCO masterpiece) has extremely limited visitor slots and books out 3–4 months ahead, especially in June. If you want to visit, book at tugendhat.eu as soon as you confirm your trip. Don\'t leave it until race week.',
      },
      {
        heading: 'Czech currency — Koruna, not Euro',
        body: 'Czechia uses the Czech Koruna (CZK), not the Euro. Cards are accepted at the circuit and in most restaurants and hotels, but cash is useful for smaller bars and market stalls. ATMs are plentiful in Brno city centre — use bank ATMs, not standalone machines.',
      },
      {
        heading: 'June weather in Moravia',
        body: 'Late June in Brno is warm — typically 22–28°C and sunny, though afternoon thunderstorms are possible. The circuit is in a hill valley that can catch showers. Pack sunscreen, a light waterproof, and don\'t underestimate the heat in the infield grandstands.',
      },
      {
        heading: 'Arrive at the circuit early on Sunday',
        body: 'The approach roads to Automotodrom Brno from the D52 get heavily congested from 10am on race Sunday. Arrive by 8:30am or use the shuttle buses from Brno hlavní nádraží. The walk from the main car park to the grandstands is 10–15 minutes.',
      },
      {
        heading: 'Try Moravian wine, not just Czech beer',
        body: 'South Moravia produces excellent wine that rarely travels outside Czechia — light Welschriesling whites and flavourful Blaufränkisch reds. Wine bars (vinotéky) in Brno\'s centre stock great bottles for €5–10. A day trip to the wine villages of Mikulov or Valtice is worth it if you have a car.',
      },
    ],
    circuit_facts: {
      Circuit: 'Automotodrom Brno',
      Lap: '5.403 km',
      Turns: '14',
      'First MotoGP': '1965',
      Capacity: '130,000',
      Location: 'Brno, South Moravia',
    },
    faq_items: [
      {
        question: 'How do I get from Brno city centre to Automotodrom Brno?',
        answer: 'Shuttle buses run from Brno hlavní nádraží (main train station) and náměstí Svobody to the circuit on race weekend — every 20–30 minutes from 8am. By taxi, the circuit is 15 km southwest and costs approximately €15–20. By car, follow the D52 southwest and signs to the Automotodrom.',
      },
      {
        question: 'What is the weather like at Brno MotoGP in June?',
        answer: 'Warm and mostly sunny — 22–28°C in late June. Afternoon thunderstorms are possible, especially in the hills around the circuit. The Brno race occasionally produces mixed-condition sessions when storms roll in. Pack sunscreen and a light waterproof layer.',
      },
      {
        question: 'Which airport should I fly into for Brno MotoGP?',
        answer: 'Vienna (VIE) is the most practical international hub — 130 km south of Brno, 80 minutes by car or 90 minutes by direct bus. Brno Tuřany Airport (BRQ) has seasonal Ryanair flights from London and Amsterdam. Prague (230 km) has the widest international connections with excellent train links to Brno (2h 30min).',
      },
      {
        question: 'Is Villa Tugendhat worth visiting?',
        answer: 'Absolutely — it\'s one of the most important buildings of the 20th century, designed by Mies van der Rohe in 1930. Slots are extremely limited (book at tugendhat.eu months in advance). The 90-minute guided tour is exceptional. An essential visit for architecture or design enthusiasts.',
      },
      {
        question: 'What are the best grandstands at Automotodrom Brno?',
        answer: 'The main grandstand overlooks the start/finish straight and pit lane. The hillside grandstands along the back straight are spectacular and highly atmospheric. General Admission allows roaming — the elevated areas above Turns 3–5 give views over multiple corners. Arrive early for the best GA spots.',
      },
      {
        question: 'What is the best local food and drink to try in Brno?',
        answer: 'Svíčková na smetaně (beef in cream sauce with dumplings) is the quintessential Czech dish. Starobrno beer is the local brewery. Moravian Welschriesling white wine from South Moravia is excellent and inexpensive. For street food, try bramboráky (potato pancakes). Everything is remarkably affordable compared to other MotoGP venues.',
      },
    ],
    page_title: 'Grand Prix of Czechia 2026 — Brno MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Grand Prix of Czechia at Automotodrom Brno. Tickets, transport, hotels, Moravian wine, Villa Tugendhat, and Brno travel tips.',
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
