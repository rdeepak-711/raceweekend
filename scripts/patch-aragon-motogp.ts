/**
 * Patch Aragon MotoGP 2026:
 *  - Update: round=13, correct name, ticket URLs
 *  - Upsert race_content with full MotorLand Aragón/Zaragoza guide
 * Run: npx tsx scripts/patch-aragon-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'aragon-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Grand Prix of Aragon',
    round: 13,
    official_tickets_url: 'https://tickets.motogp.com/en/20991-aragon/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-aragon',
  }).where(eq(races.slug, 'aragon-motogp-2026'));
  console.log('Updated aragon-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Aragón MotoGP Guide',
    hero_subtitle: 'MotorLand Aragón · Alcañiz, Spain',
    guide_intro: 'MotorLand Aragón is one of the most technically demanding and rider-polarising circuits on the MotoGP calendar. Built into the arid limestone plateau above Alcañiz in the Aragón region of northeast Spain, the circuit has a brutal, relentless character — wide, fast, and physically punishing, with almost no room for error and a tendency to produce spectacular, high-speed racing. The circuit sits in stark, dramatic landscape 80 km south of Zaragoza, Aragón\'s proud capital city on the Ebro river. Late August means fierce heat, passionate Spanish crowds, and a circuit that pushes both riders and machinery to their absolute limits.',
    why_city_text: 'Aragón is the least-visited of Spain\'s great regions — and that\'s precisely what makes it special. There are no tourist crowds, no inflated prices, and no performance of local culture for outsiders. Zaragoza is a proper Spanish city where locals live their lives — extraordinary tapas bars on El Tubo, the magnificent Basílica del Pilar reflected in the Ebro, and a nightlife scene that doesn\'t start until midnight. The circuit itself is a beast: wide, fast, and technically unforgiving. Late August is brutal heat — 35°C+ in the afternoons — but the racing is spectacular and the atmosphere in the grandstands is intensely Spanish.',
    highlights_list: [
      'MotorLand Aragón Circuit',
      'Zaragoza & El Tubo Tapas',
      'Basílica del Pilar',
      'Alcañiz Medieval Castle',
      'Aragonese Cuisine & Wine',
    ],
    city_guide: `## About Aragón & Alcañiz

Aragón is the autonomous community that stretches from the Pyrenees in the north to the Iberian highlands in the south, with the Ebro river running through its heart. It's one of Spain's least-visited regions — which is entirely unjust. Zaragoza, the regional capital, is a world-class Spanish city of 700,000 people. Alcañiz, the circuit town, is a beautiful medieval market town of 16,000 with a castle-parador and a historic Plaza Mayor that has been hosting race fans since 2009.

The circuit sits 3 km outside Alcañiz on a limestone plateau — the arid, ochre-coloured landscape feels almost Martian in August heat. It's a striking setting, quite unlike the lush European countryside of many other MotoGP venues.

## Zaragoza

Zaragoza (80 km north of the circuit) is the essential city base. The old town is anchored by two extraordinary monuments side by side: the **Basílica del Pilar** (one of Spain's great Baroque churches, with a magnificent riverside façade) and the **La Seo Cathedral** (a UNESCO-listed Gothic/Mudéjar masterpiece). The **Aljafería Palace** (Moorish fortress-palace, exceptional) and the **Pablo Gargallo Museum** round out the cultural circuit. But the real life of Zaragoza happens on the streets — specifically in **El Tubo**, the labyrinthine network of narrow lanes between the two cathedrals where dozens of tapas bars line every alley.

## El Tubo & Food

El Tubo is one of Spain's great tapas districts — narrow medieval lanes packed with bars, each with an enormous spread of pintxos (Basque-style) and traditional Aragonese tapas on the counter. Go between 1–3pm for lunch or 8–11pm for evening tapas. **Bar El Plata**, **Casa Lac** (oldest restaurant in Zaragoza), and the bars on Calle Estébanes are classics. Aragonese cuisine specialities: **ternasco de Aragón** (young roast lamb, IGP designation), **migas** (fried breadcrumb dish with chorizo and peppers), **borrajas** (a local green vegetable unique to Aragón), and **melocotones de Calanda** (PDO peaches from the Bajo Aragón, extraordinary in late summer). For wine, the **Cariñena** and **Campo de Borja** DOs produce powerful reds from Garnacha grape.

## Alcañiz

Alcañiz is worth more than a quick pass-through. The **Plaza Mayor** is one of the most beautiful main squares in Aragón — arcaded Gothic loggias, the Renaissance town hall, and the Collegiate Church. The **Castillo de los Calatravos** (medieval castle, now a Parador hotel) dominates the town from its hill and is spectacular at sunset. The town's connection to motorsport runs deep — MotorLand is the region's proudest modern achievement, and locals are genuinely warm and enthusiastic race weekend hosts.

## August Heat

Late August in the Bajo Aragón is genuinely hot — 35–40°C in afternoon sessions. This is not a circuit where you want to be exposed in the infield without shade. The main grandstands have roofs. Carry 2+ litres of water at all times, wear a hat, and apply SPF50. The heat also affects the racing — tyre management becomes critical in these conditions, which often produces strategic and dramatic MotoGP races.`,
    getting_there_intro: 'Zaragoza Airport (ZAZ) has direct flights from Madrid, Barcelona, and a handful of European cities. Zaragoza is on the high-speed AVE rail line between Madrid (1h 20min) and Barcelona (1h 30min) — both airports are excellent international gateways. A hire car for the 80 km drive from Zaragoza to the circuit is essential.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Madrid (MAD) or Barcelona (BCN)',
        desc: 'Both Madrid Barajas and Barcelona El Prat have worldwide connections and are 1h 20–30min from Zaragoza by AVE high-speed train. From Zaragoza, hire a car for the 80 km drive south to the circuit via the A-23 motorway (55 minutes). This is the most practical international routing.',
      },
      {
        icon: '🚂',
        title: 'AVE High-Speed Train to Zaragoza',
        desc: 'Zaragoza Delicias station is on the Madrid–Barcelona AVE corridor. Madrid Puerta de Atocha → Zaragoza in 1h 20min. Barcelona Sants → Zaragoza in 1h 30min. Multiple daily services. From Zaragoza, hire a car — no direct public transport to the circuit.',
      },
      {
        icon: '🚗',
        title: 'Drive via A-23 motorway',
        desc: 'From Zaragoza: A-23 south (Autovía Mudéjar) to Alcañiz, 80 km, 55 minutes. From Barcelona: AP-2/A-23, 200 km, 2h 15min. From Valencia: A-23 north, 230 km, 2h 30min. Circuit parking is extensive. On race Sunday, arrive before 9am — the A-23 exit and circuit approach roads queue from 10am.',
      },
      {
        icon: '🚌',
        title: 'Official Race Shuttles',
        desc: 'Race weekend shuttle buses run from Zaragoza (Delicias station and city centre) and Alcañiz town centre to the circuit. Check motorlandaragon.com for timetables. The shuttle from Zaragoza takes approximately 60 minutes and is the best option for those without a hire car.',
      },
    ],
    where_to_stay: `## Zaragoza City Centre

Zaragoza (80 km north) is the clear best base — proper city, excellent tapas, and great hotels. **Hotel Palafox** (5-star, classic Zaragoza luxury), **NH Collection Gran Hotel de Zaragoza** (grand historic building on Plaza Costa), **Ibis Zaragoza Romareda** (reliable budget option) are strong picks. Book 2–3 months ahead for race weekend.

## Alcañiz (Circuit Town)

Staying in Alcañiz puts you 3 km from the circuit. The **Parador de Alcañiz** (in the medieval castle — extraordinary, and pricey) is the standout. Several smaller hotels and hostales in the town centre are more affordable. Alcañiz accommodation fills completely for race weekend — book 4+ months ahead.

## Circuit Camping

MotorLand Aragón has camping directly adjacent to the circuit. Popular with Spanish fans and those driving from France and Catalonia. Book via motorlandaragon.com. August heat means early morning shade is important — bring shade canopies.

## Teruel or Caspe

**Teruel** (60 km southwest) is a beautiful UNESCO-listed Mudéjar architecture town with a handful of hotels. **Caspe** (40 km northwest) is smaller but close. Both are quieter and cheaper than Alcañiz or Zaragoza.`,
    travel_tips: [
      {
        heading: 'The heat is serious — prepare for 35–40°C',
        body: 'Late August in the Bajo Aragón is one of the hottest environments on the MotoGP calendar. Carry at minimum 2 litres of water, apply SPF50+ sunscreen repeatedly, wear a wide-brimmed hat, and take breaks in shaded areas. The afternoon sessions are the most intense — plan around them.',
      },
      {
        heading: 'El Tubo tapas experience is unmissable',
        body: 'El Tubo in Zaragoza is one of Spain\'s great tapas districts. Go for lunch (1–3pm) or evening tapas (8–11pm) — both sessions are excellent. Order pintxos from the counter, drink local Cariñena wine or Moritz beer, and move between bars every 20–30 minutes. This is how Aragonese people eat.',
      },
      {
        heading: 'Try ternasco — Aragón\'s great dish',
        body: 'Ternasco de Aragón (roast young lamb with IGP designation) is the signature dish of the region. It\'s served in virtually every restaurant in Zaragoza and Alcañiz. The lamb is extraordinary — mild, tender, and roasted with herbs. Order it if you see it on the menu.',
      },
      {
        heading: 'Visit the Basílica del Pilar at dusk',
        body: 'The Basílica del Pilar on the Ebro riverfront in Zaragoza is spectacular at any time but extraordinary at dusk — the riverside reflection and the evening light on the dome and towers is one of Spain\'s great views. The tower lifts are open until late evening in summer.',
      },
      {
        heading: 'Arrive at circuit before 9am on Sunday',
        body: 'The A-23 approach road and circuit parking fill rapidly from 9:30am on race Sunday. Arrive before 9am from any direction. The circuit gates open from 7:30am — early morning at the Aragón circuit in August is beautiful (still cool, clear light over the plateau) before the heat builds.',
      },
      {
        heading: 'Hire car is essential',
        body: 'There is no practical public transport between Zaragoza city and the circuit outside of official race shuttles. A hire car from Zaragoza airport or train station gives full flexibility for exploring Alcañiz and the surrounding Bajo Aragón landscape. Book in advance — Zaragoza hire car stock depletes for race weekend.',
      },
    ],
    circuit_facts: {
      Circuit: 'MotorLand Aragón',
      Lap: '5.078 km',
      Turns: '17',
      'First MotoGP': '2010',
      Capacity: '120,000',
      Location: 'Alcañiz, Aragón',
    },
    faq_items: [
      {
        question: 'How do I get from Zaragoza to MotorLand Aragón?',
        answer: 'By car: A-23 south (Autovía Mudéjar) to Alcañiz, 80 km, 55 minutes. By shuttle: race weekend buses from Zaragoza Delicias station and city centre, approximately 60 minutes. No regular public transport to the circuit — hire a car or use the official race shuttles.',
      },
      {
        question: 'What is the weather like at the Aragón MotoGP in late August?',
        answer: 'Extremely hot — typically 32–40°C in afternoon sessions. The Bajo Aragón plateau is one of the hottest areas of Spain in late summer. Carry plenty of water (2+ litres), wear SPF50+ sunscreen and a hat. Mornings are more bearable (25–28°C). Rain is very unlikely.',
      },
      {
        question: 'Which airport should I fly into for Aragón MotoGP?',
        answer: 'Madrid Barajas (MAD) or Barcelona El Prat (BCN) are the best options — both have worldwide connections and are 1h 20–30min from Zaragoza by AVE high-speed train. Zaragoza Airport (ZAZ) has limited connections but is the closest. From Zaragoza, hire a car for the 55-minute drive to the circuit.',
      },
      {
        question: 'Is Zaragoza worth visiting during race weekend?',
        answer: 'Absolutely. The Basílica del Pilar, La Seo Cathedral, and Aljafería Palace are extraordinary monuments. El Tubo tapas district is one of Spain\'s great food experiences. Zaragoza is an authentic Spanish city without tourist crowds — locals eat tapas until midnight, and the atmosphere on race weekend evenings is excellent.',
      },
      {
        question: 'What are the best grandstands at MotorLand Aragón?',
        answer: 'The main grandstand (Gran Tribuna) overlooks the start/finish straight and pit lane. The Turn 1 grandstand is excellent for the braking zone into the hairpin. General Admission gives access to the hillside terrace areas — arrive early as the best spots fill by 9am on race Sunday.',
      },
      {
        question: 'What local food should I try in Aragón?',
        answer: 'Ternasco de Aragón (roast young lamb — the regional speciality), migas (fried breadcrumbs with chorizo and peppers), borrajas (local green vegetable unique to Aragón), and melocotones de Calanda (PDO peaches, extraordinary in late August). For wine, Cariñena and Campo de Borja DOs produce excellent Garnacha reds.',
      },
    ],
    page_title: 'Grand Prix of Aragon 2026 — MotorLand Aragón MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Grand Prix of Aragon at MotorLand Aragón. Tickets, transport from Zaragoza, hotels, tapas, Basílica del Pilar, and Aragón travel tips.',
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
