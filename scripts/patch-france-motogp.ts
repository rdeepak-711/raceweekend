/**
 * Patch France MotoGP 2026:
 *  - Update: round=5, correct name, ticket URLs, race_date=2026-05-10
 *  - Upsert race_content with full Le Mans/France guide
 * Run: npx tsx scripts/patch-france-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'france-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Michelin Grand Prix of France',
    round: 5,
    race_date: '2026-05-10' as unknown as Date,
    official_tickets_url: 'https://tickets.motogp.com/en/21051-france',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-france',
  }).where(eq(races.slug, 'france-motogp-2026'));
  console.log('Updated france-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Le Mans MotoGP Guide',
    hero_subtitle: 'Bugatti Circuit · Le Mans, France',
    guide_intro: 'Le Mans is one of the most storied venues in motorsport — a city synonymous with endurance racing, high-speed drama, and passionate French fans. The Bugatti Circuit, nestled within the legendary 24 Hours track complex, has hosted MotoGP since 1969 and consistently delivers some of the most unpredictable and exciting racing of the season. Add the charm of the Loire Valley, exceptional French cuisine, and a vibrant race weekend atmosphere, and Le Mans becomes an unmissable destination on the MotoGP calendar.',
    why_city_text: 'Le Mans has a gravitational pull for motorsport fans that goes beyond the race weekend itself. You\'re riding through the same paddock, walking the same pit lane, and watching bikes attack the same Dunlop chicane that has defined motorsport history for over 50 years. The Bugatti Circuit suits MotoGP perfectly — technical, flowing, and unpredictable in changeable spring weather. When it rains at Le Mans, anything can happen.',
    highlights_list: [
      '24 Hours Circuit Legacy',
      'French Cuisine & Wine',
      'Loire Valley Day Trips',
      'Bugatti Circuit MotoGP',
      'Historic City Centre',
    ],
    city_guide: `## About Le Mans

Le Mans sits in the Sarthe department of the Pays de la Loire region, about 200 km southwest of Paris. Beyond motorsport, it\'s a city with a genuine medieval heart — the Cité Plantagenêt old town is exceptionally well preserved, with Roman walls, Renaissance mansions, and a magnificent cathedral. But for racing fans, Le Mans means one thing above all else: the Circuit de la Sarthe and its 24-hour race. The Bugatti Circuit, used for MotoGP, is built within that complex and shares its paddock and pit facilities.

## Food & Restaurants

Le Mans and the Sarthe region are underrated for food. Look for **rillettes du Mans** — a slow-cooked pork pâté that is a local speciality and available everywhere. The city centre has excellent brasseries and bistros. **Le Grenier à Sel** near the cathedral and **Le Nez Rouge** are reliable for proper French cuisine. On race weekend, the circuit food village is substantial, with crepes, andouillette sausage, and local charcuterie.

## Wine & Drinks

While not a major wine appellation itself, Le Mans is close to the Loire Valley — one of France\'s great wine regions. Muscadet, Vouvray, and Sancerre are all within 90 minutes. Local bars stock excellent Loire wines at very reasonable prices. Cidre (cider) from Normandy, just north, is also widely available.

## Exploring Le Mans City

The **Cité Plantagenêt** (old town) is a UNESCO-listed medieval district — Roman walls, half-timbered houses, and the 11th-century **Cathédrale Saint-Julien**. The **Musée de l\'Automobile de la Sarthe** on the circuit grounds has over 150 historic racing cars. Allow half a day for the museum if you\'re arriving Thursday or leaving Monday.

## Race Weekend at the Bugatti Circuit

The Bugatti Circuit is compact and spectator-friendly — most of the layout is visible from the general admission areas. The main grandstand overlooks the start/finish straight and pit lane. The Dunlop chicane (borrowed from the 24 Hours track) is the best overtaking spot and the most popular viewing area. Changeable May weather is part of the Le Mans experience — the circuit dries quickly after showers, which often creates mixed-condition chaos that MotoGP fans love.

## Day Trips

**Tours** (75 km south) is the gateway to the Loire Valley châteaux — Chambord, Chenonceau, and Villandry are all within 45 minutes. **Alençon** (50 km north) is a beautiful Norman town. **Paris** is 2 hours by TGV and a practical day trip if you arrive Thursday.`,
    getting_there_intro: 'Le Mans is exceptionally well connected by rail — TGV high-speed trains run from Paris Montparnasse in 55 minutes. The circuit is 5 km from the city centre. Paris CDG and Paris Orly airports (2h by TGV + taxi) are the most practical international entry points. There is no direct international commercial airport at Le Mans.',
    transport_options: [
      {
        icon: '🚄',
        title: 'TGV from Paris',
        desc: 'Paris Montparnasse → Le Mans in 55 minutes by TGV. Trains run every hour. Book via SNCF Connect (sncf-connect.com). Le Mans station is 5 km from the circuit — taxi takes 10 minutes.',
      },
      {
        icon: '✈️',
        title: 'Fly to Paris CDG or Orly',
        desc: 'No major international flights serve Le Mans directly. Fly into Paris CDG or Orly, then take the RER/Metro to Montparnasse and connect to the TGV. Total journey ~2.5 hours from CDG.',
      },
      {
        icon: '🚗',
        title: 'Drive from Paris',
        desc: 'Le Mans is 200 km from Paris via the A11 motorway (2 hrs). On race Sunday, traffic around the circuit is heavy from 10am — arrive by 9am or use the park-and-ride. Toll roads throughout.',
      },
      {
        icon: '🚌',
        title: 'Official Shuttles',
        desc: 'Race weekend shuttles run from Le Mans train station and city centre to the circuit gates. Check the circuit website for timetables — departures increase from 8am on race days.',
      },
    ],
    where_to_stay: `## Le Mans City Centre

Staying in the city puts you 5 km from the circuit and within walking distance of the best restaurants and the old town. **Hôtel Mercure Le Mans Centre** and **Best Western Plus Le Mans Centre** are reliable mid-range options. The **Chantecler** is a popular boutique choice. Book 3–4 months in advance as the city fills quickly for MotoGP weekend.

## Circuit Hotels

Several hotels cluster along the D338 between the city and the circuit. **Ibis Le Mans Sud** and **B&B Hotel Le Mans Université** are budget-friendly and close to the circuit gates. Practical for those focused on track time.

## Camping on the Circuit

Le Mans circuit has legendary camping — the 24 Hours camping culture carries over to MotoGP weekend. Camping inside and around the circuit is available via the official ticketing site. A uniquely immersive experience.

## Paris (for early arrivals)

If you arrive Thursday and want big-city dining and nightlife, base yourself in Paris and take the TGV down Friday morning. Many teams and riders stay in Paris for the France round.`,
    travel_tips: [
      {
        heading: 'May weather is unpredictable',
        body: 'Le Mans in May swings between warm sunshine and cold showers, sometimes within the same session. Pack waterproof layers, warm base layers for evenings, and proper waterproof shoes.',
      },
      {
        heading: 'Book TGV tickets early',
        body: 'TGV trains from Paris fill up fast for race weekend. Book on sncf-connect.com 2–3 months out. The Friday morning trains from Paris and Sunday evening return trains sell out first.',
      },
      {
        heading: 'Try the rillettes',
        body: 'Rillettes du Mans is the city\'s most famous culinary export — a spreadable pork pâté available in every supermarket and at the circuit food stalls. Buy a jar to take home.',
      },
      {
        heading: 'Arrive at circuit before 9am on race day',
        body: 'The single access road to the Bugatti Circuit gets congested from 10am on Sunday. Use the park-and-ride from Le Mans centre, or arrive early and enjoy breakfast at the circuit.',
      },
      {
        heading: 'Visit the car museum',
        body: 'The Musée de l\'Automobile de la Sarthe is on the circuit grounds and open all weekend. Over 150 historic racing cars including Le Mans winners. Entry is free with a circuit ticket.',
      },
      {
        heading: 'Cash for French markets',
        body: 'Le Mans has a Saturday morning market in the city centre (Place des Jacobins) that\'s worth exploring before qualifying. Small vendors and food stalls often prefer cash.',
      },
    ],
    circuit_facts: {
      Circuit: 'Bugatti Circuit',
      Lap: '4.185 km',
      Turns: '14',
      'First MotoGP': '1969',
      Capacity: '100,000',
      Location: 'Le Mans, Pays de la Loire',
    },
    faq_items: [
      {
        question: 'How do I get from Paris to Le Mans for MotoGP?',
        answer: 'TGV from Paris Montparnasse takes 55 minutes. Trains run hourly. Book well in advance via sncf-connect.com. By car, the A11 motorway is ~2 hours. Le Mans station is 5 km from the circuit.',
      },
      {
        question: 'What is the weather like at the France MotoGP in May?',
        answer: 'Variable — temperatures typically 12–22°C but changeable. May in Le Mans can bring warm sunshine or cold rain, sometimes within the same day. Always pack waterproof gear and a warm layer for evenings.',
      },
      {
        question: 'Can I visit the 24 Hours circuit during MotoGP weekend?',
        answer: 'Yes — the Bugatti Circuit is built within the 24 Hours track complex. You can walk or drive sections of the famous 24 Hours layout from the paddock. The Musée de l\'Automobile is also on site and highly recommended.',
      },
      {
        question: 'What are the best viewing spots at Le Mans MotoGP?',
        answer: 'The Dunlop chicane (Turn 3) is the most iconic viewing point and the best overtaking spot. The main grandstand has a clear view of the start/finish. General Admission lets you roam freely — the infield hilly sections give great views of multiple corners.',
      },
      {
        question: 'Is there camping at the Le Mans MotoGP circuit?',
        answer: 'Yes — Le Mans has a strong camping tradition from the 24 Hours race. Campsites within and around the circuit are available through official ticketing. Book early as they sell out months in advance.',
      },
      {
        question: 'What is the best local food to try at Le Mans?',
        answer: 'Rillettes du Mans is the essential local dish — a rich, spreadable pork pâté. Also look for andouillette sausage, Loire Valley wines (Muscadet, Vouvray), and local farm cheeses. The Saturday market in Place des Jacobins is worth visiting before qualifying.',
      },
    ],
    page_title: 'Michelin Grand Prix of France 2026 — Le Mans MotoGP Travel Guide',
    page_description: 'Your complete guide to attending the 2026 MotoGP Michelin Grand Prix of France at the Bugatti Circuit, Le Mans. Tickets, TGV trains, hotels, camping, French food, and tips.',
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
