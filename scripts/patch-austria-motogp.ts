/**
 * Patch Austria MotoGP 2026:
 *  - Update: round=15, correct name, ticket URLs
 *  - Upsert race_content with full Red Bull Ring/Styria guide
 * Run: npx tsx scripts/patch-austria-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'austria-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Grand Prix of Austria',
    round: 15,
    official_tickets_url: 'https://tickets.motogp.com/en/21021-austria/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-austria',
  }).where(eq(races.slug, 'austria-motogp-2026'));
  console.log('Updated austria-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Red Bull Ring MotoGP Guide',
    hero_subtitle: 'Red Bull Ring · Spielberg, Styria, Austria',
    guide_intro: 'The Red Bull Ring in Spielberg is one of MotoGP\'s most dramatic venues — a compact, elevation-change-heavy circuit set in the rolling green hills of Styria in central Austria. Originally built in the 1960s as the Österreichring, rebuilt and relaunched by Red Bull in 2011, the circuit combines breathtaking Alpine scenery with pure high-speed racing. The long uphill straight into Turn 1 and the downhill plunge through Turns 2 and 3 create the most intense overtaking zones on the calendar. Graz, Austria\'s second city and the Styrian capital, is 60 km east — a beautiful, underrated city with an exceptional food scene and UNESCO-listed old town.',
    why_city_text: 'The Red Bull Ring is one of the most visually spectacular circuits in the world. Set in a natural bowl in the Styrian hills with the Austrian Alps visible on the horizon, the scenery alone justifies the trip. The circuit\'s character — short (4.318 km) but brutally intense, with massive elevation changes and a layout that rewards pure horsepower and brave braking — produces some of the most overtaking-heavy races of the season. September in Styria is golden: the hills are still green, the air is crisp and clear, and Graz is at its best. This is an Austrian experience as much as a motorsport one.',
    highlights_list: [
      'Red Bull Ring & Alpine Scenery',
      'Graz UNESCO Old Town',
      'Styrian Wine Country',
      'Schlossberg & Clock Tower',
      'Austrian Alpine Cuisine',
    ],
    city_guide: `## About Spielberg & Styria

The Red Bull Ring sits in Spielberg, a small municipality in the Murtal district of Styria — Austria's second-largest federal state, running from the Alps in the northwest to the Slovenian border in the southeast. The circuit occupies a magnificent hillside setting above the Mur valley, with the Styrian Alps visible to the west on clear days. Spielberg itself is tiny — the circuit, a few hotels, and farmland. The nearest town of any size is **Zeltweg** (5 km), with **Knittelfeld** (8 km) and **Judenburg** (15 km) offering more services. For proper city life, Graz (60 km east) is the destination.

## Graz

Graz is Austria's second-largest city and the capital of Styria — a place that consistently ranks among Europe's most liveable cities but remains well under the tourist radar compared to Vienna or Salzburg. The **Altstadt** (old town) is UNESCO-listed and extraordinarily well preserved — a compact mix of Gothic, Renaissance, and Baroque architecture. The **Schlossberg** (castle hill, 473m) rises dramatically above the centre, topped by the iconic **Uhrturm** (clock tower, 16th century) — the symbol of Graz. The **Kunsthaus Graz** (contemporary art museum, nicknamed the "friendly alien" for its extraordinary biomorphic architecture) is one of Europe's great modern buildings. The **Hauptplatz** is the lively civic heart.

## Styrian Food & Wine

Styria has one of Austria's finest regional cuisines — distinct from Viennese cooking, lighter, and heavily influenced by the local landscape. **Kürbiskernöl** (pumpkin seed oil — a dark, nutty oil unique to Styria, drizzled on everything from salads to ice cream — buy a bottle), **Backhendl** (breaded fried chicken — the Styrian classic), **Steirisches Wurzelfleisch** (boiled pork with root vegetables and horseradish), **Liptauer** (spiced fresh cheese spread with paprika and caraway), and **Buchteln** (sweet yeast dumplings filled with jam). The **Südsteiermark** (South Styria) wine region — 60 km south of Graz toward the Slovenian border — produces excellent Sauvignon Blanc, Welschriesling, and Gelber Muskateller from steep vineyard terraces. It's called the "Styrian Tuscany" and the comparison is apt.

## Schlossberg & Graz Centre

The **Schlossberg** is unmissable — a wooded rocky outcrop in the middle of the city, accessible by funicular, lift, or a 15-minute walk up the steps. The Uhrturm at the top is the iconic image of Graz. The views over the red-roofed Altstadt and the Mur river are extraordinary, especially in evening golden hour. Back in the centre, the **Landeszeughaus** (Styrian Armoury — the largest preserved armoury in the world, housing 32,000 pieces) is a genuinely astonishing museum. The **Kunsthaus** is best seen at night when it glows.

## Getting Around Styria

A hire car is recommended — the circuit is in a rural valley and Graz is the only major city with public transport. The A9/S36 motorways provide fast connections between Graz, the circuit, and the rest of Austria. Vienna is 2.5 hours north on the A2 — a viable day trip for those arriving Thursday.`,
    getting_there_intro: 'Graz Airport (GRZ) is 60 km east of the circuit with direct connections from Vienna, London, Amsterdam, Frankfurt, and Zurich. Vienna International Airport (VIE) is 200 km northeast — 2.5 hours by hire car or train to Graz then hire car. A hire car is strongly recommended for the final leg to the circuit regardless of arrival airport.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Graz (GRZ)',
        desc: 'Graz Airport has direct flights from London Heathrow (British Airways), Amsterdam, Frankfurt, Vienna (Austrian/Lufthansa), and Zurich. 60 km west of the circuit — 45 minutes by hire car via the A9/S36 motorway. Taxi from GRZ to Graz centre is 15 minutes.',
      },
      {
        icon: '✈️',
        title: 'Fly to Vienna (VIE) then drive or train',
        desc: 'Vienna Schwechat has the widest international connections. Train Vienna Hauptbahnhof → Graz in 2h 30min (ÖBB Railjet). By hire car: A2 motorway south to Graz, 200 km, 2h 15min. From Graz, hire a car for the 60 km drive to the circuit.',
      },
      {
        icon: '🚂',
        title: 'Train to Zeltweg via Graz',
        desc: 'Graz Hauptbahnhof → Zeltweg (5 km from circuit) by ÖBB regional train in approximately 1h 20min. On race weekend, additional trains run — check oebb.at for timetables. From Zeltweg station, taxis and official shuttles cover the final 5 km to the circuit.',
      },
      {
        icon: '🚗',
        title: 'Drive via A9/S36 motorway',
        desc: 'From Graz: A9 north then S36 west toward Knittelfeld/Spielberg, 60 km, 45 minutes. From Vienna: A2 south to Graz, then S36 west, 200 km, 2h 15min. From Salzburg: A10 south then A9, 150 km, 1h 45min. Circuit parking is extensive — arrive before 9am on race Sunday.',
      },
    ],
    where_to_stay: `## Graz City Centre (Recommended Base)

Graz (60 km east) is the best base — excellent restaurants, UNESCO old town, and Schlossberg. **Hotel Wiesler** (art nouveau, on the Mur river — the most atmospheric hotel in Graz), **Das Weitzer** (5-star, river views, excellent restaurant), **Hotel Mercure Graz City** (reliable mid-range, central), and **Motel One Graz** (budget-friendly, well-located). Book 2–3 months ahead for September race weekend.

## Zeltweg & Knittelfeld (Near Circuit)

**Zeltweg** (5 km from circuit) and **Knittelfeld** (8 km) have basic hotels and guesthouses — practical for those prioritising circuit proximity. **Hotel Rathaus Knittelfeld** and several smaller Gasthäuser (traditional Austrian inns). Limited stock — book very early.

## Circuit Camping

The Red Bull Ring has excellent camping directly adjacent to the circuit. Popular with German, Austrian, and Italian fans. Book via redbullring.com. September camping in Styria means crisp evenings — bring a warm sleeping bag.

## Schloss Hotels in Styria

Styria has beautiful castle hotels (Schlosshotels) within 30–45 minutes of the circuit. **Schloss Seggau** (bishop's castle, vineyard estate, 40 km from circuit via Leibnitz) and **Landhaus Gols** are extraordinary options for a more immersive Austrian experience.`,
    travel_tips: [
      {
        heading: 'September in Styria — golden but cool evenings',
        body: 'Mid-September in the Styrian hills is beautiful — warm days (18–24°C), clear Alpine skies, and the first hints of autumn colour on the hills. Evenings are cool (10–14°C) — bring a proper warm jacket and layers for the grandstands after the sun goes down.',
      },
      {
        heading: 'Buy Kürbiskernöl to take home',
        body: 'Styrian pumpkin seed oil (Kürbiskernöl g.g.A.) is one of Austria\'s great food products — a dark, intensely nutty oil with protected geographic status. Drizzled on salads, soups, and even vanilla ice cream. Available at supermarkets, farm shops, and the circuit food village. Buy a bottle (or three) to take home — it doesn\'t travel without luggage.',
      },
      {
        heading: 'Climb the Schlossberg in Graz',
        body: 'The Schlossberg (castle hill) in central Graz is the best 45 minutes you\'ll spend on a Thursday or Friday afternoon. Take the funicular or lift up, walk the Uhrturm tower, enjoy the views over the Altstadt, and have a drink at one of the hilltop cafés. At golden hour, the view is extraordinary.',
      },
      {
        heading: 'The Red Bull Ring is short — 4 laps go fast',
        body: 'At 4.318 km, the Red Bull Ring is one of the shorter circuits on the calendar. MotoGP laps take around 1:23–1:25 minutes. With 28 laps, the race runs about 40 minutes — it\'s intense from start to finish. The main straight into Turn 1 is where most overtaking happens; be in position early for that view.',
      },
      {
        heading: 'Austrian cash culture',
        body: 'Austria is more cash-dependent than Germany and much more so than the UK or Netherlands. Many Gasthäuser (traditional inns), wine taverns, and smaller restaurants are cash-only. Carry €50–100 in notes. ATMs are plentiful in Graz and Knittelfeld.',
      },
      {
        heading: 'South Styria wine region is 90 minutes from the circuit',
        body: 'The Südsteiermark wine region (Gamlitz, Leutschach, Ehrenhausen) is 90 km south of the circuit — the "Styrian Tuscany" with terraced vineyards over rolling hills. Too far for a race day trip but perfect for the Monday after. The Weinstraße (wine road) through Gamlitz is one of Austria\'s most beautiful drives.',
      },
    ],
    circuit_facts: {
      Circuit: 'Red Bull Ring',
      Lap: '4.318 km',
      Turns: '10',
      'First MotoGP': '2016',
      Capacity: '80,000',
      Location: 'Spielberg, Styria',
    },
    faq_items: [
      {
        question: 'How do I get from Graz to the Red Bull Ring?',
        answer: 'By hire car: A9 north then S36 west toward Knittelfeld/Spielberg, 60 km, 45 minutes. By train: ÖBB regional from Graz Hauptbahnhof to Zeltweg (1h 20min), then taxi/shuttle 5 km to circuit. Race weekend shuttles run from Zeltweg station — check redbullring.com for timetables.',
      },
      {
        question: 'What is the weather like at the Austrian MotoGP in September?',
        answer: 'Warm days (18–24°C) with clear Alpine skies, but cool evenings (10–14°C). Mid-September in Styria is beautiful — crisp air, sometimes autumn colour starting on the hills. Bring layers for afternoon sessions and a warm jacket for evening. Rain is possible but September is generally dry in Styria.',
      },
      {
        question: 'Which airport is best for the Austrian MotoGP?',
        answer: 'Graz Airport (GRZ) is closest — 60 km east, 45 minutes by hire car. Connections from London, Amsterdam, Frankfurt, and Vienna. Vienna (VIE) has broader international reach — 200 km northeast, 2h 15min by hire car or 2h 30min train to Graz then hire car. Both work well.',
      },
      {
        question: 'Is Graz worth visiting during race weekend?',
        answer: 'Very much so. The Schlossberg and Uhrturm, the UNESCO Altstadt, the Kunsthaus "friendly alien" building, and the Styrian food scene make Graz a genuine destination. It\'s one of Austria\'s most underrated cities. Thursday evening and Friday morning are ideal for exploring before the racing begins.',
      },
      {
        question: 'What makes the Red Bull Ring special for MotoGP?',
        answer: 'The combination of Alpine scenery and intense racing is unique. The circuit is compact (4.318 km) but brutal — massive elevation changes, a long uphill straight into Turn 1 where braking is savage, and a downhill plunge through Turns 2–3. It produces overtaking-heavy races and spectacular crashes. The scenery — green Styrian hills, Alpine backdrop — makes it one of the most photogenic circuits on the calendar.',
      },
      {
        question: 'What local food should I try in Styria?',
        answer: 'Kürbiskernöl (pumpkin seed oil — drizzled on everything, buy a bottle), Backhendl (Styrian breaded fried chicken), Liptauer (spiced paprika cheese spread), and Buchteln (sweet jam-filled yeast dumplings). For wine: Sauvignon Blanc and Welschriesling from the Südsteiermark region are excellent. Styrian cuisine is Austria\'s finest regional food tradition.',
      },
    ],
    page_title: 'Grand Prix of Austria 2026 — Red Bull Ring MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Grand Prix of Austria at the Red Bull Ring, Spielberg. Tickets, transport from Graz, hotels, Alpine scenery, Styrian food, and Austria travel tips.',
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
