/**
 * Patch Italy MotoGP 2026:
 *  - Update: round=7, correct name, ticket URLs
 *  - Upsert race_content with full Florence/Mugello guide
 * Run: npx tsx scripts/patch-italy-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'italy-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Brembo Grand Prix of Italy',
    round: 7,
    official_tickets_url: 'https://tickets.motogp.com/en/21081-italy',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-italy',
  }).where(eq(races.slug, 'italy-motogp-2026'));
  console.log('Updated italy-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Mugello MotoGP Guide',
    hero_subtitle: 'Autodromo Internazionale del Mugello · Tuscany, Italy',
    guide_intro: 'Mugello is the spiritual home of Italian MotoGP — a breathtaking natural amphitheatre carved into the Apennine hills of Tuscany, 30 kilometres north of Florence. The Autodromo Internazionale del Mugello is widely regarded as the most beautiful circuit on the calendar and one of the fastest and most technically demanding. Owned by Ferrari since 1988, it combines savage high-speed sections with technical chicanes and a finish straight that sees bikes touching 340 km/h. Add the passion of the tifosi, the rolling Tuscan countryside, and Florence an hour away, and Mugello becomes the ultimate MotoGP pilgrimage.',
    why_city_text: 'No circuit packs the grandstands like Mugello on MotoGP weekend. The Italian fans — the tifosi — turn the hillside into a wall of sound, flags, and pure passion. Riders consistently say the Mugello atmosphere is unlike anywhere else: 140,000 people who know every rider\'s name, every corner\'s history, and every lap record. And when the racing is done, you\'re in Tuscany — arguably the most beautiful region in the world, with Florence just 45 minutes away and some of the finest food and wine on earth within arm\'s reach.',
    highlights_list: [
      'Mugello Circuit & Tifosi',
      'Florence & the Uffizi',
      'Tuscan Wine Country',
      'Chianti & Countryside',
      'Authentic Italian Cuisine',
    ],
    city_guide: `## About Mugello & Tuscany

The Mugello valley is a hidden gem of Tuscany — a broad fertile basin enclosed by the Apennine mountains, traditionally known for agriculture, olive oil, and medieval villages. The circuit sits at the valley floor near the village of Scarperia e San Piero, surrounded by rolling hills that transform into natural grandstands on race weekend. Unlike most MotoGP venues where the circuit is adjacent to a major city, Mugello is a destination in itself — visitors stay across the valley and in nearby towns like Borgo San Lorenzo and Barberino di Mugello, as well as Florence to the south.

## Food & Cuisine

Tuscan cuisine is the gold standard of Italian cooking — simple, seasonal, and product-driven. In the Mugello valley, look for **bistecca alla fiorentina** (enormous T-bone steak from Chianina beef, grilled over oak), **ribollita** (hearty bread and vegetable stew), **pappardelle al cinghiale** (broad pasta with wild boar ragù), and **lampredotto** (tripe sandwich — a Florentine street food classic). The circuit food village is one of the best on the calendar: proper Italian food stalls, local wine, and freshly made pasta. In Florence, the **Mercato Centrale** on Via dell\'Ariento and the **Sant\'Ambrogio** market are essential stops.

## Wine

You're surrounded by great wine regions. **Chianti Classico** (south of Florence) is the most famous — Sangiovese-based reds with excellent structure. **Brunello di Montalcino** and **Vino Nobile di Montepulciano** are within 90 minutes. Local Mugello wines are less celebrated but the **Pomino** DOC produces interesting whites and reds from vineyards above the valley. Every restaurant and alimentari in the area stocks excellent local bottles at very reasonable prices.

## Florence

Florence is 45 minutes south of Mugello by car or bus and is mandatory for any first visit. The **Uffizi Gallery** (book tickets well in advance) houses the world's greatest collection of Renaissance art — Botticelli's Birth of Venus, Leonardo, Michelangelo. The **Duomo** (Cathedral of Santa Maria del Fiore) with Brunelleschi's dome defines the city skyline. The **Ponte Vecchio**, **Palazzo Pitti**, and **Piazzale Michelangelo** (sunset views over the city) are all unmissable. For a race weekend visit, Thursday or the Monday after the race are ideal.

## Race Weekend at Mugello

The circuit layout is extraordinary — the back section through the Arrabbiata 1 and 2 corners is among the most spectacular in MotoGP. The Correntaio straight into the San Donato chicane is where the big overtaking moves happen. The main grandstand (Centrale) overlooks the pits and start/finish. The Correntaio and Biondetti grandstands on the back straight are stunning for sheer speed. General Admission covers the hillside areas — arrive early to secure the natural vantage points above the circuit that give views of multiple corners simultaneously.

## Getting Around the Region

A hire car is strongly recommended for Mugello — public transport to the circuit is limited. The SS65 road from Florence (via Firenzuola direction, Passo della Futa) takes about 45 minutes. On race Sunday, this road queues from 9am — follow the official diversion routes. Race weekend shuttle buses run from Florence and from circuit car parks. The nearest train stations are Borgo San Lorenzo (10 km from circuit, local SITA bus) and Firenze Santa Maria Novella (Florence main station, 45 km).`,
    getting_there_intro: 'Florence Airport (FLR) and Bologna Airport (BLQ) are the closest international airports — both around 60–75 minutes from the circuit by hire car. Pisa Airport (PSA) is 90 minutes. Florence is the main hub for the region, with high-speed Frecciarossa trains connecting to Rome (1h 30min), Milan (1h 45min), and Venice (2h). A hire car is strongly recommended for the final leg to Mugello.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Florence (FLR) or Bologna (BLQ)',
        desc: 'Florence Peretola (FLR) has direct flights from London, Paris, Amsterdam, and major Italian cities. Bologna Guglielmo Marconi (BLQ) offers broader international connections. Both are ~60–75 minutes from the circuit by hire car via the A1 motorway or SS65.',
      },
      {
        icon: '🚂',
        title: 'Train to Florence, then hire car',
        desc: 'Florence Santa Maria Novella is on the main Italian high-speed rail network — Frecciarossa trains from Rome (1h 30min), Milan (1h 45min), Venice (2h). From Florence, hire a car at the station for the 45-minute drive to Mugello. No direct train service to the circuit.',
      },
      {
        icon: '🚗',
        title: 'Drive via SS65 or A1 + SP503',
        desc: 'From Florence, take the SS65 (Via Bolognese) north through the Apennine foothills to the circuit — 45 minutes. From Bologna, A1 motorway south to Barberino di Mugello exit, then SP503 — 55 minutes. Circuit parking is ample but fills early on race Sunday.',
      },
      {
        icon: '🚌',
        title: 'Official Shuttles from Florence',
        desc: 'Race weekend shuttle buses depart from Florence Piazza della Stazione (Santa Maria Novella) and circuit car parks. Check the official circuit website for timetables — the most practical option if you\'re based in Florence without a hire car.',
      },
    ],
    where_to_stay: `## Mugello Valley (Scarperia, Borgo San Lorenzo, Barberino)

Staying in the valley is the most immersive race weekend experience. **Scarperia e San Piero** (3 km from circuit) has agriturismi and B&Bs that fill months in advance. **Borgo San Lorenzo** (10 km) is the valley's main town with a handful of hotels — **Hotel Il Fiorino** and local B&Bs. **Barberino di Mugello** (15 km, near the A1 motorway exit) has more options and is popular with teams. Book 4–6 months ahead for MotoGP weekend — the valley accommodation stock is limited and sells out early.

## Agriturismi (Farm Stays)

The Mugello countryside is dotted with beautiful agriturismi — working farms offering rooms and breakfast. Often the best-value option and genuinely memorable. Many provide dinner with their own olive oil and wine. Search on agriturismo.it or booking.com filtering for Mugello. Essential to book very early.

## Florence City Centre

Florence (45 km south) offers much larger accommodation stock and the full city experience. **Hotel Brunelleschi**, **Hotel Santa Croce**, and dozens of Airbnb options across every budget. Commute to the circuit by hire car or official shuttle. Excellent for arrival/departure days when you want proper city dining and sightseeing.

## Firenzuola (North approach)

For those driving from Bologna, **Firenzuola** on the SS65 north of the circuit is a small mountain town with basic accommodation. Quiet and convenient for early arrivals.`,
    travel_tips: [
      {
        heading: 'Book accommodation 4–6 months ahead',
        body: 'Mugello MotoGP is Italy\'s home race and the most popular on the calendar for Italian fans. Valley accommodation within 20 km of the circuit sells out faster than almost any other MotoGP round. Set a reminder and book as soon as you commit to going.',
      },
      {
        heading: 'Hire car is near-essential',
        body: 'Public transport to Mugello is sparse. Shuttle buses exist from Florence but run on limited schedules. A hire car from Florence airport or train station gives you full flexibility to reach the circuit, explore Tuscany, and avoid the queues on race Sunday morning.',
      },
      {
        heading: 'Arrive at circuit by 8am on race Sunday',
        body: 'The SS65 and approach roads to Mugello become severely congested from 9:30am on Sunday. Park-and-ride from Barberino is the recommended option if driving. Alternatively, use the shuttle from Florence and avoid the traffic entirely.',
      },
      {
        heading: 'Try the bistecca',
        body: 'Bistecca alla fiorentina from Chianina cattle is one of Italy\'s great dishes — enormous, perfectly grilled over oak coals, served rare, shared between two people. It\'s expensive (priced by weight, ~€5–8 per 100g) but worth every euro. Many circuit-area restaurants offer it on race weekend.',
      },
      {
        heading: 'Book Uffizi tickets well in advance',
        body: 'The Uffizi Gallery in Florence requires advance booking — especially in late May when tourist season is peaking alongside MotoGP weekend. Book at uffizi.it or via GetYourGuide. Without a booking, queues can be 2+ hours.',
      },
      {
        heading: 'Late May weather in Tuscany',
        body: 'Late May at Mugello is warm — typically 18–26°C — but afternoon thunderstorms are possible in the hills. Pack a light rain layer for evening. Sunscreen and a hat are essential for the circuit, which sits in an open valley with strong Mediterranean sun.',
      },
    ],
    circuit_facts: {
      Circuit: 'Autodromo Internazionale del Mugello',
      Lap: '5.245 km',
      Turns: '15',
      'First MotoGP': '1976',
      Capacity: '140,000',
      Location: 'Scarperia e San Piero, Tuscany',
    },
    faq_items: [
      {
        question: 'How do I get from Florence to Mugello circuit?',
        answer: 'By car: take the SS65 (Via Bolognese) north from Florence — about 45 minutes. On race Sunday, allow 30–45 extra minutes for traffic and arrive before 8:30am. Shuttle buses run from Florence Piazza della Stazione on race weekend. No direct train service to the circuit.',
      },
      {
        question: 'What is the weather like at Mugello MotoGP in late May?',
        answer: 'Warm and mostly sunny — 18–26°C. Late May can bring occasional afternoon thunderstorms in the Apennine hills, which sometimes create mixed-condition sessions. The valley can also be humid. Pack sunscreen for the circuit and a light rain layer for evenings.',
      },
      {
        question: 'Which grandstands are best at Mugello?',
        answer: 'The Centrale grandstand overlooks the start/finish straight and pit lane. The Correntaio grandstand on the back straight is spectacular for pure speed — bikes at 300+ km/h braking for the San Donato chicane. The Biondetti section has great views of the Arrabbiata corners. General Admission hillside areas give panoramic views of multiple sectors.',
      },
      {
        question: 'Is Florence worth visiting during MotoGP weekend?',
        answer: 'Absolutely — Florence is one of the world\'s great art cities and 45 minutes from the circuit. The Uffizi Gallery, Duomo, and Ponte Vecchio are unmissable. Book Uffizi tickets in advance (uffizi.it). Best visited Thursday before the race or Monday after.',
      },
      {
        question: 'Where should I stay for Mugello MotoGP?',
        answer: 'Accommodation in the Mugello valley (Scarperia, Borgo San Lorenzo, Barberino) fills 4–6 months ahead. Agriturismi (farm stays) are the most atmospheric option. Florence (45 km) has far more hotel stock and is a practical base with a hire car or shuttle.',
      },
      {
        question: 'What food should I try at Mugello?',
        answer: 'Bistecca alla fiorentina (Chianina T-bone steak, grilled rare), pappardelle al cinghiale (wild boar pasta), ribollita (Tuscan bean stew), and lampredotto (tripe sandwich from Florence street stalls). The circuit food village is excellent — proper Italian, not fast food.',
      },
    ],
    page_title: 'Brembo Grand Prix of Italy 2026 — Mugello MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Brembo Grand Prix of Italy at Autodromo Internazionale del Mugello. Tickets, transport from Florence, hotels, Tuscany tips, and circuit guide.',
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
