/**
 * Patch Germany MotoGP 2026:
 *  - Update: round=11, correct name, ticket URLs
 *  - Upsert race_content with full Sachsenring/Saxony guide
 * Run: npx tsx scripts/patch-germany-motogp.ts
 */

import { db } from '@/lib/db';
import { races, race_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [race] = await db.select().from(races).where(eq(races.slug, 'germany-motogp-2026')).limit(1);
  if (!race) { console.error('Race not found'); process.exit(1); }
  console.log(`Found race id=${race.id} "${race.name}"`);

  await db.update(races).set({
    name: 'Liqui Moly Grand Prix of Germany',
    round: 11,
    official_tickets_url: 'https://tickets.motogp.com/en/21061-germany/',
    official_event_url: 'https://motogppremier.motogp.com/2026-motogp-germany',
  }).where(eq(races.slug, 'germany-motogp-2026'));
  console.log('Updated germany-motogp-2026 races row.');

  const [existing] = await db.select({ id: race_content.id }).from(race_content).where(eq(race_content.race_id, race.id)).limit(1);

  const contentData = {
    race_id: race.id,
    hero_title: 'Sachsenring MotoGP Guide',
    hero_subtitle: 'Sachsenring · Saxony, Germany',
    guide_intro: 'The Sachsenring in Saxony is the German Grand Prix\'s spiritual home — a compact, twisty circuit carved into the wooded hills above Hohenstein-Ernstthal that has delivered some of MotoGP\'s most dramatic races. With its extreme run of left-hand corners and the legendary Turn 1 hairpin, the Sachsenring is technically unique and historically where Marc Márquez won 11 consecutive times. The circuit sits in the heart of the former East Germany, surrounded by industrial Saxon towns with a rich motorcycling heritage. Leipzig, 60 km north, is the cultural and accommodation hub — one of Germany\'s most exciting cities with a world-class music scene, superb food, and a fascinating post-reunification story.',
    why_city_text: 'The Sachsenring attracts the most passionate motorcycle fans in Germany — and Germany has a lot of them. Over 200,000 fans attend across the weekend, making it one of the highest-attended rounds on the calendar. The circuit\'s unique left-hand-heavy layout creates fascinating tactical racing; the hairpin at Turn 1 is the great leveller, a moment every race where championships can shift. Off-circuit, Saxony surprises visitors — Leipzig\'s cultural scene rivals Berlin at a fraction of the cost, Dresden\'s Baroque architecture is extraordinary, and the Saxon wine region along the Elbe is Germany\'s smallest and most overlooked.',
    highlights_list: [
      'Sachsenring & German Fans',
      'Leipzig Music & Culture',
      'Dresden Baroque City',
      'Saxon Wine Country',
      'East German Heritage',
    ],
    city_guide: `## About the Sachsenring & Saxony

The Sachsenring sits in the Zwickau district of Saxony, about 60 km south of Leipzig. The circuit town, Hohenstein-Ernstthal, is a modest Saxon industrial town whose entire identity revolves around the race — every shop and restaurant references the Grand Prix, and the locals have been hosting motorcycle fans since the 1920s. The circuit itself is compact (3.671 km) but intense — 13 corners, dominated by a long left-hand stretch that destroys front tyres and demands a very specific riding style. The natural bowl of wooded hills around the circuit creates an amphitheatre effect that amplifies the sound of prototypes to deafening levels.

## Leipzig

Leipzig is 60 km north of the circuit and the obvious accommodation and cultural base. It's one of Germany's most underrated cities — historically important (Bach was born and worked here, the Battle of the Nations was fought here, the 1989 peaceful revolution began here), architecturally impressive, and currently thriving as a creative and musical hub. The **Augustusplatz** is the grand civic heart, framed by the opera house and university. The **Museum of Fine Arts** (Museum der Bildenden Künste) is exceptional. The **Gewandhausorchester** is one of the world's great symphony orchestras. The nightlife in the Connewitz and Plagwitz neighbourhoods rivals Berlin for quality without the crowds.

## Food & Drink

Saxony has its own culinary identity — heavier than the rest of Germany in some ways, but with excellent local specialities. **Sauerbraten** (braised marinated beef) is the regional classic. **Thüringer Bratwurst** (grilled pork sausage with mustard) from street grills is essential race-weekend eating. Leipzig's **Lerchenberg** (lark-shaped pastry filled with marzipan and currants) is the city's traditional sweet. For beer, **Ur-Krostitzer** is the local Leipzig brewery; **Radeberger** is the Saxony classic. The craft beer scene in Leipzig's Plagwitz district has grown significantly in recent years.

## Dresden

**Dresden** is 80 km east of the circuit (and 80 km southeast of Leipzig) and one of Germany's most architecturally spectacular cities — the baroque **Zwinger** palace complex, the **Frauenkirche** (rebuilt after wartime destruction, completed 2005), the **Semperoper** opera house, and the **Grünes Gewölbe** (Green Vault) treasury are all extraordinary. Dresden is a worthy day trip on the Thursday before the race or the Monday after. The **Dresdner Stollen** (Christmas bread, sold year-round) is the food souvenir.

## Saxon Wine Region

The **Saale-Unstrut** and **Saxony** wine regions are Germany's most northerly and smallest — making wines that rarely travel outside the region. The Elbe Valley vineyards around Dresden and the Meissen area produce delicate Müller-Thurgau and Riesling. Wine tastings in village Weingüter (wineries) are excellent on a post-race Sunday afternoon drive.

## Race Weekend at the Sachsenring

The circuit is compact and spectator-friendly — almost the entire layout is visible from the hillside terraces. The **Eingang Ost** (East entrance) grandstands are popular. General Admission covers the hillsides, which fill early on race morning. The Turn 1 hairpin is the prime overtaking zone and the most photographed corner. Arrive early — the single-road access to the circuit creates enormous queues from 8am on Sunday.`,
    getting_there_intro: 'Leipzig/Halle Airport (LEJ) is the closest major airport — 60 km north of the circuit, with good European connections. Dresden Airport (DRS) is 80 km east. Frankfurt (FRA) and Berlin (BER) are 3+ hours away by car but better connected internationally. Leipzig Hauptbahnhof has excellent ICE high-speed rail connections from across Germany.',
    transport_options: [
      {
        icon: '✈️',
        title: 'Fly to Leipzig/Halle (LEJ)',
        desc: 'Leipzig/Halle Airport has connections from London, Amsterdam, Vienna, Zurich, and major German cities. 60 km north of the circuit — 45 minutes by hire car via the A72 motorway. Taxi from LEJ to Leipzig city centre is 25 minutes (€25–35).',
      },
      {
        icon: '🚂',
        title: 'ICE Train to Leipzig, then hire car',
        desc: 'Leipzig Hauptbahnhof is on the main German ICE network — Frankfurt (1h 15min), Berlin (1h 10min), Munich (2h 30min), Hamburg (2h). From Leipzig, hire a car or take a regional train to Hohenstein-Ernstthal (50 min, change at Zwickau). On race weekend, regional trains run additional services.',
      },
      {
        icon: '🚗',
        title: 'Drive via A72 motorway',
        desc: 'From Leipzig: A72 south to Hohenstein-Ernstthal exit, 45 minutes. From Dresden: A4 west then A72, 55 minutes. From Frankfurt: A4/A72, approximately 3 hours. The circuit road from the B180 gets heavily congested Sunday morning — arrive before 8am or use the park-and-ride from Glauchau.',
      },
      {
        icon: '🚌',
        title: 'Official Race Shuttles',
        desc: 'Race weekend shuttles run from Zwickau Hauptbahnhof and Chemnitz to the circuit. Regional train + shuttle is the most reliable Sunday option. Check sachsenring.de and DB regional services for race weekend timetables and additional train capacity.',
      },
    ],
    where_to_stay: `## Leipzig City Centre

Leipzig is the best base — 60 km from the circuit, excellent food and nightlife, and a great city to explore on the Thursday and Friday before racing. **Steigenberger Grandhotel Handelshof** (grand historic hotel on Augustusplatz), **Motel One Leipzig** (excellent value, city centre), and **Aparthotel Adagio Leipzig** (apartments, good for longer stays) are strong options. Book 2–3 months ahead for race weekend.

## Zwickau (20 km from circuit)

Zwickau is the closest city of any size — 20 km northwest of the circuit. **Hotel Achat Zwickau** and several smaller hotels offer convenient bases. Not a destination in itself but practical for race days with early morning sessions.

## Hohenstein-Ernstthal (Circuit Town)

The circuit town has a few guesthouses and private rooms. Limited stock but walkable to circuit gates — book many months in advance. The local hosts here have been accommodating racing fans for generations.

## Circuit Camping

The Sachsenring has camping areas immediately adjacent to the circuit — traditional German race camping with a strong community atmosphere. Book via sachsenring.de. Fills early and is popular with German fans making a long weekend of it.

## Dresden or Chemnitz

Dresden (80 km east) and Chemnitz (20 km east) offer accommodation alternatives. Chemnitz is basic but close; Dresden is worth staying in for its own sake if you arrive Thursday.`,
    travel_tips: [
      {
        heading: 'Arrive at the circuit before 8am on Sunday',
        body: 'The Sachsenring is accessed via a single main road from the B180, and queues build from 8am on race Sunday. Either use the park-and-ride from Glauchau/Zwickau with the shuttle, or arrive extremely early. The circuit opens from 7am and the early morning atmosphere is excellent.',
      },
      {
        heading: 'July in Saxony is warm but stormy',
        body: 'July temperatures reach 25–30°C but afternoon thunderstorms are common in Saxony — sometimes violent. Pack sunscreen for morning sessions and a good waterproof for afternoons. The Sachsenring drains well but the hillside terraces get slippery in rain.',
      },
      {
        heading: 'Leipzig is genuinely great',
        body: 'Many visitors are surprised by Leipzig. It\'s cheaper than Berlin, less crowded, and culturally rich — world-class classical music, excellent contemporary art, and a food and nightlife scene in Connewitz and Plagwitz that punches well above the city\'s size. Allow Thursday evening and Friday morning to explore.',
      },
      {
        heading: 'Visit the Karl Marx Monument in Chemnitz',
        body: 'Chemnitz (20 km from the circuit, formerly Karl-Marx-Stadt in the GDR) has the largest Karl Marx monument in the world — a 7-metre bronze head on a granite plinth. Unexpectedly photogenic and a fascinating piece of East German history. Easy stop on the way to or from the circuit.',
      },
      {
        heading: 'Bratwurst is mandatory',
        body: 'The Sachsenring circuit food is excellent by racing standards — proper German grilled Bratwurst, Weisswurst, Sauerkraut, and cold Radeberger. Queue early at the popular stalls. Outside the circuit, every town in Saxony has a Bratwurst grill on the high street.',
      },
      {
        heading: 'Germany uses Euro — cards widely accepted',
        body: 'Germany is more cash-dependent than most of Western Europe — many smaller restaurants and market stalls prefer cash. Carry €50–100 in notes. ATMs are plentiful in Leipzig and Zwickau. The circuit and major vendors accept card.',
      },
    ],
    circuit_facts: {
      Circuit: 'Sachsenring',
      Lap: '3.671 km',
      Turns: '13',
      'First MotoGP': '1998',
      Capacity: '230,000',
      Location: 'Hohenstein-Ernstthal, Saxony',
    },
    faq_items: [
      {
        question: 'How do I get from Leipzig to the Sachsenring?',
        answer: 'By car: A72 south toward Hohenstein-Ernstthal, approximately 45 minutes. By rail: ICE to Leipzig, then regional train to Hohenstein-Ernstthal via Zwickau (50 min total from Leipzig Hbf). On race weekend, take the regional train + official shuttle to avoid road congestion.',
      },
      {
        question: 'What is the weather like at the German MotoGP in July?',
        answer: 'Warm — typically 22–30°C — but July in Saxony can bring afternoon thunderstorms. Pack sunscreen for morning practice and a proper waterproof for afternoons. The circuit drains well but can produce unpredictable mixed-condition racing after storms.',
      },
      {
        question: 'Why is the Sachsenring famous in MotoGP history?',
        answer: 'Marc Márquez won the German Grand Prix 11 consecutive times (2010–2021) — the most dominant run at any single circuit in modern MotoGP history. The track\'s left-hand-heavy layout and unique rhythm rewards certain riding styles. It\'s also one of the loudest circuits on the calendar with 200,000+ fans creating extraordinary atmosphere.',
      },
      {
        question: 'Is Leipzig worth visiting during race weekend?',
        answer: 'Absolutely. Leipzig is 60 km north and one of Germany\'s most underrated cities — the Gewandhausorchester, Museum of Fine Arts, Bach Museum, and the Connewitz nightlife district make it a genuine destination. Thursday evening and Friday morning before sessions are ideal for exploring.',
      },
      {
        question: 'What are the best viewing spots at the Sachsenring?',
        answer: 'The hillside terraces give panoramic views of the entire back section. Turn 1 hairpin is the prime overtaking spot and most dramatic corner — grandstand seats here sell out first. General Admission on the wooded hillside between Turns 3–9 gives excellent views of multiple corners simultaneously.',
      },
      {
        question: 'Is there camping at the Sachsenring?',
        answer: 'Yes — camping is available immediately adjacent to the circuit via sachsenring.de. Fills early, especially German fans making a long weekend of it. Strong community atmosphere. Alternatively, Zwickau (20 km) or Leipzig (60 km) offer hotel accommodation with easy road or rail access.',
      },
    ],
    page_title: 'Liqui Moly Grand Prix of Germany 2026 — Sachsenring MotoGP Travel Guide',
    page_description: 'Complete guide to the 2026 MotoGP Liqui Moly Grand Prix of Germany at the Sachsenring. Tickets, transport from Leipzig, hotels, camping, Saxon food, and Germany travel tips.',
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
