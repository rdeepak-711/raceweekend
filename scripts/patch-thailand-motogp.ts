/**
 * Patch Thailand MotoGP 2026:
 *  - Update race name, official_tickets_url, official_event_url
 *  - Upsert race_content with full Buriram/Bangkok guide
 * Run: npx tsx scripts/patch-thailand-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const RACE_SLUG = 'thailand-motogp-2026';

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
    name: 'PTT Thailand Grand Prix',
    official_tickets_url: 'https://tickets.motogp.com/en/21030-thailand',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-thailand',
  }).where(eq(races.slug, RACE_SLUG));
  console.log('Updated races row.');

  // 3. Upsert race_content
  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Thailand MotoGP Guide',
    hero_subtitle: 'Chang International Circuit · Buriram, Thailand',
    guide_intro: 'The Chang International Circuit in Buriram is one of Southeast Asia\'s finest motorsport venues — a purpose-built, FIM-grade facility carved from the red laterite plains of Isan, Thailand\'s northeast region. The circuit\'s 4.554 km layout, enormous capacity, and infrastructure that would embarrass many European venues make it one of the most impressive additions to the MotoGP calendar. Buriram is a small provincial city, but the warmth of Isan hospitality, the ancient Khmer temples scattered across the surrounding landscape, and the easy connection to Bangkok make the Thailand round a genuinely rewarding adventure.',
    why_city_text: 'Thailand MotoGP delivers an experience unlike any other on the calendar: a world-class circuit in a genuinely exotic location, surrounded by ancient Khmer temples and the warm, extraordinary hospitality of northeastern Thailand. The crowd — often 100,000+ on race day — creates an atmosphere that European rounds simply can\'t match. October weather is cooling from monsoon season: warm, humid, and dramatic — and the landscape of the Isan plateau, flat and vast under enormous skies, is unlike anything in Europe. Bangkok, 400 km southwest, adds a full city-extension option for those combining the race with a broader Thailand trip.',
    highlights_list: [
      'Chang International Circuit',
      'Prasat Hin Khao Phnom Rung',
      'Buriram Khmer Temples',
      'Bangkok City Extension',
      'Thai Food & Night Markets',
    ],
    city_guide: `## About Buriram

Buriram (full name Buri Ram — "City of Happiness") is the capital of Buri Ram Province in Isan, Thailand's largest region and the heartland of Thai culture and cuisine. Isan sits on the Khorat Plateau, a vast elevated plain in the northeast, historically influenced by the ancient Khmer Empire centred at Angkor Wat in modern Cambodia. The result: extraordinary archaeological heritage, with Khmer temple complexes scattered across the region unlike anywhere else in mainland Thailand.

The city itself is modest — population around 30,000 in the urban centre — but has invested heavily in sports infrastructure. The **Chang International Circuit** opened in 2014 and is the centrepiece of a broader sports hub that also includes the **Chang Arena** (home to Buriram United FC, one of Southeast Asia's most ambitious football clubs). The circuit itself is immaculate — a genuine world-class facility with pit buildings, media centre, grandstands, and hospitality infrastructure that compete with any venue on the calendar.

## Prasat Hin Khao Phnom Rung

The most important historical site in Isan and arguably in all of Thailand outside Ayutthaya and Sukhothai. **Prasat Hin Khao Phnom Rung** is an 11th–13th century Khmer Hindu temple complex built atop an extinct volcanic cone (383m) in Buri Ram Province, 120 km from the circuit. The processional walkway, flanked by 162 nagas (serpents), leads to a sandstone sanctuary of extraordinary craftsmanship — built under the same Khmer kings who constructed Angkor Wat. The annual **Phnom Rung Festival** in April sees the rising sun align perfectly through all 15 doorways of the temple's central sanctuary — one of the great astronomical alignments in Southeast Asian architecture.

For race weekend visitors, the 90-minute drive to Phnom Rung on Thursday or Friday is the single most rewarding excursion available from the circuit. **Prasat Hin Mueang Tam** (7 km from Phnom Rung) is a smaller Khmer complex of the same era, often visited in the same day trip.

## Buriram City & Isan Food

Buriram's city centre is small but lively. The **night market** near Buriram Railway Station is the social heart of the city each evening — stalls selling grilled meats (moo ping — pork skewers), som tum (papaya salad, spicier in Isan than Bangkok), khao niao (sticky rice, eaten by hand in Isan), and kai yang (grilled chicken marinated in lemongrass and fish sauce). **Isan cuisine** is distinct from central Thai cooking: more sour (from fermented fish paste and lime), spicier, and centred on grilled meats and sticky rice rather than jasmine rice. Try laab (minced meat salad with herbs), sai krok Isan (fermented Isan sausage), and nam tok (grilled beef salad).

## Bangkok Extension

Bangkok is 400 km southwest of Buriram — 4.5 hours by train (overnight sleeper available), 1 hour by domestic flight (Buriram Airport/BFV to Suvarnabhumi or Don Mueang), or 5–6 hours by road. The combination of Thailand MotoGP and 3–4 days in Bangkok makes an exceptional trip. Bangkok offers the **Grand Palace and Wat Phra Kaew** (Temple of the Emerald Buddha), Wat Arun (Temple of Dawn), the **Chatuchak Weekend Market** (the largest outdoor market in the world), the extraordinary street food of Yaowarat (Chinatown), rooftop bars in Silom/Sathorn, and the full spectrum of Southeast Asian urban culture.

## Getting Around

Within Buriram, the circuit operates official race weekend shuttles from the city centre and key hotels — these are essential, as public transport to the circuit is limited. Songthaews (shared pickup trucks) and tuk-tuks cover local city distances cheaply. For the Bangkok trip, book the State Railway of Thailand overnight sleeper or a domestic flight well in advance — race weekend departures from Buriram fill quickly.`,
    getting_there_intro: 'Buriram has a small domestic airport (**BFV**, Buriram Airport) with flights from Bangkok Suvarnabhumi (BKK) on THAI and Bangkok Airways, plus Don Mueang (DMK) on Nok Air and AirAsia — approximately 1 hour flying time. International visitors fly into Bangkok first (BKK or DMK), then connect to Buriram. Train from Bangkok Hua Lamphong to Buriram takes approximately 4.5 hours (regular) or overnight by sleeper.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly Bangkok → Buriram (BFV)',
        desc: 'Domestic flights from Bangkok Suvarnabhumi (BKK) or Don Mueang (DMK) to Buriram Airport (BFV) take approximately 1 hour. THAI, Bangkok Airways, Nok Air, and AirAsia operate this route. Book early for race weekend — seats sell out. BFV is 20 km from the circuit.',
      },
      {
        icon: '🚂',
        title: 'Train Hua Lamphong → Buriram',
        desc: 'The State Railway of Thailand operates regular trains from Bangkok Hua Lamphong station to Buriram, approximately 4.5 hours. The overnight sleeper departing Bangkok around 10pm arrives in Buriram in the morning — an atmospheric, budget-friendly option. Book at hua lamphong station or via 12go.asia.',
      },
      {
        icon: '🚌',
        title: 'Charter bus from Bangkok',
        desc: 'Several operators run race weekend charter buses from Bangkok to Buriram direct to the circuit gates. Check the official MotoGP Thailand website for licensed operators. Journey time 5–6 hours from central Bangkok.',
      },
      {
        icon: '🚌',
        title: 'Official circuit shuttles (in Buriram)',
        desc: 'Once in Buriram, official race weekend shuttles run from designated city centre pick-up points and partner hotels to the circuit. These are essential — public transport to the circuit is limited and parking is congested. Book via the official Chang International Circuit / MotoGP Thailand website.',
      },
    ],
    where_to_stay: `## Buriram City (Recommended Base)

Staying in Buriram city puts you 10–15 km from the circuit with easy access to the night market and local restaurants. **The Grand Hotel Buriram** and **Buri Ram Castle Hotel** are the best-positioned mid-range options. **P Guesthouse** and smaller guesthouses near the railway station are budget-friendly. Book 2–3 months in advance — race weekend accommodation in Buriram sells out entirely.

## Resort Hotels Near the Circuit

Several hotels and resorts have opened near the circuit and sports complex on the outskirts of Buriram. These offer maximum convenience for race days but limited access to the city's food scene. **Forgett Me Not Cafe & Resort** and **Buriram Princess Hotel** are popular options. Check the official MotoGP Thailand partner hotel list for recommended properties.

## Bangkok (If Combining the Trip)

Bangkok has every category of accommodation. The **Silom/Sathorn** district (business centre, good transport links), **Sukhumvit** (tourist hub, easy BTS access), and **Riverside** (Chao Phraya views, ferry access to major sights) are the best bases. **Mandarin Oriental Bangkok** (legendary, riverside), **SO Sofitel Bangkok**, and **Capella Bangkok** for luxury; **Ibis Bangkok Siam** and **Aloft Bangkok Sukhumvit** for mid-range. Book early for October — it's high season for Bangkok tourism.

## Practical Note

Race weekend in Buriram transforms a small provincial city into a 100,000-person event. Hotel availability within 30 km of the circuit disappears months before the race. Cast your net early — even basic accommodation in Surin (50 km east) or Nakhon Ratchasima (Korat, 100 km west) is worth considering if Buriram is sold out.`,
    travel_tips: [
      {
        heading: 'Heat & humidity in October — prepare properly',
        body: 'October sits at the end of Thailand\'s monsoon season. Buriram is warm (28–33°C) and humid, with possible afternoon showers that clear quickly. At the circuit, grandstand areas have partial shade but race day in full sun is intense. Pack SPF 50+ sunscreen, a wide-brim hat, cooling towel, and a small portable fan. Stay hydrated — drink bottled water constantly, not tap water.',
      },
      {
        heading: 'Circuit shuttle is essential — don\'t drive yourself',
        body: 'The circuit gates are 10–15 km from central Buriram and access roads become heavily congested from 8am on race Sunday. The official shuttle service is by far the most reliable way in and out. Book shuttle tickets when you buy your circuit tickets. Walking to the circuit from the city is not practical.',
      },
      {
        heading: 'Thai dress codes for temples',
        body: 'If you visit Prasat Hin Khao Phnom Rung or any Buddhist temple, shoulders and knees must be covered. Carry a sarong or lightweight cover-up. Most temple sites have coverings to borrow or buy at the entrance, but bringing your own is faster. Remove shoes before entering temple buildings.',
      },
      {
        heading: 'Use Thai Baht cash at food stalls',
        body: 'The circuit food village and Buriram night markets operate primarily in cash. ATMs are available in the city centre and circuit area, but can be slow on race day. Bring 1,000–2,000 THB in notes for food and beverages within the circuit. Credit cards are accepted at hotels and larger restaurants.',
      },
      {
        heading: 'Isan food is spicier than Bangkok — ask for "mai pet"',
        body: 'Isan cuisine is significantly spicier than central Thai food. If you have a low spice tolerance, say "mai pet" (not spicy) or "pet nit noi" (a little spicy) when ordering. The som tum (papaya salad) in particular is often made with fermented crab and extreme chilli heat by default. Point at what looks appealing and ask for heat level separately.',
      },
      {
        heading: 'Visa requirements for Thailand',
        body: 'Citizens of most Western countries (UK, EU, USA, Australia, Canada, etc.) receive a 30-day visa exemption on arrival at Bangkok airports. This is sufficient for a race weekend trip with a Bangkok extension. Always check the Royal Thai Embassy website for your specific nationality before travel, as rules change periodically.',
      },
    ],
    circuit_facts: {
      Circuit: 'Chang International Circuit',
      Lap: '4.554 km',
      Turns: '12',
      'First MotoGP': '2018',
      Capacity: '100,000',
      Location: 'Buriram, Thailand',
    },
    faq_items: [
      {
        question: 'Should I stay in Bangkok or Buriram for the Thailand MotoGP?',
        answer: 'If you can, do both: fly into Bangkok, spend 2–3 days exploring the city, then travel to Buriram for race weekend (fly 1hr or overnight train), then fly home from Buriram or return to Bangkok. If you only have the race weekend, stay in Buriram — it\'s more atmospheric and puts you near the circuit. Bangkok-only is only practical with a domestic flight on race day, which is a long and stressful logistics chain.',
      },
      {
        question: 'How do I get from Bangkok to the circuit?',
        answer: 'Best option: fly Bangkok Suvarnabhumi (BKK) or Don Mueang (DMK) to Buriram Airport (BFV) — approximately 1 hour, multiple daily flights. Then official circuit shuttle or taxi from BFV. Alternative: overnight train from Bangkok Hua Lamphong to Buriram (4.5 hours). Avoid driving the full Bangkok–Buriram route on race weekend — 5–6 hours each way.',
      },
      {
        question: 'What is the weather like at Thailand MotoGP in October?',
        answer: 'October is at the end of the monsoon season in Thailand\'s northeast. Temperatures are 28–33°C with high humidity. Brief afternoon rain showers are possible but usually clear quickly. The heat and humidity are the main challenge — dress lightly, bring SPF 50+ sunscreen, and hydrate constantly. Evenings cool to around 24–26°C.',
      },
      {
        question: 'What temples can I visit near the circuit?',
        answer: 'Prasat Hin Khao Phnom Rung is the must-see — an extraordinary 11th-century Khmer temple atop a volcanic hill, 90 minutes from the circuit by car. Prasat Hin Mueang Tam (7 km from Phnom Rung) is another Khmer complex worth combining in the same day trip. Both are UNESCO-recommended sites and easily accessible by hire car or organised day tour from Buriram.',
      },
      {
        question: 'What is the best food to try at the Thailand MotoGP?',
        answer: 'Isan food is distinctive and extraordinary. Must-tries: kai yang (grilled marinated chicken), som tum (papaya salad — ask for less spicy), moo ping (pork skewers), and khao niao (sticky rice, eaten by hand). The circuit food village will have these plus standard Thai dishes. Buriram\'s night market near the train station is the best evening option in the city. Bring cash.',
      },
      {
        question: 'Do I need a visa for Thailand?',
        answer: 'Citizens of the UK, EU, USA, Australia, Canada, and most other Western countries receive a 30-day visa-free exemption on arrival at Bangkok\'s international airports. A typical race trip of 5–10 days is well within this allowance. Check the official Royal Thai Embassy website for your specific nationality, as exemptions can change.',
      },
    ],
    page_title: 'PTT Thailand Grand Prix 2026 — Buriram MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP PTT Thailand Grand Prix at Chang International Circuit, Buriram. Tickets, transport from Bangkok, hotels, Khmer temples, Thai food, and Thailand travel tips.',
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
