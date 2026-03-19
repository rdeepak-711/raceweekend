/**
 * Patch Qatar MotoGP 2026:
 *  - Update: round=20, correct name, ticket URLs
 *  - Upsert race_content with full Lusail/Doha night race guide
 * Run: npx tsx scripts/patch-qatar-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'qatar-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Qatar Airways Grand Prix of Qatar',
    round: 20,
    official_tickets_url: 'https://tickets.motogp.com/en/21161-qatar/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-qatar',
  }).where(eq(races.slug, 'qatar-motogp-2026'));
  console.log('Updated qatar-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Lusail MotoGP Qatar Night Race Guide',
    hero_subtitle: 'Lusail International Circuit · Lusail, Qatar — Under the Floodlights',
    guide_intro: 'The Qatar Airways Grand Prix of Qatar at Lusail International Circuit is MotoGP\'s signature night race — the only round on the calendar where every prime-time session runs under the circuit\'s 3,600 floodlights, illuminating the track against the desert sky in one of the most spectacular spectacles in motorsport. The 5.380 km Lusail circuit, 20 km north of Doha, opened in 2004 and has hosted some of MotoGP\'s most dramatic and memorable races: Valentino Rossi vs Jorge Lorenzo battles, Dani Pedrosa\'s legendary victories, Fabio Quartararo\'s title-clinching moments. Racing under floodlights in Qatar\'s mild November air — 22–27°C, zero chance of rain, calm and dry — is genuinely unlike any other race weekend experience. Doha, meanwhile, has emerged as one of the Gulf\'s most sophisticated cities: the extraordinary National Museum of Qatar, the Souq Waqif bazaar, the Museum of Islamic Art, and a dining scene that punches well above its size.',
    why_city_text: 'Qatar at night is MotoGP cinema. The floodlit Lusail circuit against the desert darkness — 3,600 lights turning the track a brilliant white, motorcycles trailing phosphorescent lines through corners at 200+ km/h — is a spectacle that photographs cannot fully capture. Every prime session is held under the lights: Friday\'s Practice at 20:00, Saturday\'s Tissot Sprint at 20:00, Sunday\'s Grand Prix at 20:00 local time. Qatar\'s November climate is close to perfect for outdoor spectating — warm days, cool evenings, and essentially zero precipitation. Doha itself rewards exploration: the Museum of Islamic Art (one of the world\'s great museum buildings), the restored Souq Waqif, the West Bay skyline, and the extraordinary National Museum of Qatar make this a genuine cultural destination.',
    highlights_list: [
      'The Only MotoGP Night Race — Lusail Floodlit Circuit',
      'Museum of Islamic Art — I.M. Pei Masterpiece',
      'Souq Waqif — Restored Traditional Market',
      'National Museum of Qatar',
      'Perfect November Climate — Warm & Dry',
    ],
    city_guide: `## About Lusail International Circuit

Lusail International Circuit (opened 2004) sits 20 km north of Doha in the newly developed district of Lusail — Qatar's planned waterfront city, also home to Lusail Stadium (the 2022 FIFA World Cup final venue). The 5.380 km circuit is a flowing technical layout of 16 corners that combines high-speed sweepers with technical chicane sequences, making it demanding on both tyres and electronics. Qatar hosted the opening round of MotoGP from 2007 to 2014 — the iconic season-opener under lights. The floodlighting system is the defining characteristic: 3,600 individual lights on 76 towers illuminate the entire circuit to broadcast-quality daylight levels. All prime sessions — Friday Practice, Saturday Sprint, Sunday Grand Prix — run at 20:00 local time. The November evening air temperature is typically 22–25°C — comfortable for spectating, but notably cooler than the 45°C summer heat that would make the same venue unbearable in July.

## Doha

Doha has transformed dramatically since the 2022 FIFA World Cup infrastructure investment — from a largely utilitarian Gulf business city to one of the region's most sophisticated and visitor-ready capitals. The city's identity is anchored by four world-class cultural institutions: the **Museum of Islamic Art** (MIA — 2008, designed by I.M. Pei, the 77-year-old architect's final major commission, sitting on an artificial peninsula in the Bay of Doha — the exterior is one of the great contemporary museum buildings), the **National Museum of Qatar** (NMoQ — 2019, Jean Nouvel — designed to resemble a desert rose crystal formation, spectacular), the **Mathaf: Arab Museum of Modern Art**, and the recently opened **Qatar National Library** (Rem Koolhaas). These alone justify 2–3 days in Doha.

## Souq Waqif

The **Souq Waqif** (Doha's central traditional market, carefully restored to its pre-1950s vernacular architecture in 2006–2010) is the most atmospheric public space in Qatar — a labyrinth of mud-rendered alleyways, traditional shops, restaurants, and cafés. **Falcon souq** (one of the world's largest — falconry is Qatar's national sport and passion), **spice stalls**, **art galleries**, and dozens of excellent restaurants serving Qatari, Levantine, and South Asian food. The Souq comes alive after sunset — visit around 20:00 on a non-race evening for the full atmosphere. The adjacent **Al Bayt Tower** (hotels, residences) overlooks the Souq from the west bay.

## Qatari Culture & Etiquette

Qatar is a Muslim country with a conservative social framework, though it is highly experienced with international tourism and sporting events after the 2022 World Cup. **Alcohol** is available at licensed hotel bars and restaurants — not in public or unlicensed venues. **Dress code**: modest dress in public spaces (cover shoulders and knees away from hotel pools), though the circuit itself is relaxed during race weekend. The **call to prayer** occurs five times daily; activities generally continue during prayer times in tourist areas. Qatari nationals (about 15% of the population — Qatar has a very large expatriate workforce) are welcoming to respectful visitors. Tipping is not expected but appreciated (10–15% in restaurants).

## Katara Cultural Village

**Katara Cultural Village** (3 km north of central Doha, directly on the bay) is an open-air arts and culture complex — an amphitheatre, galleries, restaurants, and a stunning traditional Qatari architecture ensemble. The **Katara beach** and beachside restaurants are excellent in November's mild weather. The complex hosts regular events, outdoor cinema, and cultural exhibitions — check the programme for race weekend.

## West Bay & The Pearl

**West Bay** — Doha's gleaming skyline district of towers and luxury hotels — is the city's financial and hospitality centre. The **Corniche promenade** (7 km along the bay, connecting West Bay to the Museum of Islamic Art) is Doha's best free activity: a coastal walk with views of the dhow harbour, the city skyline, and on clear days the distinctive NMoQ building. **The Pearl-Qatar** (an artificial island with marina and luxury residences) has upscale restaurants, cafés, and the most expensive square metre of land in Qatar.`,
    getting_there_intro: 'Hamad International Airport (DOH) in Doha is one of the world\'s best-connected hub airports — direct flights from virtually every major city on earth via Qatar Airways. The circuit is 30 km north of the airport (35–45 minutes by hire car or taxi). Race weekend shuttles run from designated Doha city points to Lusail Circuit.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Doha (DOH) — Qatar Airways hub',
        desc: 'Hamad International Airport (DOH) is one of the world\'s great hub airports — direct Qatar Airways connections from London Heathrow (7h), Manchester (7h), New York (13h), Los Angeles (17h), Sydney (14h), Melbourne (14h), Singapore (7h), Tokyo (11h), and virtually every other major city. Consistently rated one of the world\'s best airports. DOH is 30 km south of the circuit — 35–45 minutes by hire car or taxi on approach roads that are traffic-managed on race weekend.',
      },
      {
        icon: '🚗',
        title: 'Hire car or taxi from Doha to Lusail',
        desc: 'From central Doha (West Bay): north on Al Corniche Street / Lusail Expressway to the circuit — 20–25 km, 25–35 minutes without traffic. From DOH airport: north via Salwa Road and the Lusail Expressway — 30 km, 35–45 minutes. Karwa taxis (official, metered), Uber, and hire cars are all available. For race Sunday evening (20:00 race start), depart Doha no later than 18:00 — approach roads fill from 17:30.',
      },
      {
        icon: '🚇',
        title: 'Doha Metro to Lusail — Qatar Rail',
        desc: 'The Doha Metro Gold Line runs from the airport and central Doha stations north toward Lusail — check Qatar Rail (qr.com.qa) for current station coverage to the Lusail area. Race weekend may have enhanced shuttle connections from the nearest metro station to circuit gates. The metro is fast, clean, and air-conditioned — the Gold Class carriage is worth the small premium for a relaxed journey.',
      },
      {
        icon: '🚌',
        title: 'Official race weekend shuttles',
        desc: 'Lusail Circuit operates official shuttle buses from designated Doha city points (West Bay, Souq Waqif area, and the airport) on race weekend. Given the late evening race times (Grand Prix at 20:00), shuttle return services run until well after midnight. Check MotoGP.com and the circuit\'s official channels for shuttle booking and pickup points closer to the event.',
      },
    ],
    where_to_stay: `## West Bay (Recommended — Doha\'s Hotel District)

West Bay is Doha's luxury hotel centre — towers rising from the bay with extraordinary views. **Four Seasons Hotel Doha** (on the bay, the grandest address in Doha), **St. Regis Doha** (West Bay — landmark building, exceptional), **W Doha** (bold design hotel, rooftop pool and bar with bay views), **Hilton Doha The Pearl** (Pearl-Qatar island, excellent marina location), **InterContinental Doha** (West Bay, business hotel with large pool complex). November is shoulder season for Doha — prices are lower than peak (Dec–Feb) but comfort is perfect. Book 2–3 months ahead for race weekend.

## Souq Waqif Area

Staying near Souq Waqif puts you in the most atmospheric part of old Doha. **Souq Waqif Boutique Hotels** (a cluster of boutique properties within the Souq itself — traditional architecture, authentic location, the best address in Doha for cultural immersion), **Marriott Marquis City Center Doha** (adjacent to City Center mall), and several mid-range hotels. Easy Corniche walk to the MIA.

## The Pearl-Qatar (Luxury)

An artificial island development 5 km north of West Bay — marinas, luxury apartments, and hotel residences. **Hilton Doha The Pearl** and **Al Messila Luxury Collection** are exceptional. Quieter than West Bay but closer to the circuit (15 km).

## Near the Circuit (Lusail)

Lusail has new hotels in the development district — **Lusail Hotel** and several serviced apartment complexes. The most circuit-proximate option (10–15 minutes) but the area is still developing and lacks Doha's city atmosphere. Practical for those doing a short race-only trip.`,
    travel_tips: [
      {
        heading: 'Every prime session is under the lights at 20:00 — plan your evenings',
        body: 'Qatar\'s entire race weekend runs on a night race schedule: Friday Practice at 20:00–21:00, Saturday Tissot Sprint at 20:00, Sunday Grand Prix at 20:00. This means your mornings and early afternoons are free — perfect for Doha sightseeing. The circuit atmosphere builds from around 17:00 as the sun sets over the desert and the floodlights warm up. Plan to be in your grandstand seat by 19:30 for the Grand Prix to watch the full light-up of the circuit.',
      },
      {
        heading: 'November in Qatar is perfect — 22–27°C evenings',
        body: 'November is Qatar\'s best month for outdoor events: daytime 28–32°C, evenings 22–25°C, zero chance of rain, and the brutal summer humidity has completely passed. Bring a light jacket for the grandstands after midnight — the temperature drops noticeably as the night progresses. No sunscreen needed for evening sessions but essential if exploring Doha during the day.',
      },
      {
        heading: 'The Museum of Islamic Art is one of the world\'s great buildings',
        body: 'I.M. Pei\'s **Museum of Islamic Art** (2008) — sitting on its own artificial peninsula in the Bay of Doha, 5 minutes from the Souq Waqif — is one of the finest museum buildings constructed in the 21st century. The exterior geometry, derived from 9th-century Islamic architecture in Cairo and Fez, is extraordinary at any time of day but transcendent at the golden hour before sunset. The collection of 1,400 years of Islamic art across three floors is world-class. Admission is free. Go Thursday or Friday morning before the sessions.',
      },
      {
        heading: 'Alcohol: hotel bars only — no public drinking',
        body: 'Alcohol is available at licensed hotel bars and restaurants throughout Doha\'s 5-star hotel belt — Qatar introduced more flexible licensing ahead of the 2022 World Cup. Beer, wine, and spirits are served normally in hotel venues. On the circuit, alcohol may be available in specific hospitality areas — check the race-specific information. No alcohol in public spaces, souqs, or unlicensed restaurants. Budget options in the city are generally dry.',
      },
      {
        heading: 'Visit Souq Waqif on a non-race evening',
        body: 'Souq Waqif is best experienced after 20:00 on a non-race evening (Thursday works perfectly — race sessions don\'t start until Friday afternoon). The souq comes alive at night: the falcon stalls, spice shops, shisha cafés, and excellent restaurants are all at their best in the cooler evening air. Try **Al Shami Home Restaurant** for Syrian mezze or any of the Qatari restaurants for machboos (spiced rice with lamb or chicken — the national dish) and luqaimat (sweet fried dumplings with date syrup).',
      },
      {
        heading: 'Dress modestly outside the circuit and hotel zone',
        body: 'Qatar is welcoming to international visitors but is a Muslim country with social expectations outside the tourist zone. Cover shoulders and knees in the souq, museums, and general public spaces. The circuit itself is fully relaxed during race weekend — normal race fan attire is fine. Hotel pools and beach clubs operate with international standards. Respectful awareness of local culture is appreciated and reciprocated with extraordinary hospitality.',
      },
    ],
    circuit_facts: {
      Circuit: 'Lusail International Circuit',
      Lap: '5.380 km',
      Turns: '16',
      'First MotoGP': '2004',
      Capacity: '53,000',
      Location: 'Lusail, Qatar',
    },
    faq_items: [
      {
        question: 'What time does the MotoGP race start at Qatar?',
        answer: 'The MotoGP Grand Prix at Lusail starts at 20:00 AST (Qatar local time) — a night race under the circuit\'s 3,600 floodlights. All prime sessions follow this pattern: Friday MotoGP Practice at 20:00, Saturday Tissot Sprint at 20:00, Sunday Grand Prix at 20:00. Morning and early afternoon sessions (FP1, FP2, qualifying) run from approximately 13:30–16:30 in natural light.',
      },
      {
        question: 'How do I get from Doha to Lusail International Circuit?',
        answer: 'By hire car or taxi: 20–25 km north of West Bay via the Lusail Expressway — 25–35 minutes without traffic. Depart by 18:00 for a 20:00 race. By official shuttle: buses from West Bay, Souq Waqif, and the airport on race weekend — check circuit official channels for bookings. By Doha Metro: Gold Line north toward Lusail — check Qatar Rail for current coverage and race weekend enhanced services.',
      },
      {
        question: 'What is the weather like at Qatar MotoGP in November?',
        answer: 'Near-perfect: 28–32°C during the day, 22–25°C in the evenings when the races run. No rain (Qatar averages less than 5mm in November). Low humidity compared to summer. A light jacket is useful for late-night grandstand sessions as temperatures drop toward midnight. November is Qatar\'s best month for outdoor events — the brutal summer heat is completely gone.',
      },
      {
        question: 'Which airport serves the Qatar MotoGP?',
        answer: 'Hamad International Airport (DOH) in Doha — one of the world\'s busiest hub airports, the home of Qatar Airways. Direct connections from virtually every major city on earth. The airport itself is worth arriving early for: the giant yellow Lamp Bear sculpture, the excellent terminal shopping and dining, and the Oryx Airport Hotel for long layovers. DOH is 30 km south of the circuit — 35–45 minutes by hire car.',
      },
      {
        question: 'Is alcohol available at the Qatar MotoGP?',
        answer: 'Alcohol is available in licensed hotel bars and restaurants throughout Doha\'s hotel district (West Bay, The Pearl, Souq Waqif area hotels). At the circuit, availability depends on the specific event licence — check the official race website for Qatar 2026. No alcohol is available in public spaces, the souq, or unlicensed venues. Qatar significantly expanded its licensed hospitality offer after the 2022 World Cup.',
      },
      {
        question: 'What Qatari food should I try in Doha?',
        answer: 'Machboos (slow-cooked spiced rice with lamb, chicken, or fish — Qatar\'s national dish), harees (slow-cooked wheat and meat porridge, rich and comforting), luqaimat (fried dumplings with date syrup and sesame), and fresh Qatari dates. In Souq Waqif: mezze at Lebanese and Syrian restaurants, grilled lamb, and Arabic coffee (cardamom-spiced, served with dates). For late-night food after the race: the Souq Waqif restaurants stay open past midnight.',
      },
    ],
    page_title: 'Qatar Airways Grand Prix of Qatar 2026 — Lusail MotoGP Night Race Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Qatar Airways Grand Prix of Qatar at Lusail International Circuit. Night race under floodlights, tickets, transport from Doha, hotels, and Qatar travel tips.',
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
