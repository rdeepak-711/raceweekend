/**
 * Patch Brazil MotoGP 2026:
 *  - Fix NULL official_tickets_url
 *  - Upsert race_content with full Rio de Janeiro guide
 * Run: npx tsx scripts/patch-brazil-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const RACE_SLUG = 'brazil-motogp-2026';

async function main() {
  // 1. Fetch race ID
  const [race] = await db.select().from(races).where(eq(races.slug, RACE_SLUG)).limit(1);
  if (!race) {
    console.error(`Race not found: ${RACE_SLUG}`);
    process.exit(1);
  }
  console.log(`Found race id=${race.id} "${race.name}"`);

  // 2. Update races table (fix NULL tickets URL + clean up names)
  await db.update(races).set({
    name: 'Grande Prêmio Lenovo do Brasil',
    official_tickets_url: 'https://tickets.motogp.com/en/21029-brazil',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-brazil',
  }).where(eq(races.slug, RACE_SLUG));
  console.log('Updated races row (official_tickets_url, name, official_event_url).');

  // 3. Upsert race_content
  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Rio de Janeiro MotoGP Guide',
    hero_subtitle: 'Autódromo Internacional do Rio · Rio de Janeiro, Brazil',
    guide_intro: 'Rio de Janeiro is one of the world\'s great cities — Carnival, Copacabana, Christ the Redeemer, the Maracanã, the rhythm of samba drifting through the streets at night. The Autódromo Internacional do Rio (Nelson Piquet Circuit) sits in Barra da Tijuca, 40 km west of Ipanema along the coast, and MotoGP\'s return to Brazil has brought the championship back to one of the most electrifying atmospheres on the calendar. Race fans here don\'t just watch — they celebrate.',
    why_city_text: 'Rio is magnetic. No other city on the MotoGP calendar combines a natural amphitheatre of mountains, ocean, and urban energy quite like this. Copacabana and Ipanema are the most famous urban beaches in the world. The Christ the Redeemer statue gazes over everything. The food is exceptional, the caipirinhas are cold, and the crowd at the circuit brings Carnival energy to every session. July in Rio sits in the mild southern winter — pleasant temperatures, lower humidity than summer, and clear skies for the grandstands.',
    highlights_list: [
      'Christ the Redeemer & Corcovado',
      'Copacabana & Ipanema Beaches',
      'Sugarloaf Mountain',
      'Samba & Brazilian Nightlife',
      'Churrasco & Street Food',
    ],
    city_guide: `## About Rio de Janeiro

Rio de Janeiro is the Cidade Maravilhosa — the Marvellous City. It sits at the mouth of Guanabara Bay, wedged between the Atlantic and a dramatic backdrop of granite peaks. The city divides into distinct zones: **Zona Sul** (South Zone) — Copacabana, Ipanema, Leblon, and the wealthy beach suburbs — is where most visitors base themselves. **Centro** is the historic and financial heart with colonial architecture and the city's best churrascarias. **Barra da Tijuca** (the Barra), 40 km west, is where the circuit sits — a more modern, planned district with shopping centres, beaches, and the sports infrastructure left from the 2016 Olympics.

## Copacabana & Ipanema

The most famous beaches in the world live up to their reputation. **Copacabana** (4 km of beach) is older, livelier, more chaotic — beach football, street vendors, beachside kiosks (barraquinhas) serving cold drinks and petiscos (snacks). **Ipanema** is more refined, the birthplace of the bossa nova song, and home to better restaurants and boutiques on the surrounding streets. Both are safe during the day when crowded — standard city precautions at night. The **calçadão** (mosaic promenade) running the length of Copacabana is Rio's most iconic street scene.

## Christ the Redeemer & Sugarloaf

**Cristo Redentor** (Christ the Redeemer) atop Corcovado mountain (710m) is the essential Rio experience — arms outstretched over the city, visible from almost everywhere. Take the rack railway (trem do Corcovado) from Santa Teresa for the most atmospheric approach, or the van service from Cosme Velho. Book tickets online well in advance. At sunrise or sunset, the views over the bay, the beaches, and the distant mountains are extraordinary.

**Pão de Açúcar** (Sugarloaf Mountain, 395m) at the entrance to Guanabara Bay is the other iconic peak. Two cable car stages ascend to the summit — the views of the bay, Niterói across the water, and the city below are unmatched. Go at golden hour for the best photographs.

## Samba, Churrasco & Rio Food

Brazilian food culture centres on abundance. **Churrascaria** (rodízio barbecue restaurants) are the essential experience — servers circulate with skewers of picanha (prime beef rump cap), fraldinha (flank), lamb, sausage, and chicken until you surrender. **Fogo de Chão** and **Porcão** in Ipanema are reliable; local neighbourhoods have excellent smaller options. Street food staples: **pastel** (fried pastry with fillings), **coxinha** (chicken-filled dough croquette), **açaí** (the Brazilian berry bowl), and grilled corn (milho). **Caipirinha** (cachaça, lime, sugar, ice) is the national cocktail — order one at any kiosk, bar, or beachside barraquinha.

**Samba** is not just music in Rio — it's identity. The **Lapa district** (downtown) is the night-time epicentre: outdoor arches, live samba, and crowds that form spontaneously on weekend nights. **Pedra do Sal** in Saúde (near the port) is where samba was born — Friday night informal samba circles here are one of Rio's great experiences.

## Barra da Tijuca & The Circuit

The Autódromo Internacional do Rio sits within the broader Barra da Tijuca area, near the Riocentro convention complex. The Barra is a different Rio from the beach suburbs — wider avenues, shopping centres, modern residential towers, and the legacy Olympic venues from 2016. The circuit itself is a substantial facility: 4.933 km, 17 turns, purpose-built for high-speed racing. Race weekend brings enormous crowds and the unmistakable energy of a tropical motorsport event — loud, colourful, and entirely unlike a European Grand Prix.

## Getting Around

Rio operates on Uber/99 (local ride-hailing) for most visitors — comfortable, metered, and far easier than navigating local buses if you don't speak Portuguese. The **Metrô** (metro) covers Ipanema, Copacabana, and Centro well; for the circuit, the BRT (Bus Rapid Transit) Transoeste corridor connects Barra da Tijuca to various points west. On race weekend, official shuttle services from Zona Sul hotels to the circuit gates are the most practical option — avoid driving to the circuit yourself.`,
    getting_there_intro: 'Rio de Janeiro is served by two airports: **Galeão International Airport (GIG)** — the main international hub, 40 km north of Copacabana, with connections to Europe, North America, and all Brazilian cities — and **Santos Dumont Airport (SDU)**, 5 km from Centro, used mainly for domestic routes. Most race fans fly into GIG. Transfer time to Zona Sul (Copacabana/Ipanema) is approximately 40–60 minutes by taxi or Uber; to Barra da Tijuca (near circuit) is 40–50 minutes.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Galeão (GIG)',
        desc: 'Rio Galeão International Airport has direct connections from London Heathrow (British Airways/LATAM), Lisbon, Paris, Frankfurt, Miami, New York, and Buenos Aires. 40–60 minutes to Copacabana by Uber/taxi. Pre-book your transfer or use the Uber app on arrival.',
      },
      {
        icon: '🚗',
        title: 'Uber / 99 ride-hail',
        desc: 'Uber and 99 (local Brazilian app) are the most reliable ways to move around Rio. Both operate city-wide, including from Galeão. Fares are metered and reasonable — GIG to Ipanema runs BRL 80–120 depending on traffic.',
      },
      {
        icon: '🚇',
        title: 'Metro + BRT to Barra',
        desc: 'The Metrô covers the beach suburbs (Ipanema, Copacabana, Botafogo) and Centro. The BRT Transoeste connects Jardim Oceânico (metro terminal) to Barra da Tijuca and points near the circuit. Good for avoiding race day traffic — check official circuit shuttle information for the best last-mile option.',
      },
      {
        icon: '🚌',
        title: 'Official race shuttles',
        desc: 'The circuit operates official shuttle buses from designated points in Zona Sul and Barra during race weekend. These are the most practical and stress-free way to get to and from the gates — book via the official MotoGP/circuit website and avoid trying to drive yourself on race Sunday.',
      },
    ],
    where_to_stay: `## Copacabana (Most Popular Base)

Copacabana puts you on the famous beach, within walking distance of bars, restaurants, and the calçadão. **Hotel Copacabana Palace** (Belmond, the classic, ocean-facing) and **JW Marriott Rio de Janeiro** are the top-tier options. Mid-range: **Windsor Excelsior** and **Pestana Rio Atlântica** on the seafront. Budget: numerous pousadas and apartment rentals one street back from the beach. Book 2–3 months out for race weekend.

## Ipanema

Slightly more refined than Copacabana with excellent restaurants on the surrounding streets. **Hotel Fasano Rio** (the most stylish hotel in Rio, pool bar overlooking the beach) is a special choice. **Caesar Park Rio de Janeiro Ipanema** and **Arpoador Inn** (basic, perfect beachfront position at the Arpoador end) are the alternatives.

## Barra da Tijuca (Near Circuit)

Staying in the Barra puts you 10–15 minutes from the circuit — practical for long race weekends. **Windsor Barra Hotel** and **Nobile Inn Barra da Tijuca** are solid options in this district. Lower price points than Zona Sul. Less atmosphere, but maximum circuit convenience.

## Centro & Santa Teresa

Centro has excellent churrascarias and the Lapa neighbourhood for evening samba. Santa Teresa (hilltop bohemian neighbourhood) is beautiful for a relaxed base. Less convenient for the circuit but great for exploring old Rio.`,
    travel_tips: [
      {
        heading: 'July is the mild season — book early anyway',
        body: 'July sits in Rio\'s southern hemisphere winter: temperatures of 22–26°C, lower humidity than January–March, and little rain. It\'s the most pleasant time to visit. But it\'s also peak season for Brazilian domestic tourism — book flights, accommodation, and circuit tickets as early as possible.',
      },
      {
        heading: 'Safety awareness in Rio',
        body: 'Rio has areas with high crime — standard urban common sense applies. Zona Sul beach areas and tourist zones are heavily policed and generally safe during the day. Avoid displaying expensive jewellery or cameras in less-visited areas. Use Uber rather than hailing taxis on the street. Your hotel concierge will give you up-to-date local advice.',
      },
      {
        heading: 'Use BRL cash at food stalls',
        body: 'Many street food vendors, market stalls, and smaller local restaurants prefer cash. Credit cards are widely accepted at hotels and mid-range restaurants. Have BRL 200–400 in notes for casual eating and market shopping.',
      },
      {
        heading: 'Carioca meal times are late',
        body: 'Rio locals (cariocas) eat dinner late — 8pm is early, 9–10pm is normal. Restaurants in Ipanema and Leblon are often half-empty before 9pm. If you\'re hungry at 7pm, you\'re eating on tourist time. The lunch culture is strong: a big churrasco lunch is very Brazilian.',
      },
      {
        heading: 'Sun exposure at the circuit',
        body: 'The Autódromo in Barra da Tijuca has limited natural shade in the grandstands. July in Rio still delivers strong tropical sun. Bring high-factor sunscreen (SPF 50+), a hat, and consider a portable fan or misting bottle for the main race. Hydrate constantly.',
      },
      {
        heading: 'Portuguese basics go a long way',
        body: 'Outside the major hotels and tourist strips, English is limited. Learning a handful of Portuguese phrases (obrigado/a = thank you, por favor = please, quanto custa = how much, uma cerveja = a beer) will be warmly received by locals and will smooth many interactions.',
      },
    ],
    circuit_facts: {
      Circuit: 'Autódromo Internacional do Rio',
      Lap: '4.933 km',
      Turns: '17',
      'First MotoGP': '2023',
      Location: 'Rio de Janeiro, Brazil',
    },
    faq_items: [
      {
        question: 'Is it worth visiting Christ the Redeemer?',
        answer: 'Absolutely — it\'s one of the most impressive man-made landmarks in the world. Book your timed entry online well in advance (Cristo tickets sell out days ahead). Take the rack railway (trem do Corcovado) from Cosme Velho for the most atmospheric approach. Early morning or late afternoon gives the best light and shorter queues.',
      },
      {
        question: 'Is Copacabana or Ipanema better to stay?',
        answer: 'Both are excellent. Copacabana is livelier, louder, and has more affordable hotels with ocean views — great energy, but noisier at night. Ipanema is more refined with better restaurants and boutiques, slightly quieter beach atmosphere. For first-timers, Copacabana offers the classic Rio experience. For a more relaxed stay, Ipanema.',
      },
      {
        question: 'How do I get from the airport to Copacabana?',
        answer: 'Uber from Galeão (GIG) to Copacabana takes 40–60 minutes and costs approximately BRL 80–120. Pre-book an executive transfer through your hotel for a flat rate. The official bus service (Real Bus/Premium) runs from the airport to Copacabana via the city for BRL 25–30, but takes longer. Avoid unlicensed taxis at the airport.',
      },
      {
        question: 'How do I get to the circuit from Zona Sul?',
        answer: 'The most practical option is the official race weekend shuttle — book via the MotoGP/circuit website. Alternatively, Uber to Barra da Tijuca takes 30–45 minutes depending on traffic (arrive early on race Sunday). The BRT Transoeste from Jardim Oceânico metro station covers the final stretch to Barra.',
      },
      {
        question: 'What is the weather like in July in Rio?',
        answer: 'July is Rio\'s winter — and its most pleasant month. Temperatures average 22–26°C with low humidity and little rainfall. Evenings can be cooler (18–20°C), so bring a light jacket for grandstand sessions after dark. The beach is less crowded than summer and the sea is still warm enough to swim.',
      },
      {
        question: 'Which grandstands are best at the Autódromo do Rio?',
        answer: 'The main grandstand opposite the pit straight gives the best overall view of the racing. The infield sections near the chicane complexes are popular for overtaking action. Check the official circuit seating map for the latest grandstand layout. General Admission areas allow circuit walking on non-race days.',
      },
    ],
    page_title: 'Grande Prêmio Lenovo do Brasil 2026 — Rio de Janeiro MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Grande Prêmio Lenovo do Brasil at Autódromo Internacional do Rio. Tickets, hotels, transport from Galeão, Christ the Redeemer, Copacabana, and Rio de Janeiro travel tips.',
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
