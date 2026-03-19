/**
 * Patch Japan MotoGP 2026:
 *  - Update: round=16, correct name, ticket URLs
 *  - Upsert race_content with full Motegi/Tokyo guide
 * Run: npx tsx scripts/patch-japan-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'japan-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Motul Grand Prix of Japan',
    round: 16,
    official_tickets_url: 'https://tickets.motogp.com/en/21131-japan/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-japan',
  }).where(eq(races.slug, 'japan-motogp-2026'));
  console.log('Updated japan-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Motegi MotoGP Japan Guide',
    hero_subtitle: 'Mobility Resort Motegi · Tochigi, Japan',
    guide_intro: 'Mobility Resort Motegi — originally Twin Ring Motegi, built by Honda in 1997 in the forests of Tochigi Prefecture — is one of MotoGP\'s most technically demanding circuits. The 4.801 km teardrop layout combines a series of high-speed flowing corners with a brutal hairpin sequence and the famous V-Corner, a long, slow right-hander that defines race strategy. The Japanese GP at Motegi is always a deeply emotional round: Honda\'s home circuit, Japanese fans who are among the most passionate and respectful on the calendar, and October in Kanto — golden foliage starting on the surrounding hills. Tokyo, just 130 km south, is one of the world\'s great cities and the obvious base for the trip.',
    why_city_text: 'The Japanese GP at Motegi carries a unique emotional weight — this is Honda\'s home race, on a circuit they built and own, with the world\'s most devoted motorsport fans watching in near-silence. Japanese race fans are a phenomenon: obsessive in their knowledge, immaculate in their dress, and utterly respectful of the sport and their fellow spectators. The atmosphere is unlike anywhere else on the calendar. Then there\'s Tokyo — 130 km south, two hours by train. No city combines extreme modernity, ancient tradition, and world-class food culture quite like Tokyo. Spending the days around the race in Japan is one of the great motorsport travel experiences.',
    highlights_list: [
      'Honda\'s Home Circuit — V-Corner & Hairpins',
      'Tokyo — World\'s Greatest City',
      'Japanese Race Fan Culture',
      'October Autumn Foliage (Kōyō)',
      'Japanese Food — Ramen, Sushi, Yakitori',
    ],
    city_guide: `## About Mobility Resort Motegi

Mobility Resort Motegi (opened 1997, renamed 2022) sits in Motegi-machi, Tochigi Prefecture — a forested, hilly landscape about 130 km north of Tokyo and 100 km northeast of Tokyo. The circuit was built by Honda as their flagship motorsport facility and remains Honda-owned and operated. The teardrop layout is deliberately challenging — a long back straight, the sweeping **V-Corner** (a defining long right-hander that eats tyres), and the **Hairpin** where braking distances are brutal. At 4.801 km with 14 turns, Motegi produces technical, tyre-management races. October at Motegi means the first hints of **kōyō** (autumn foliage) on the surrounding hillsides — one of the most beautiful settings on the calendar.

## Tokyo

Tokyo needs no introduction, but it consistently surprises — even those who\'ve visited before. It is simultaneously the world\'s largest city (37 million in the greater metropolitan area) and one of its most orderly, cleanest, and safest. For race weekend, Tokyo is 130 km south — roughly 2 hours on the Shinkansen/JR to Utsunomiya, then hire car/bus to the circuit. The city divides naturally into districts: **Shinjuku** (neon, department stores, Golden Gai), **Shibuya** (crossing, youth culture, the scramble), **Harajuku & Omotesandō** (fashion, Meiji Shrine, the tree-lined boulevard), **Asakusa** (Senso-ji temple, old Tokyo atmosphere), **Ginza** (luxury, sushi counters, galleries), and **Akihabara** (electronics, anime culture). Each is distinct. Spend at least a day in Tokyo before or after the race.

## Japanese Food Culture

Japan has more Michelin-starred restaurants than any other country on earth, and the food culture extends far beyond the famous sushi counters. **Ramen** (regional variations: Tokyo shoyu, Hakata tonkotsu, Sapporo miso — all distinct), **yakitori** (grilled chicken skewers at tiny smoky counters under railway arches), **tempura** (fried in groundnut oil with light dashi dipping sauce), **izakaya** (Japanese pub-restaurant — order multiple small dishes and drink beer or sake), **katsu curry** (breaded pork cutlet with Japanese curry — the nation\'s comfort food), and the extraordinary **sushi** tradition (from conveyor belt kaiten-zushi to world-class omakase). At Motegi itself, the circuit food village showcases Japanese regional specialities — including **Tochigi gyoza** and **nikumaki onigiri** (rice balls wrapped in pork).

## Motegi Town & Tochigi

Motegi-machi is a small rural town — the circuit is the main attraction. The surrounding Tochigi Prefecture is famous for **Nikkō** (UNESCO-listed mountain shrine complex, 60 km west of the circuit — extraordinary Edo-period architecture in forested mountains), **Ashikaga Flower Park** (wisteria, roses, illumination), and the **Nasu Highland** resort area. Most visitors base in Tokyo and travel up for the day, but Nikkō makes an exceptional side trip on the Monday after the race.

## Getting Around Japan

Japan has the world\'s best public transport system. The **JR East Shinkansen** network connects Tokyo to the broader Kanto region in minutes. For Motegi specifically: JR from Tokyo → Utsunomiya (50 min Shinkansen), then **bus or hire car** 65 km east to the circuit (no direct rail). Race weekend shuttle buses run from Utsunomiya and Oyama. A hire car is recommended for exploring Tochigi Prefecture. In Tokyo, the **Tokyo Metro** and **Toei Subway** cover everywhere you need to go — get a 72-hour pass.`,
    getting_there_intro: 'Tokyo Narita (NRT) and Tokyo Haneda (HND) are the primary international gateways. From central Tokyo, the circuit is 130 km north — take the Shinkansen to Utsunomiya (50 min) then hire car or race weekend shuttle 65 km east to Motegi. A hire car from Tokyo is the most flexible option (2 hours via the Ken-O Expressway and Route 123).',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Tokyo (NRT or HND)',
        desc: 'Tokyo Narita (NRT) has the broadest international connections — direct from London, Manchester, Amsterdam, Paris, Frankfurt, Los Angeles, New York, Sydney, Singapore, and beyond. Haneda (HND) is closer to central Tokyo (30 min vs 60 min to Shinjuku). Both are excellent gateways. From either airport, travel to central Tokyo first, then connect to the circuit.',
      },
      {
        icon: '🚅',
        title: 'Shinkansen to Utsunomiya then bus/hire car',
        desc: 'JR East Tohoku Shinkansen from Tokyo Station to Utsunomiya takes 50 minutes (Yamabiko service). From Utsunomiya, race weekend shuttle buses run directly to Motegi circuit (65 km, approximately 75 minutes). On non-race days, take a bus or hire a car from Utsunomiya. Buy a JR Pass before arriving in Japan for unlimited Shinkansen travel.',
      },
      {
        icon: '🚗',
        title: 'Hire car from Tokyo',
        desc: 'From central Tokyo: Ken-O Expressway (圏央道) north from Hachioji/Sagamihara, connecting to Route 50 and Route 123 toward Motegi — approximately 130 km, 2 hours without traffic. The most flexible option for exploring Tochigi and Nikkō. Book hire car well in advance for race weekend — Japanese rental cars are typically small-engined, well-maintained, and come with ETC cards for motorways.',
      },
      {
        icon: '🚌',
        title: 'Race weekend direct shuttle buses',
        desc: 'Mobility Resort Motegi operates official shuttle services from Utsunomiya Station, Oyama Station, and Tsukuba on race weekend. Departures from approximately 7am. Check motegisportsclub.jp for timetables and booking. The shuttle from Utsunomiya is the most popular — frequent departures and direct to circuit gates. Tickets should be booked in advance.',
      },
    ],
    where_to_stay: `## Tokyo (Recommended Base)

Tokyo is the best base for the Japanese GP — world-class hotels, unbeatable food, and two hours to the circuit. **The Park Hyatt Tokyo** (Shinjuku — Sofia Coppola\'s Lost in Translation hotel), **Andaz Tokyo** (Toranomon — beautiful modern hotel, excellent cocktail bar on 52F), **Trunk Hotel** (Shibuya — design-forward, boutique, perfect location), **APA Hotel** (multiple locations — budget-friendly, clean, reliable), and **Tokyo Station Hotel** (elegant, convenient for Shinkansen connections). Book at least 3 months ahead.

## Utsunomiya (Near Circuit)

Utsunomiya (65 km from circuit, Shinkansen-connected to Tokyo) is a practical base for those prioritising circuit proximity. **Hotel Metropolitan Utsunomiya** and **Richmond Hotel Utsunomiya** are solid mid-range options. Utsunomiya is famous for **gyoza** (pan-fried dumplings) — the city\'s signature dish.

## Circuit Hotels & Motegi Town

Mobility Resort Motegi operates **Hotel Twin Ring** directly on the circuit grounds — the ultimate proximity option. Books out months in advance for race weekend. Various smaller hotels and guesthouses in Motegi-machi offer basic accommodation.

## Nikkō Area (Scenic)

Nikkō (60 km west of circuit, 120 km north of Tokyo) has beautiful traditional inns (**ryokan**) — sleeping on futons, multi-course kaiseki dinners, outdoor hot spring baths. **Nikko Kanaya Hotel** (historic, built 1873) and **Turtle Inn Nikko** (budget-friendly ryokan) are excellent. A sublime experience but requires planning.`,
    travel_tips: [
      {
        heading: 'October in Japan — kōyō (autumn colours) begin',
        body: 'Early October at Motegi sees the first hints of kōyō (紅葉) — the Japanese autumn foliage season. The hills surrounding the circuit turn amber and red. Temperatures are perfect: warm days (18–24°C), cool evenings (10–14°C). Pack a light jacket for the grandstands after sundown. This is one of the most beautiful times of year in Japan.',
      },
      {
        heading: 'IC card for Tokyo public transport',
        body: 'Get a Suica or Pasmo IC card at any Tokyo station (or download Suica to Apple Wallet before you land). Tap on, tap off for all Tokyo Metro, JR, and bus journeys — no need to buy tickets each time. Load ¥3,000–5,000 for a day in Tokyo. IC cards also work at convenience stores, vending machines, and many restaurants.',
      },
      {
        heading: 'Visit Nikkō on Monday after the race',
        body: 'Nikkō is one of Japan\'s most spectacular sights — a complex of Edo-period shrines and temples in forested mountain valleys 60 km west of the circuit. The **Tōshō-gū** shrine (1634, UNESCO World Heritage) is extraordinary. Allow a full day. From the circuit, it\'s under an hour by hire car; from Tokyo, it\'s 2 hours by Tobu Nikkō Line. The combination of Motegi race weekend + Nikkō Monday is a perfect Japan itinerary.',
      },
      {
        heading: 'V-Corner is the defining viewing spot',
        body: 'The **V-Corner** (Turn 9 — a long, slow right-hander on the back section of the teardrop) is where Motegi races are won and lost. Riders must scrub speed aggressively to navigate the 50m radius corner, and tyre wear here determines strategy. Find a grandstand with a view of V-Corner for the most tactically interesting race perspective.',
      },
      {
        heading: 'Japanese etiquette — a few basics',
        body: 'Japan is easy to navigate once you know the basics: remove shoes when entering private spaces (look for a step up at the entrance), don\'t eat or drink while walking (stand still or sit down), queue patiently and don\'t push, avoid loud phone calls on trains, and carry small cash — many smaller restaurants and shops are cash-only. The Japanese race fans around you will appreciate any effort at politeness.',
      },
      {
        heading: 'Convenience stores are extraordinary',
        body: 'Japanese convenience stores (7-Eleven, FamilyMart, Lawson) are not like Western ones. They sell excellent food: **onigiri** (rice balls, dozens of varieties), **nikuman** (steamed pork buns), **tamago sando** (egg sandwiches), freshly brewed coffee, and proper hot meals. Cheaper than restaurants, open 24 hours, on every corner. A 7-Eleven onigiri at Motegi circuit during qualifying is a very Japanese race weekend experience.',
      },
    ],
    circuit_facts: {
      Circuit: 'Mobility Resort Motegi',
      Lap: '4.801 km',
      Turns: '14',
      'First MotoGP': '1999',
      Capacity: '60,000',
      Location: 'Motegi, Tochigi',
    },
    faq_items: [
      {
        question: 'How do I get from Tokyo to Mobility Resort Motegi?',
        answer: 'Take the Tohoku Shinkansen from Tokyo Station to Utsunomiya (50 minutes), then a race weekend shuttle bus or hire car 65 km east to the circuit (approximately 75 minutes). Total journey: around 2 hours. Alternatively, hire a car from Tokyo and drive via the Ken-O Expressway — 130 km, approximately 2 hours.',
      },
      {
        question: 'What is the weather like at the Japanese MotoGP in October?',
        answer: 'Early October at Motegi is excellent — warm days (18–24°C), cool evenings (10–14°C), and often clear autumn skies. The kōyō (autumn foliage) season begins in the surrounding hills, giving the circuit a stunning backdrop. Rain is possible but October is generally drier than the summer months in the Kanto region.',
      },
      {
        question: 'Which airport is best for the Japanese MotoGP?',
        answer: 'Both Tokyo Narita (NRT) and Tokyo Haneda (HND) work well. Narita has more international long-haul connections; Haneda is closer to central Tokyo (35 min vs 60 min). From central Tokyo, take the Shinkansen north to Utsunomiya, then connect to the circuit. A JR Pass (purchased before departure) covers the Shinkansen leg.',
      },
      {
        question: 'Is Tokyo worth visiting during race weekend?',
        answer: 'Absolutely — Tokyo is one of the world\'s great cities and the Japanese GP is an ideal opportunity to explore it. The combination of Motegi race weekend with 2–3 days in Tokyo (Shinjuku, Shibuya, Asakusa, Ginza) makes for one of the best trips on the entire MotoGP calendar. Arrive Thursday, explore Tokyo Thursday–Friday, travel to circuit Saturday–Sunday.',
      },
      {
        question: 'What makes Mobility Resort Motegi special for MotoGP?',
        answer: 'Motegi is Honda\'s home circuit — built, owned, and operated by Honda in Tochigi Prefecture. The teardrop layout features the iconic V-Corner (Turn 9), a long slow right-hander that destroys rear tyres and determines race strategy. Japanese fans are among the most passionate and knowledgeable in the world. Racing in Japan in October, with kōyō colours on the hillsides, is a unique motorsport experience.',
      },
      {
        question: 'What Japanese food should I try at Motegi?',
        answer: 'At the circuit: look for Tochigi gyoza (pan-fried dumplings — Utsunomiya is Japan\'s gyoza capital), nikumaki onigiri (rice balls wrapped in thin pork), and ramen from regional stalls. In Tokyo: ramen (tonkotsu, shoyu, miso — each distinct), yakitori (grilled chicken skewers under railway arches), sushi (from kaiten conveyor belt to proper omakase), and izakaya pub dining with beer and sake.',
      },
    ],
    page_title: 'Motul Grand Prix of Japan 2026 — Motegi MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Motul Grand Prix of Japan at Mobility Resort Motegi. Tickets, transport from Tokyo, hotels, Japanese food, Nikkō day trip, and Tochigi travel tips.',
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
