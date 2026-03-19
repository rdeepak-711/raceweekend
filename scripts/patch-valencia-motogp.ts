/**
 * Patch Valencia MotoGP 2026:
 *  - Update: round=22, race_date=2026-11-29, correct name, ticket URLs
 *  - Upsert race_content with full Circuit Ricardo Tormo/Valencia season finale guide
 * Run: npx tsx scripts/patch-valencia-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'valencia-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Motul Grand Prix of Valencia',
    round: 22,
    official_tickets_url: 'https://tickets.motogp.com/en/21151-valencia/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-valencia',
  }).where(eq(races.slug, 'valencia-motogp-2026'));
  console.log('Updated valencia-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Valencia MotoGP Season Finale Guide',
    hero_subtitle: 'Circuit Ricardo Tormo · Cheste, Valencia, Spain — The Final Round',
    guide_intro: 'Circuit Ricardo Tormo in Cheste, 27 km west of Valencia city, is where the MotoGP World Championship ends every year — the traditional season finale and one of the most emotionally charged events in motorsport. World championships are decided here, careers conclude here, and the paddock\'s end-of-season farewells happen on this pit lane. The 4.005 km circuit is compact, technical, and famously unforgiving of tyre management errors: tight hairpins, slow chicanes, and a long main straight combine to punish rear tyre wear. November in Valencia is mild and often sunny — 16–20°C, one of the best climates in Europe at this time of year. Valencia city itself is one of Spain\'s most underrated urban destinations: the City of Arts and Sciences, the old town, the Mercado Central, the birthplace of paella, and a nightlife culture that makes Barcelona look reserved.',
    why_city_text: 'Valencia is where the MotoGP season ends, and the emotion of a season finale is like no other race weekend. World Champions are crowned or denied here — the final lap of the Valencia Grand Prix has decided championships more times than any other circuit. Riders retire. Teams disband. Champions celebrate. The paddock atmosphere on Sunday evening — champagne, tears, fireworks — is the emotional peak of the entire year. And Valencia city makes it extraordinary: the extraordinary Calatrava architecture of the City of Arts and Sciences, the enormous Mercado Central (one of the world\'s great covered food markets), the orange trees lining every street, and a food culture that centres on the rice and seafood traditions that gave the world paella. The Valencia GP is not just a race — it is the climax of the season, and being there for it is one of sport\'s great experiences.',
    highlights_list: [
      'Season Finale — World Championship Decider',
      'City of Arts and Sciences — Calatrava Masterpiece',
      'Mercado Central & Valencian Food',
      'Birthplace of Paella — La Albufera Rice Fields',
      'November Sun & the Spanish Old City',
    ],
    city_guide: `## About Circuit Ricardo Tormo

Circuit Ricardo Tormo (opened 1999, named in honour of the Valencian MotoGP champion who died of cancer in 1998 at age 37) sits in Cheste, a small municipality 27 km west of Valencia in the agricultural interior of the Valencian Community. The 4.005 km circuit has 14 corners — predominantly slow to medium-speed hairpins and chicanes with a single long main straight. This layout punishes tyre management above all else: rear tyres wear heavily through the tight corners, and race strategy hinges on managing that wear over 27 laps. Overtaking is possible at the end of the main straight (Turn 1) and at the tight right-hander after the back section. The circuit was the traditional MotoGP season finale from 1999 to 2012 and again from 2015 onwards — the **Comunitat Valenciana Grand Prix** that closes every season. The final podium of the year, sprayed with champagne as fireworks explode over the grandstands, is one of the most celebrated images in motorsport.

## Valencia City

Valencia (population 800,000 — Spain's third-largest city) is genuinely one of Europe's most underrated city destinations. It lacks Barcelona's fame and Madrid's scale, but combines a magnificent historic centre, world-class food culture, extraordinary modern architecture, and a coastal lifestyle that feels more authentic than either. The **Old Town** (Barrio del Carmen — Gothic, Baroque, and Modernista architecture in a compact, walkable area) is centred on the **Plaza de la Virgen** and **Plaza de la Reina**, overlooked by the **Valencia Cathedral** (a Gothic masterpiece claimed to house the Holy Grail in its Borgian chapel — whether you believe this is irrelevant; the chapel is extraordinary). The **Silk Exchange** (La Lonja de la Seda — 1492, UNESCO World Heritage) is one of the finest examples of late-Gothic civic architecture in Europe.

## City of Arts and Sciences

The **Ciudad de las Artes y las Ciencias** — Valencia's defining contemporary landmark — was designed by Santiago Calatrava (born in Valencia) and Félix Candela, built between 1996 and 2005 on the drained bed of the old Turia river. The complex contains: the **Hemisfèric** (IMAX and planetarium, shaped like a giant human eye), the **Museo de las Ciencias Príncipe Felipe** (science museum, a skeletal white structure), the **Oceanogràfic** (Europe's largest aquarium — extraordinary, particularly the Open Ocean tank with whale sharks), the **Palau de les Arts Reina Sofía** (opera house — one of the most spectacular opera buildings in the world), and the **Ágora** (multi-purpose pavilion). At night, reflected in the surrounding pools, the complex is one of the most visually extraordinary pieces of 21st-century architecture in Europe. Admission to the grounds is free; individual buildings charge entry.

## Mercado Central & Valencian Food

The **Mercado Central** (1928 — a Modernista market building with azulejo-tiled domes, one of the largest covered food markets in Europe) is the heart of Valencian food culture. 1,200 stalls selling **naranjas** (Valencia's famous oranges — in season in November, directly from the trees), **horchata** (tiger nut milk — a Valencian institution, drunk cold with fartons, light pastry sticks), local cheeses, jamón, fresh seafood from the Mediterranean, and the infinite variety of **arròs** (rice — the foundation of Valencian cuisine). Market opens 7:30am–15:00 Monday–Saturday.

**Paella** was born in Valencia — specifically in the rice paddies of **La Albufera** (a coastal lagoon 10 km south of the city, where the rice is still grown). Authentic Valencian paella uses chicken, rabbit, runner beans, and butter beans (not seafood — that is a separate dish: paella de mariscos, which Valencia also makes excellently but considers a different thing). The best paella in Valencia: Las Arenas beach area restaurants (Platja de la Malva-rosa), El Palmar village on La Albufera lagoon, and the Mercado Central's rice bars.

## Barrio del Carmen & Nightlife

Valencia's old town **Barrio del Carmen** is one of Spain's most atmospheric urban neighbourhoods — medieval streets, Modernista buildings, independent bars, and a nightlife culture that starts late and ends very late. Bars open around 21:00, dinner at 21:30–22:00, clubs from 01:00. The **Mercado de Colón** (1916 — a Modernista market building converted into a food hall and bar) is the ideal starting point for a Thursday evening. Valencia's nightlife is anchored around the Barrio del Carmen and the cluster of clubs in the Calle del Caballero Boesch area. The city shuts down much later than Madrid — on race weekend, Saturday night after qualifying runs until dawn.`,
    getting_there_intro: 'Valencia Airport (VLC) is 10 km from the city centre with direct connections from London, Amsterdam, Paris, Frankfurt, and most European capitals. The circuit is 27 km from the city — 25 minutes by hire car via the A-3 motorway. Race weekend shuttles run from Valencia city centre and the Metrovalencia metro system to Cheste.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Valencia (VLC) — 10 km from city',
        desc: 'Valencia Airport (VLC) is compact, efficient, and well-connected: direct flights from London Gatwick and Stansted (easyJet, Ryanair), Amsterdam (Vueling, KLM), Paris, Frankfurt, Brussels, and most major European cities. From VLC to the city centre: Metrovalencia Line 3 (Aeroport station → Xàtiva, 20 minutes, €5). From VLC to the circuit: hire car via A-3 motorway, 27 km, 25 minutes.',
      },
      {
        icon: '🚇',
        title: 'Metrovalencia + race weekend shuttle',
        desc: 'Metrovalencia Line 1 runs from Valencia city centre to Quart de Poblet (end of the western suburban line), from where race weekend shuttle buses cover the final 5 km to the circuit. Full metro map at metrovalencia.es. The metro + shuttle combination avoids circuit parking congestion entirely and is the recommended option for those staying in central Valencia. Race day: depart central Valencia by 11:30 for a 14:00 race.',
      },
      {
        icon: '🚗',
        title: 'Hire car — A-3 motorway to Cheste',
        desc: 'From Valencia city centre: A-3 motorway west toward Madrid, exit 333 (Cheste/Circuit) — 27 km, 25 minutes without traffic. On race Sunday, approach roads are traffic-managed from 11:00 — arrive by 11:30 or use the metro+shuttle. Circuit parking is extensive. From Madrid: A-3 east from Madrid, 360 km, approximately 3h 30min — a long drive but feasible as a same-day trip for Spanish motorsport fans.',
      },
      {
        icon: '🚂',
        title: 'High-speed train to Valencia (AVE)',
        desc: 'Valencia Joaquín Sorolla high-speed station (separate from the main Estació del Nord) is connected to Madrid (1h 40min, Renfe AVE — one of Europe\'s great rail journeys), Barcelona (3h 10min, Renfe Euromed), Seville (3h 30min), and Malaga (3h). For international visitors: Iberia and Vueling fly Madrid–Valencia (1h) but the AVE train from Madrid is faster door-to-door. From the station, metro or taxi to the city.',
      },
    ],
    where_to_stay: `## Valencia Old Town / Barrio del Carmen (Best Base)

The most atmospheric base — walking distance to the Mercado Central, City of Arts and Sciences, and Valencia Cathedral. **The Westin Valencia** (Grand Via, elegant 5-star), **Hotel Caro** (boutique, within the Roman walls of the old city — the most extraordinary hotel in Valencia, built into a 15th-century palace on top of a Roman aqueduct), **Vincci Lys** (old town, excellent value), **Barceló Valencia** (modern, riverside, walking distance to everything), and **Hotel One Shot Palacio Reina Victoria** (historic Gran Vía building, converted boutique). November is low season — rates are significantly lower than summer.

## Ruzafa / Gran Vía (Trendy Neighbourhood)

**Ruzafa** is Valencia's creative neighbourhood — independent restaurants, coffee shops, galleries, and boutique hotels. **Hostal Venecia** (Ruzafa, boutique), **The Garden** (apartment hotel). 10–15 minutes walk to the old town, excellent food and bar scene.

## Near the Circuit (Cheste)

Cheste has limited accommodation — primarily apartments and small guesthouses. The circuit has no adjacent hotel. Most fans commute from Valencia city (27 km) or stay in Cheste/La Eliana for proximity. **Hotel Regio** (La Eliana, 15 km from circuit) and **various rural houses** (casas rurales) in the Valencian interior offer quiet alternatives.

## Beach / Marina Real (Modern)

The **Valencia Marina** and **Malva-rosa beach** area has modern hotels overlooking the Mediterranean. **Melia Valencia** (marina area), **Las Arenas Balneario Resort** (historic beach hotel directly on the sand). 30 km from the circuit — add 20 minutes to travel time but outstanding setting and the best paella restaurants in Valencia.`,
    travel_tips: [
      {
        heading: 'This is the season finale — stay for the podium ceremony',
        body: 'The Valencia Grand Prix is not just another race — it is the final round of the MotoGP World Championship. Whether a title is decided or a champion is crowned, the post-race podium ceremony has fireworks, champagne, and a paddock full of raw emotion. Champions may be announced. Riders may retire. The entire paddock celebrates the end of the season. Stay in your seat after the chequered flag — the atmosphere on the Valencia podium at the end of the season is one of motorsport\'s defining moments.',
      },
      {
        heading: 'Eat paella at La Albufera — the birthplace of the dish',
        body: 'The rice paddies of **La Albufera** (10 km south of Valencia city, a coastal lagoon ringed by rice fields) are where paella was invented. The village of **El Palmar** on the lagoon edge has a string of traditional restaurants serving authentic Valencian paella cooked over orange-wood fires in the classic wide pan: chicken, rabbit, runner beans, and butter beans. Book for Saturday lunch. This is the real thing — not the tourist seafood paella that Valencia\'s old town restaurants often serve to visitors. The boat trip on the lagoon before or after lunch is excellent.',
      },
      {
        heading: 'Hotel Caro is the best hotel in Valencia — book early',
        body: '**Hotel Caro** (Calle del Almirall, old town) is built inside a 15th-century Gothic palace, on top of a Roman aqueduct (visible in the basement), next to a section of the original 12th-century Moorish city wall. The 26 rooms are extraordinary — each different, all immaculate. The rooftop bar has the best views of the old city. It books out 4–6 months ahead. For the Valencia race weekend, this is the place to stay if you can get it.',
      },
      {
        heading: 'Circuit Ricardo Tormo is small — the atmosphere is intense',
        body: 'At 4.005 km, Circuit Ricardo Tormo is one of the shorter tracks on the MotoGP calendar, which means 65,000 fans are packed into a relatively tight space. The **main grandstand** faces the start-finish straight and the tight Turn 1 hairpin — the primary overtaking point. **Grandstand F** (back of the circuit) is slightly more remote but quieter and offers longer sightlines. Buy the circuit map and identify Turn 1 and the back straight hairpin — both are where race-defining moves happen.',
      },
      {
        heading: 'November in Valencia — 18–22°C and often sunny',
        body: 'Late November in Valencia is genuine Mediterranean mild — typically 18–22°C during the day, 10–14°C in the evening. The rain is possible (November is Valencia\'s wettest month) but the famous Valencian sun still appears most days. Bring a warm jacket for the grandstands in the afternoon — the sun drops early in late November and the temperature falls quickly after 16:00. The orange trees throughout the city are in full fruit.',
      },
      {
        heading: 'Try horchata and fartons at the Horchatería de Santa Catalina',
        body: '**Horchata de chufa** (tiger nut milk — white, sweet, cold, and uniquely Valencian) drunk with **fartons** (light, elongated pastry sticks for dipping) is the Valencian institution that locals drink at any time of day. The **Horchatería de Santa Catalina** (Plaza Santa Catalina, steps from the Cathedral — opened 1836) is the most famous in the city. Go at breakfast or mid-afternoon between race sessions on Friday or Saturday. It is one of the great food-culture experiences of the Iberian Peninsula.',
      },
    ],
    circuit_facts: {
      Circuit: 'Circuit Ricardo Tormo',
      Lap: '4.005 km',
      Turns: '14',
      'First MotoGP': '1999',
      Capacity: '65,000',
      Location: 'Cheste, Valencia',
    },
    faq_items: [
      {
        question: 'How do I get from Valencia city to Circuit Ricardo Tormo?',
        answer: 'By hire car: A-3 motorway west from Valencia to exit 333 (Cheste/Circuit) — 27 km, 25 minutes. By metro + shuttle: Metrovalencia Line 1 west to Quart de Poblet, then race weekend shuttle bus to circuit (5 km). The metro+shuttle is the recommended option for race Sunday — avoids all parking congestion. Depart central Valencia by 11:30 for a 14:00 race.',
      },
      {
        question: 'What is the weather like at Valencia MotoGP in November?',
        answer: 'Mild and often sunny — Valencia\'s Mediterranean climate means late November averages 18–22°C during the day and 10–14°C in the evenings. Rain is possible (November is Valencia\'s wettest month) but the Valencian sun is resilient. Bring a warm jacket for the grandstands after 16:00 when the temperature drops quickly. The orange trees throughout the city are in full fruit in November.',
      },
      {
        question: 'Which airport is best for the Valencia MotoGP?',
        answer: 'Valencia Airport (VLC) — 10 km from the city centre, direct Metrovalencia connection (Line 3, 20 minutes), and direct flights from most European capitals. For long-haul visitors: fly into Madrid Barajas (MAD) and take the AVE high-speed train to Valencia (1h 40min) — the combination of Madrid and Valencia makes an exceptional race trip. Fly into Barcelona and take the Euromed train (3h 10min) as an alternative.',
      },
      {
        question: 'Is the Valencia GP really the MotoGP season finale?',
        answer: 'Yes — Circuit Ricardo Tormo in Valencia is the traditional final round of the MotoGP World Championship and has been the season finale for most years since 1999. World titles are frequently decided at Valencia, and the post-race podium ceremony — the last of the year — is celebrated with particular intensity: fireworks, full team celebrations, farewell speeches, and the emotional weight of a season concluding. If you attend one MotoGP race in your life and want the full experience, Valencia is the choice.',
      },
      {
        question: 'What is the best thing to do in Valencia beyond the race?',
        answer: 'The City of Arts and Sciences (Calatrava architecture — Oceanogràfic, Hemisfèric, Palau de les Arts), the Mercado Central (1928 Modernista food market), the old town Barrio del Carmen (Valencia Cathedral, La Lonja UNESCO building), and La Albufera lagoon for paella at El Palmar village (the actual birthplace of the dish). Valencia has horchata (tiger nut milk with fartons at Horchatería de Santa Catalina) as a uniquely local experience. Allow 2 full days in the city.',
      },
      {
        question: 'What Valencian food should I eat at the season finale?',
        answer: 'Authentic Valencian paella — chicken, rabbit, runner beans, butter beans, cooked over orange wood (not seafood paella — that is a different dish). Try it at El Palmar village on La Albufera lagoon on Saturday. Horchata de chufa (tiger nut milk, cold, drunk with fartons) at Horchatería de Santa Catalina. Fideuà (paella-style noodle dish with seafood). All i pebre (eel and potato stew from La Albufera — an acquired taste but deeply traditional). Agua de Valencia (orange juice, cava, vodka, gin — Valencia\'s lethal cocktail, invented in 1959 at Café Madrid).',
      },
    ],
    page_title: 'Motul Grand Prix of Valencia 2026 — Circuit Ricardo Tormo MotoGP Season Finale Guide',
    page_description: 'Complete guide to the 2026 MotoGP season finale — Motul Grand Prix of Valencia at Circuit Ricardo Tormo. Tickets, transport, hotels, paella at La Albufera, City of Arts and Sciences, and Valencia travel tips.',
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
