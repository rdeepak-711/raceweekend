/**
 * Patch Spain MotoGP 2026:
 *  - Cancel Qatar MotoGP 2026 (not on 2026 calendar — was blocking Spain as next race)
 *  - Update Spain: round=4, correct name, ticket URLs
 *  - Upsert race_content with full Jerez/Spain guide
 * Run: npx tsx scripts/patch-spain-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  // 1. Cancel Qatar (not on 2026 calendar)
  await db.update(races).set({
    is_cancelled: true,
    is_active: false,
  }).where(eq(races.slug, 'qatar-motogp-2026'));
  console.log('Cancelled qatar-motogp-2026.');

  // 2. Fetch Spain race
  const [race] = await db.select().from(races).where(eq(races.slug, 'spain-motogp-2026')).limit(1);
  if (!race) {
    console.error('Race not found: spain-motogp-2026');
    process.exit(1);
  }
  console.log(`Found race id=${race.id} "${race.name}"`);

  // 3. Update Spain races row
  await db.update(races).set({
    name: 'Estrella Galicia Grand Prix of Spain',
    round: 4,
    official_tickets_url: 'https://tickets.motogp.com/en/21131-spain/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-spain',
  }).where(eq(races.slug, 'spain-motogp-2026'));
  console.log('Updated spain-motogp-2026 races row.');

  // 4. Upsert race_content
  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Jerez MotoGP Guide',
    hero_subtitle: 'Circuito de Jerez – Ángel Nieto · Andalusia, Spain',
    guide_intro: 'Jerez de la Frontera is one of the most beloved venues on the MotoGP calendar — a sun-drenched Andalusian city famous for sherry wine, flamenco, and some of the most passionate motorsport fans in the world. The Circuito de Jerez has hosted MotoGP since the early 1980s and consistently produces spectacular, wheel-to-wheel racing. Combine that with warm spring weather, incredible tapas, and the beauty of southern Spain, and you have the perfect race weekend destination.',
    why_city_text: 'Jerez is where MotoGP found its spiritual home in Spain. The circuit\'s flowing layout, the roar of prototypes bouncing off white-washed grandstands, and a crowd that knows every rider by name — it\'s an atmosphere unlike anywhere else on the calendar. And when the chequered flag falls, the city itself opens up: sherry bodegas, flamenco tablaos, and Andalusian cuisine that makes every evening after the race a celebration.',
    highlights_list: [
      'Sherry Wine Capital',
      'Flamenco Birthplace',
      'Circuito de Jerez',
      'Andalusian Cuisine',
      'Seville Day Trip',
    ],
    city_guide: `## About Jerez de la Frontera

Jerez de la Frontera sits in the heart of Andalusia, about 90 km southeast of Seville. It's best known for three things: sherry wine (jerez in Spanish), flamenco, and horses — the Royal Andalusian School of Equestrian Art is one of the finest in the world. Every spring, the city adds a fourth reason to visit: MotoGP. The circuit sits just outside the city centre and the race weekend transforms Jerez into a festival of motorsport and Andalusian culture.

## Sherry & Wine

Jerez is the only place in the world where true sherry can be made. The city centre is dotted with historic bodegas — González Byass (home of Tío Pepe), Bodegas Tradición, and Lustau are the most celebrated. Most offer guided tours and tastings. A copa of fino sherry before lunch in a bar on the Plaza del Arenal is one of the great pleasures of race weekend in Jerez.

## Food & Tapas

Andalusian tapas culture is at its best here. Look for **pescaíto frito** (fried fish), **tortillitas de camarones** (shrimp fritters), **carne mechada** (slow-braised beef), and **papas aliñás** (potato salad with vinaigrette). Bar Juanito near the cathedral is legendary for its extensive tapas menu. On race weekend, the streets around the circuit and the city centre fill with pop-up food stalls.

## Flamenco

Jerez is widely regarded as the birthplace of flamenco — specifically the jondo style, rawer and more emotional than the tourist versions seen in Seville. The Barrio de Santiago neighbourhood is the heartland of authentic flamenco. Peña La Buena Gente and the Centro Andaluz de Flamenco offer performances close to the real thing. Many bars put on impromptu sessions on race weekend evenings.

## Race Weekend

The Circuito de Jerez–Ángel Nieto holds around 110,000 spectators and fills to capacity on race day. The main grandstand (Tribuna) gives a sweeping view of the start/finish straight. The Sito Pons grandstand at Turn 5 is a favourite for wheel-to-wheel action. General admission lets you roam the infield, and the hillside opposite the main straight is always packed. The circuit is just 3 km from Jerez city centre — within easy cycling distance.

## Day Trips

**Seville** is 90 km north (1 hr by car or train) and makes a superb day trip on the Thursday or Monday around race weekend — the Alcázar palace, the Giralda tower, and the Santa Cruz neighbourhood are unmissable. **Cádiz** is 35 km west: a beautiful Atlantic city with excellent seafood, a 3,000-year-old history, and a great beach. **El Puerto de Santa María** (20 km) has outstanding seafood restaurants right on the bay.`,
    getting_there_intro: 'Jerez de la Frontera has its own airport (XRY) with regular flights from Madrid, Barcelona, and London Gatwick. Seville Airport (SVQ) is 90 km away and offers more international connections — it\'s an easy 1-hour drive. The city is also served by high-speed AVE train from Madrid and regional trains from Seville and Cádiz.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Jerez (XRY)',
        desc: 'Jerez Airport (XRY) is 8 km north of the city with direct flights from London Gatwick (Easyjet/Vueling), Madrid, and Barcelona. Taxis to the city or circuit take 15 minutes.',
      },
      {
        icon: '✈️',
        title: 'Fly to Seville (SVQ)',
        desc: 'Seville Airport has the widest international connections (London, Amsterdam, Paris, Frankfurt). Car hire takes 1 hour to Jerez via the A-4 motorway — a scenic drive through Andalusian countryside.',
      },
      {
        icon: '🚂',
        title: 'Train from Seville',
        desc: 'Regular RENFE trains run Seville Santa Justa → Jerez de la Frontera in 1h 20min. Jerez station is 2 km from the circuit on race weekends, with shuttles provided. Book in advance at renfe.com.',
      },
      {
        icon: '🚌',
        title: 'Official Shuttles',
        desc: 'Race weekend shuttles operate from Jerez city centre and the train station to the circuit gates. Included with some ticket packages — check the official circuit website.',
      },
    ],
    where_to_stay: `## Jerez City Centre

Staying in the centre puts you within reach of the best tapas bars, sherry bodegas, and evening atmosphere. **Hotel Palacio Garvey** (historic palacio conversion), **Hotel Casa Grande** (boutique, rooftop terrace), and **NH Avenida Jerez** (reliable business hotel) are strong picks. Book 2–3 months ahead for race weekend.

## Near the Circuit

The Av. Álvaro Domecq corridor has several modern hotels close to the circuit — convenient for early morning sessions. **Hotel Husa Jerez** and the **Barceló Jerez Montecastillo** (3 km from circuit, golf resort) are popular with teams and sponsors.

## Seville

Staying in Seville (90 km) is a viable option if you want more accommodation choice and city atmosphere. Hire a car and drive in each day — but allow extra time on race Sunday. The hotel stock in Seville is far larger and often better value than Jerez on race weekend.

## Cádiz

For something different, **Cádiz** (35 km) is a beautiful Atlantic city with great hotels and seafood. Drive or take the train to Jerez for race days. A memorable combination.`,
    travel_tips: [
      {
        heading: 'Spring heat in Andalusia',
        body: 'April in Jerez can be warm — 20–28°C and sunny. Pack sunscreen, a hat, and plenty of water. The circuit has limited shade in the infield grandstands.',
      },
      {
        heading: 'Book sherry tours early',
        body: 'The major bodegas (González Byass, Lustau, Tradición) book out fast on race weekend. Reserve your tasting tour at least a week in advance.',
      },
      {
        heading: 'Rent a car for flexibility',
        body: 'Jerez, Seville, Cádiz and El Puerto de Santa María are all within easy driving distance. A car unlocks the full potential of the region. Hire from Seville or Jerez airports.',
      },
      {
        heading: 'Arrive early on race day',
        body: 'The circuit road (Circuito de Jerez) gets congested on Sunday morning. Arriving before 10am avoids the worst. Use official shuttles from the city if you prefer not to drive.',
      },
      {
        heading: 'Lunch timing',
        body: 'Andalusian lunch runs late — 2pm to 4pm is peak time in most restaurants. Plan around the race schedule: lunch before the Sprint on Saturday and after warm-up on Sunday.',
      },
      {
        heading: 'Cash for smaller bars',
        body: 'Many of the best tapas bars near the circuit and in the old town are cash-only. Bring €50–€100 in smaller notes for drinks and snacks.',
      },
    ],
    circuit_facts: {
      Circuit: 'Circuito de Jerez – Ángel Nieto',
      Lap: '4.423 km',
      Turns: '13',
      'First MotoGP': '1987',
      Capacity: '110,000',
      Location: 'Jerez de la Frontera, Andalusia',
    },
    faq_items: [
      {
        question: 'How do I get from Seville to the Jerez circuit?',
        answer: 'Drive via the A-4 motorway (1 hour, ~90 km). On race weekend, allow 30 extra minutes for traffic near Jerez. Alternatively take the RENFE train to Jerez station (1h 20min) and use the official circuit shuttle.',
      },
      {
        question: 'What is the weather like at the Spain MotoGP in April?',
        answer: 'Jerez in late April is warm and mostly sunny — 20–28°C with low rainfall. Occasional afternoon showers are possible. It\'s one of the most pleasant circuits on the calendar weather-wise.',
      },
      {
        question: 'Can I visit sherry bodegas during race weekend?',
        answer: 'Yes — most major bodegas (González Byass, Lustau, Tradición) are open Thursday through Sunday. Book in advance as tours fill up fast. González Byass is the most famous and has excellent tour/tasting packages.',
      },
      {
        question: 'Is Seville worth visiting during race weekend?',
        answer: 'Absolutely. Seville is 90 km north and one of Spain\'s most beautiful cities. The Alcázar palace, the Giralda, and the Santa Cruz neighbourhood are extraordinary. Visit Thursday or the Friday morning before FP1.',
      },
      {
        question: 'What are the best grandstands at Jerez?',
        answer: 'The Tribuna (main) grandstand offers a view of the start/finish straight and pit lane action. The Sito Pons grandstand (Turn 5) is a fan favourite for overtaking. The hillside on the opposite straight (Pelouse) is General Admission and free-roaming.',
      },
      {
        question: 'Where can I eat near Circuito de Jerez?',
        answer: 'The circuit has its own food village with Spanish food stalls. In the city, Bar Juanito (near the cathedral) and the tapas bars around Plaza Rafael Rivero are excellent. El Puerto de Santa María (20 km) has world-class seafood restaurants on the seafront.',
      },
    ],
    page_title: 'Estrella Galicia Grand Prix of Spain 2026 — Jerez Travel Guide',
    page_description: 'Your complete guide to attending the 2026 MotoGP Estrella Galicia Grand Prix of Spain at Circuito de Jerez–Ángel Nieto. Tickets, transport, hotels, sherry bodegas, and Andalusia tips.',
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
