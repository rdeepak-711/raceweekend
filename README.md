# raceweekend

F1 & MotoGP 2026 travel platform. Aggregates race schedules, local experiences (GetYourGuide), event tickets (Ticketmaster), live telemetry (OpenF1), and AI-generated travel guides across 24 F1 + 22 MotoGP races.

## Stack

- **Framework**: Next.js 16, React 19 (with React Compiler), TypeScript
- **Database**: MySQL via Drizzle ORM
- **Styling**: Tailwind CSS 4.2, Framer Motion 12
- **AI**: Claude (Anthropic), Gemini (Google)
- **External APIs**: OpenF1, GetYourGuide, Ticketmaster, SportsDB, Pulselive
- **Dev port**: 3002

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your env vars
npm run db:push        # push schema to MySQL
npm run seed:f1        # seed F1 2026 races + sessions
npm run seed:motogp    # seed MotoGP 2026 races + sessions
npm run seed:content   # seed race content / SEO
npm run dev            # start dev server at http://localhost:3002
```

## Environment Variables

```
DATABASE_HOST
DATABASE_PORT
DATABASE_USER
DATABASE_PASSWORD
DATABASE_NAME
GYG_PARTNER_ID
TICKETMASTER_API_KEY
TICKETMASTER_AFFILIATE_ID
CONTACT_EMAIL
NEXT_PUBLIC_GA_MEASUREMENT_ID
OPENF1_BASE_URL
```

## Key Commands

```bash
npm run dev              # dev server (port 3002)
npm run build            # production build
npm run db:push          # push schema changes
npm run db:generate      # generate Drizzle migrations

# GYG pipeline (run from repo root via npm scripts)
npm run pipeline:f1:melbourne
npm run pipeline:motogp:thailand
# ...see package.json for all race pipelines

# Python pipeline (alternative)
cd pipeline && python main.py --race barcelona-2026
```

## Project Structure

```
src/app/             Next.js App Router pages
src/components/      React components (47 files)
src/services/        Service layer (race, experience, ticket, itinerary)
src/lib/             DB, API clients, constants, utilities
src/types/           TypeScript interfaces
src/context/         React contexts (Series, Currency)
src/hooks/           Custom hooks
pipeline/            Python GYG data pipeline + TOML race configs
scripts/             TypeScript seeding & utility scripts
public/races/        Race hero + gallery images
public/tracks/       Circuit layout images (AVIF)
drizzle/             DB migrations
```

## Routes

```
/                          Homepage
/f1                        F1 2026 calendar
/motogp                    MotoGP 2026 calendar
/f1/[raceSlug]             Race overview
/f1/[raceSlug]/schedule    Session timetable
/f1/[raceSlug]/experiences Activities
/f1/[raceSlug]/guide       Race guide & FAQ
/f1/[raceSlug]/tickets     Event tickets
/itinerary                 Itinerary builder
/itinerary/[id]            Shareable itinerary
```

MotoGP routes mirror the F1 structure under `/motogp/[raceSlug]/`.
