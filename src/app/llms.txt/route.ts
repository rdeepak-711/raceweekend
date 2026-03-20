import { NextResponse } from 'next/server';
import { getRacesBySeries } from '@/services/race.service';
import { SITE_URL } from '@/lib/constants/site';

const CONTACT = process.env.CONTACT_EMAIL ?? 'hello@raceweekend.co';

export async function GET() {
  const [f1Races, motogpRaces] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);

  const f1Lines = f1Races.map(r =>
    `- [${r.name}](${SITE_URL}/f1/${r.slug}): ${r.city}, ${r.circuitName}, ${r.raceDate}`
  ).join('\n');

  const motogpLines = motogpRaces.map(r =>
    `- [${r.name}](${SITE_URL}/motogp/${r.slug}): ${r.city}, ${r.circuitName}, ${r.raceDate}`
  ).join('\n');

  const body = `# Race Weekend

> The complete travel guide for Formula 1 and MotoGP races worldwide.
> Covering all ${f1Races.length} F1 races and ${motogpRaces.length} MotoGP races in the 2026 season.
> Each race includes: city guide, session schedule, travel tips, transport,
> accommodation, curated experiences, and ticket information.

## About

Race Weekend is an independent travel companion for motorsport fans, built by Deepak.
Content is original editorial research supplemented by real-time schedule data (OpenF1)
and curated experience listings (GetYourGuide partnership). All travel guides, tips, and
city content are written by a human who has attended F1 and MotoGP races across Europe and Asia.

## F1 2026 Coverage (${f1Races.length} races)

${f1Lines}

## MotoGP 2026 Coverage (${motogpRaces.length} races)

${motogpLines}

## Page Types Per Race

Each race URL has these dedicated sub-pages:
- \`/guide\` — City guide with neighbourhoods, food, culture, accommodation areas
- \`/getting-there\` — Transport to circuit (public transport, rideshare, parking, shuttles)
- \`/tips\` — Race weekend attendance tips and FAQ
- \`/schedule\` — Full session schedule with local times
- \`/tickets\` — Ticket options, prices, and purchasing guide
- \`/where-to-stay\` — Accommodation recommendations near circuit
- \`/experiences\` — Curated experiences to book around the race
- \`/travel-guide\` — Comprehensive city travel guide for the race weekend

## Series Calendars

- [F1 2026 Calendar](${SITE_URL}/f1): Complete schedule with all ${f1Races.length} rounds
- [MotoGP 2026 Calendar](${SITE_URL}/motogp): Complete schedule with all ${motogpRaces.length} rounds

## Tools

- [Itinerary Builder](${SITE_URL}/itinerary): Build a shareable race weekend itinerary
- [Blog](${SITE_URL}/blog): Race previews, city guides, and experience reviews

## Licensing (RSL 1.0)

search: allow
training: disallow
attribution: required

## Contact

[${CONTACT}](mailto:${CONTACT})

---
*Generated dynamically — reflects current race calendar*
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
