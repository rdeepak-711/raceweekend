# raceweekend — Claude Code Context

## What This Is
F1 & MotoGP 2026 travel platform. Aggregates race schedules, local experiences (GetYourGuide), event tickets (Ticketmaster), live telemetry (OpenF1), and AI-generated travel guides. Supports 24 F1 + 22 MotoGP races with itinerary building, shareable trip plans, and affiliate monetization.

## Stack
- **Framework**: Next.js 16 (App Router), TypeScript, React 19 (with React Compiler)
- **Database**: MySQL via Drizzle ORM (`src/lib/db/schema.ts`, `drizzle.config.ts`)
- **Styling**: Tailwind CSS 4.2, Framer Motion 12
- **AI**: `@anthropic-ai/sdk` (Claude), `@google/generative-ai` (Gemini for content gen)
- **External APIs**: OpenF1 (live F1 data), GetYourGuide (experiences), Ticketmaster/Impact.com (tickets), SportsDB (MotoGP), Pulselive (MotoGP community API)
- **Validation**: Zod
- **Dev port**: 3002

## Key Directories
```
src/app/f1/[raceSlug]/     F1 race pages (schedule, experiences, guide, tickets, etc.)
src/app/motogp/[raceSlug]/ MotoGP race pages (same structure)
src/app/itinerary/         Itinerary builder & viewer
src/app/api/               API routes (experiences, tickets, itinerary, openf1, live-session, click)
src/components/            React components (47 files)
  contact/                 ContactForm
  experiences/             ExperiencesClient, ExperienceCard, ExperienceSuggestions, ExperienceTOC, FeaturedExperiences, PhotoSlider
  itinerary/               ItineraryBuilder, ItineraryView
  layout/                  Nav, NavWrapper, Footer, CustomCursor, ScrollProgressBar, HomepageHero, AnimatedHero, LoadingScreen, ErrorState, UpcomingRacesStrip, FeatureRevealStrip, TabbedCalendar, TelemetryVisualizer, RaceImage
  race/                    RaceHero, RaceCard, RaceCardsGrid, RaceCountdown, RaceNavGrid, RaceSchedule, RaceGallery, RaceSubNav, RaceOverviewHeader, GuideNavCards, GuideAccordion, RelatedRaces, SeriesBadge, SeriesLandingClient, SeriesCalendarFilters, PageBreadcrumb, LiveStatusBar, SessionLiveWidget, LiveWeather, LiveLeaderboard, LiveTacticalHub
  tickets/                 TicketsClient, TicketCard, TicketSidebarCTA
src/services/              Service layer (race, experience, ticket, itinerary)
src/lib/db/                Drizzle schema + DB init (MySQL, connection pooling)
src/lib/api/               External API clients (openf1, ticketmaster, motogp, sportsdb)
src/lib/constants/         Series metadata, category colors, race themes, icons
src/lib/affiliates.ts      GYG & Ticketmaster affiliate URL builders
src/lib/activeRace.ts      Get next upcoming race slug
src/lib/staticParams.ts    Pre-generate static pages for all races
src/lib/utils.ts           generateId, slugify, formatPrice, formatTime, formatDate, timezone helpers
src/types/                 TypeScript interfaces (race, experience, ticket, itinerary)
src/context/               React contexts (SeriesContext, CurrencyContext)
src/hooks/                 useCountUp (animated counter)
pipeline/                  Python GYG data pipeline + TOML race configs
scripts/                   TypeScript seeding & utility scripts (13 files)
drizzle/                   DB migrations
public/races/              Race-specific images (hero, circuit, gallery)
public/tracks/             Track/circuit layout images (AVIF)
designs/                   Pencil design files
```

## Database Tables (10 tables)
| Table | Purpose | Key Columns |
|---|---|---|
| `races` | F1/MotoGP race definitions (28 cols) | series, slug, name, season, round, circuit, city, country, timezone, race_date, theme colors |
| `sessions` | Race weekend sessions | race_id, name, short_name, session_type (fp1-3/qualifying/sprint/race/warmup/practice/support/event), day_of_week, start/end_time |
| `experiences` | GetYourGuide activities (43 cols) | race_id, title, slug, category (food/culture/adventure/daytrip/nightlife), pricing, ratings, photos (JSON), affiliate_url, faq_items (JSON), highlights/includes/excludes (JSON) |
| `experience_windows` | Time windows mapping activities to sessions | race_id, day_of_week, start/end_time, slug, label |
| `experience_windows_map` | Junction: experiences ↔ windows | experience_id + window_id (composite PK) |
| `race_content` | SEO metadata, guides, FAQs, circuit facts (21 cols) | race_id, page_title/desc/keywords, guide_intro, tips, faq_items, faq_ld, circuit_facts, getting_there, where_to_stay, transport_options |
| `tickets` | Ticketmaster event tickets | race_id, tm_event_id, title, category, price_min/max, quantity_available, ticket_url |
| `itineraries` | User-created shareable trip plans | id (nanoid), race_id, sessions_selected (JSON), experiences_selected (JSON), itinerary_json |
| `affiliate_clicks` | Click analytics for affiliate links | experience_id, source (feed/itinerary/featured/map/guide/ticket/hero/sidebar), session_id, user_agent |
| `contacts` | Contact form submissions | name, email, subject, message, status (new/read/replied/archived) |

## Services Layer
| Service | Key Functions |
|---|---|
| `race.service.ts` | `getRaceBySlug()`, `getRacesBySeries()`, `getSessionsByRace()`, `getActiveRaceBySeries()`, `getNearbyRaces()` |
| `experience.service.ts` | `getExperiencesByRace()`, `getExperienceBySlug()`, `getFeaturedExperiences()` + filtering/sorting |
| `ticket.service.ts` | `getTicketsByRace()` with TTL caching, Ticketmaster integration |
| `itinerary.service.ts` | `createItinerary()`, `getItineraryById()`, view count increment |

## API Routes (11 endpoints)
```
GET  /api/experiences          Filtered experiences (race, category, partner, sort, window) — ISR 3600s
GET  /api/tickets              Tickets by raceId — ISR 6h
POST /api/itinerary            Create itinerary (Zod validated)
GET  /api/itinerary/[id]       Fetch itinerary
GET  /api/itinerary/[id]/calendar  Export as iCalendar (.ics)
POST /api/click                Log affiliate click (source, session, UA, referer)
GET  /go/[type]/[id]           Affiliate redirect tracker
GET  /api/live-session         Current live F1 session (60s revalidate)
GET  /api/openf1/leaderboard   Race positions & driver details
GET  /api/openf1/weather       Live weather conditions
GET  /api/openf1/telemetry     Speed, throttle, brake data
```

## Route Structure
```
/                              Homepage (live telemetry, upcoming races)
/f1                            F1 2026 calendar
/motogp                        MotoGP 2026 calendar
/f1/[raceSlug]                 Race overview
/f1/[raceSlug]/schedule        Session timetable
/f1/[raceSlug]/experiences     Activities & experiences
/f1/[raceSlug]/experiences/[slug]  Experience detail
/f1/[raceSlug]/guide           Race guide & FAQ
/f1/[raceSlug]/tickets         Event tickets
/f1/[raceSlug]/getting-there   Travel guide
/f1/[raceSlug]/where-to-stay   Accommodation
/f1/[raceSlug]/tips            Race tips
/f1/[raceSlug]/travel-guide    City guide
/motogp/[raceSlug]/...         (same sub-routes as F1)
/itinerary                     Builder interface
/itinerary/[id]                Shareable itinerary
/go/[type]/[id]                Affiliate redirect tracker
/about, /contact, /privacy, /terms, /site-directory
```

## Common Dev Commands
```bash
npm run dev                          # Start dev server (port 3002)
npm run build                        # Production build
npm run db:push                      # Push schema to MySQL (--force)
npm run db:generate                  # Generate Drizzle migrations
npm run seed:f1                      # Seed F1 2026 races + sessions
npm run seed:motogp                  # Seed MotoGP 2026 races + sessions
npm run seed:content                 # Populate race_content table
npm run pipeline:f1:melbourne       # GYG pipeline for specific F1 race
npm run pipeline:motogp:thailand    # GYG pipeline for specific MotoGP race
npx tsx scripts/sync-from-pitlane.ts # Sync from f1weekend DB
```

## Common Tasks — Which Script to Use
| Task | Script |
|---|---|
| Add new F1/MotoGP races | `scripts/seed-races.ts` |
| Seed race content/SEO | `scripts/seed-race-content.ts` |
| Set up experience windows | `scripts/seed-experience-windows.ts` |
| Seed session schedules | `scripts/seed-sessions.ts` |
| Set race theme colors | `scripts/seed-race-themes.ts` |
| Patch schedule data | `scripts/patch-*.ts` |
| Sync from f1weekend | `scripts/sync-from-pitlane.ts` |
| Init database | `scripts/init-db.ts` |

## Data Pipeline (`pipeline/`)
Python pipeline that fetches GYG experiences and seeds the raceweekend MySQL DB.

```bash
cd raceweekend/pipeline && python main.py --race barcelona-2026
cd raceweekend/pipeline && python main.py --race barcelona-2026 --start-over
```

- Race configs: `pipeline/races/*.toml` (24 F1 + 10+ MotoGP) — copy `_template.toml` to add a new race
- TOML sections: `[race]` metadata, `[gyg]` search config, `[pipeline]` scoring/content agents, `[schedule]` session times
- Shared modules: `getyourguideapi/shared/` (gyg_client, experience_ranker, etc.)
- DB seeder: `pipeline/rw_db_seeder.py`
- Content AI: `pipeline/rw_content_generator.py` (Gemini)
- Ticket fetcher: `pipeline/tickets_client.py`
- Output: `pipeline/output/` (JSON files)
- City guides: `pipeline/city-guides/` (JSON locale content)

## Key Features
- **Live Racing**: Session status, leaderboard, weather, telemetry visualization (OpenF1) — LiveTacticalHub, LiveLeaderboard, LiveWeather, LiveStatusBar, SessionLiveWidget, TelemetryVisualizer
- **Itinerary Builder**: Multi-step drag-and-drop trip planner with iCalendar export (@dnd-kit)
- **Affiliate Monetization**: GYG (partner OWXIEN9) + Ticketmaster (Impact.com) with click tracking & analytics
- **Multi-series**: F1 & MotoGP with series-specific theming, accent colors, and SeriesContext
- **Experience Windows**: Activities mapped to race session gaps (e.g., "Friday evening between FP2 and FP3")
- **Currency Conversion**: Client-side multi-currency support (USD, EUR, GBP, AUD, CAD, JPY) via CurrencyContext
- **SEO-First Content**: AI-generated guides, FAQs (with JSON-LD), circuit facts, travel tips per race

## Experience Categories
| Category | Color | Emoji |
|---|---|---|
| food | #FF6B35 | 🍜 |
| culture | #A855F7 | ⛩️ |
| adventure | #22C55E | 🏔️ |
| daytrip | #3B82F6 | ✈️ |
| nightlife | #EC4899 | 🌙 |

## Environment Variables
```
DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME
GYG_PARTNER_ID
TICKETMASTER_API_KEY, TICKETMASTER_AFFILIATE_ID
CONTACT_EMAIL
NEXT_PUBLIC_GA_MEASUREMENT_ID
OPENF1_BASE_URL
```

## Agents Available
- `ui-design-auditor` — UI/UX design review (inherited from root)
- `seo-aeo-geo-strategist` — SEO/AEO/GEO optimization (inherited from root)

## Docs
- Architecture overview: `../docs/ARCHITECTURE.md`
- GYG pipeline reference: `../docs/GYG-PIPELINE.md`
