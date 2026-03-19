/**
 * Patch Hungary MotoGP 2026:
 *  - Update: round=8, correct name, ticket URLs
 *  - Upsert race_content with full Budapest/Balaton guide
 * Run: npx tsx scripts/patch-hungary-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'hungary-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Grand Prix of Hungary',
    round: 8,
    official_tickets_url: null,
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-hungary',
  }).where(eq(races.slug, 'hungary-motogp-2026'));
  console.log('Updated hungary-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Hungary MotoGP Guide',
    hero_subtitle: 'Balaton Park Circuit · Somogy County, Hungary',
    guide_intro: 'Hungary\'s debut on the MotoGP World Championship calendar brings one of Europe\'s most exciting new circuits to the sport — the Balaton Park Circuit, built specifically for MotoGP-grade racing near the shores of Lake Balaton, Central Europe\'s largest lake. Located about 130 kilometres southwest of Budapest, the circuit sits in a dramatic landscape of rolling hills and vineyards just kilometres from the famous Balaton resort strip. Budapest itself — baroque architecture, thermal baths, ruin bars, and one of Europe\'s most vibrant food scenes — is the perfect city base for the race weekend.',
    why_city_text: 'Hungary is MotoGP\'s newest European venue and one of the most anticipated additions to the calendar in years. The Balaton Park Circuit was designed with spectator experience at its heart — natural hillside amphitheatres, wide runoff areas, and a layout that rewards overtaking. And unlike circuits in remote industrial locations, this one sits near a genuine holiday destination: Lake Balaton draws millions of summer visitors each year for its beaches, wine, and spa culture. Budapest, meanwhile, is one of Europe\'s most underrated capitals — and with the Grand Prix falling in early June, the weather and the city are both at their absolute best.',
    highlights_list: [
      'Lake Balaton Beaches',
      'Budapest Thermal Baths',
      'Ruin Bars & Nightlife',
      'Balaton Park Circuit',
      'Hungarian Cuisine & Wine',
    ],
    city_guide: `## About Budapest

Budapest is Hungary's capital and one of Central Europe's great cities — a place where grand Habsburg architecture, Ottoman thermal baths, Jewish heritage, and a thriving contemporary culture exist side by side. The city is split by the Danube: Buda (hilly, historic, castle) on the west, Pest (flat, vibrant, walkable) on the east. In June, the city is warm, green, and buzzing — long evenings on terrace bars, ruin bars in the old Jewish Quarter, and boats on the Danube. For MotoGP, Budapest serves as the main hub, with the circuit 130 km southwest near Lake Balaton.

## Food & Cuisine

Hungarian food is hearty, paprika-driven, and deeply satisfying. Essential dishes: **gulyás** (goulash — beef and paprika soup, much more liquid than the Western version), **töltött káposzta** (stuffed cabbage with pork and rice in tomato sauce), **lángos** (deep-fried dough with sour cream and cheese — the ultimate street food), **halászlé** (spicy fisherman's soup from Lake Balaton, made with local carp and pike-perch), and **dobos torta** (layered caramel and chocolate cake). In Budapest, the **Great Market Hall** (Vásárcsarnok) on Fővám tér is the best place for food shopping and eating. **Borkonyha** (Michelin-starred Hungarian wine kitchen) and **Costes Downtown** are top-end options. For affordable authentic food, the restaurants on Liszt Ferenc tér in the Jewish Quarter are reliable.

## Lake Balaton

Lake Balaton is Hungary's sea — 77 km long, shallow and warm, surrounded by resort towns, vineyards, and beaches. **Balatonfüred** (north shore, elegant spa town) and **Siófok** (south shore, livelier and more touristy) are the most visited. The **Badacsony** wine region on the north shore produces excellent Olaszrizling and Kéknyelű whites from volcanic basalt soils. The lake is 10–20 minutes from the Balaton Park Circuit — worth an evening visit after Friday practice.

## Budapest Highlights

The **Széchenyi Thermal Bath** (outdoor pools, neo-baroque complex in City Park) and **Gellért Thermal Bath** (art nouveau, Buda) are world-famous — book in advance. **Fisherman's Bastion** and **Matthias Church** on Castle Hill give the iconic Budapest panorama. The **Hungarian State Opera House** hosts performances most evenings. The **ruin bars** of the Seventh District (Szimpla Kert is the original and best) are open until dawn. The **Jewish Quarter** around Dohány Street Synagogue has excellent restaurants and bars. Sunset river cruises on the Danube offer the best views of the Parliament building — one of the most spectacular sights in Central Europe.

## Race Weekend at Balaton Park

The Balaton Park Circuit is Hungary's first MotoGP venue and was purpose-built to the highest FIM standards. The circuit runs through natural hillside terrain with elevation changes that create dramatic viewing angles from the grandstands. The layout features a long main straight, a technical first sector, and a flowing back section that rewards riders who carry momentum. With the race falling in early June, conditions are warm and dry — ideal for fast MotoGP lap times.`,
    getting_there_intro: 'Budapest Ferenc Liszt International Airport (BUD) is Hungary\'s main hub with direct flights from across Europe and beyond. The circuit is 130 km southwest of Budapest near the town of Nagyatád in Somogy County — approximately 90 minutes by car. Lake Balaton towns (Siófok, Balatonfüred) are closer bases at 30–40 minutes from the circuit.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Budapest (BUD)',
        desc: 'Budapest Ferenc Liszt International Airport has direct flights from London (Gatwick, Stansted), Amsterdam, Paris, Frankfurt, Vienna, and most major European cities. Ryanair, Wizz Air, and Lufthansa are primary carriers. Taxi or Airport Shuttle to city centre takes 30–40 minutes.',
      },
      {
        icon: '🚗',
        title: 'Drive from Budapest',
        desc: 'The circuit is 130 km southwest via the M7 motorway toward Lake Balaton, then south on the M9/67 road. Journey is 90 minutes in normal traffic. On race Sunday, allow extra time. Parking at the circuit is extensive — arrive before 9am to avoid queues.',
      },
      {
        icon: '🚂',
        title: 'Train to Lake Balaton, then taxi',
        desc: 'Regular MÁV InterCity trains run from Budapest Keleti or Déli station to Siófok (south shore) in 80–90 minutes. From Siófok, taxis to the circuit take approximately 35–40 minutes. On race weekend, check for additional shuttle services from Balaton resort towns.',
      },
      {
        icon: '🚌',
        title: 'Official Race Shuttles',
        desc: 'Race weekend shuttle buses are expected to run from Budapest and from Balaton resort towns (Siófok, Balatonfüred) to the circuit gates. Check the official circuit and MotoGP event websites for confirmed timetables and booking as the event approaches.',
      },
    ],
    where_to_stay: `## Budapest City Centre

Staying in Budapest gives you the full city experience — thermal baths, ruin bars, excellent restaurants, and a 90-minute commute to the circuit by car. **Hotel Párisi Udvar** (Hyatt, stunning Moorish Revival building), **Aria Hotel Budapest** (music-themed boutique hotel, excellent rooftop), and **Continental Hotel Budapest** (affordable, great location in Jewish Quarter) are strong options. Book 2–3 months ahead for June race weekend.

## Lake Balaton — Siófok (South Shore)

Siófok is the closest major Balaton resort town to the circuit (~35 min drive) and the liveliest. Hotels range from the **Hotel Janus** and **Ramada by Wyndham Siófok** to dozens of smaller guesthouses and Airbnbs. Expect higher prices and full occupancy for race weekend — book very early.

## Lake Balaton — Balatonfüred (North Shore)

Balatonfüred is more refined than Siófok — a traditional spa town with elegant 19th-century architecture. Slightly further from the circuit (~50 min) but beautiful surroundings and excellent wine from the nearby Badacsony region. **Hotel Füred** and various villa rentals are available.

## Near the Circuit (Nagyatád / Marcali)

The towns immediately surrounding the circuit — Nagyatád and Marcali — offer limited but affordable accommodation (guesthouses, village rooms). Most practical for those whose priority is minimal commute time. Expect very limited stock; book well in advance.`,
    travel_tips: [
      {
        heading: 'Hungary is MotoGP\'s newest venue — expect surprises',
        body: 'This is a brand-new circuit on the calendar. Infrastructure, shuttle services, and circuit logistics will be established but may not yet be as slick as longer-standing venues. Build in extra time for parking, entry queues, and navigation on race day.',
      },
      {
        heading: 'Book Budapest accommodation early',
        body: 'June is high season in Budapest — the city is busy with tourists even without MotoGP. Good-value central accommodation fills 2–3 months ahead. The race adds further pressure on hotels near the Jewish Quarter and city centre.',
      },
      {
        heading: 'Try the thermal baths',
        body: 'Budapest\'s thermal baths are a genuine cultural experience, not just a tourist attraction. The Széchenyi (outdoor pools, party atmosphere on weekend evenings) and the Gellért (art nouveau, more serene) are the best. Book online to avoid queues — especially on weekend mornings.',
      },
      {
        heading: 'Early June weather is warm',
        body: 'Budapest and Lake Balaton in early June are warm and pleasant — typically 20–27°C. Rain is possible but brief. The circuit will be warm, so pack sunscreen and a hat. Evenings in Budapest are perfect for outdoor bar terraces.',
      },
      {
        heading: 'Forint (HUF) is the currency',
        body: 'Hungary uses the Hungarian Forint, not the Euro. Card payments are widely accepted in Budapest and at the circuit, but carry some cash (1,000–5,000 HUF notes) for smaller bars, market stalls, and parking. Exchange at banks or ATMs — airport exchange desks have poor rates.',
      },
      {
        heading: 'Visit Lake Balaton after practice',
        body: 'The lake is minutes from the circuit. After Friday or Saturday sessions, head to Siófok or Balatonfüred for dinner by the water — local fish dishes (fogash, fogas pike-perch) with a glass of Badacsony white wine is the ideal end to a race day.',
      },
    ],
    circuit_facts: {
      Circuit: 'Balaton Park Circuit',
      Lap: 'TBC',
      Turns: 'TBC',
      'First MotoGP': '2026',
      Capacity: 'TBC',
      Location: 'Somogy County, Hungary',
    },
    faq_items: [
      {
        question: 'How do I get from Budapest to the Balaton Park Circuit?',
        answer: 'By car: take the M7 motorway southwest toward Lake Balaton, then south via M9/67 — approximately 90 minutes from Budapest. Race weekend shuttle buses are expected from Budapest and from Balaton resort towns. Check the official event website for confirmed shuttle schedules.',
      },
      {
        question: 'What is the weather like at the Hungary MotoGP in early June?',
        answer: 'Warm and mostly sunny — 20–27°C in early June. Occasional brief afternoon showers are possible. Lake Balaton is warm enough for swimming. Pack sunscreen for the circuit and a light layer for evenings in Budapest.',
      },
      {
        question: 'Is Budapest far from the circuit?',
        answer: 'Yes — about 130 km and 90 minutes by car. Many fans base themselves in Budapest for the city experience and commute in. For those wanting to minimise travel, accommodation near Siófok (south Lake Balaton, ~35 min from circuit) is much closer.',
      },
      {
        question: 'What are the best thermal baths in Budapest?',
        answer: 'Széchenyi (City Park, outdoor pools, lively atmosphere — especially Saturday evenings) and Gellért (Buda, art nouveau architecture, more refined) are the two essential experiences. Book tickets online in advance to avoid queues. Both are open every day.',
      },
      {
        question: 'What currency does Hungary use?',
        answer: 'Hungary uses the Hungarian Forint (HUF), not the Euro. Cards are widely accepted, but carry cash for markets and smaller vendors. Exchange at banks or ATMs in Budapest — avoid airport currency exchange desks which offer poor rates.',
      },
      {
        question: 'What local food should I try in Hungary?',
        answer: 'Gulyás (goulash soup with beef and paprika), lángos (fried dough with sour cream and cheese — best street food), halászlé (spicy Balaton fish soup), töltött káposzta (stuffed cabbage), and dobos torta (layered caramel cake). At the lake, try fogash (pike-perch) grilled fresh from Lake Balaton.',
      },
    ],
    page_title: 'Grand Prix of Hungary 2026 — Budapest & Balaton MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Grand Prix of Hungary at Balaton Park Circuit. Tickets, transport from Budapest, hotels, Lake Balaton, thermal baths, and Hungary travel tips.',
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
