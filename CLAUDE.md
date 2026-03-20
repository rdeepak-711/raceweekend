# raceweekend — Claude Code Context

## What This Is
F1 & MotoGP 2026 travel platform. Aggregates race schedules, local experiences (GetYourGuide), event tickets (Ticketmaster), live telemetry (OpenF1), and AI-generated travel guides. Supports 24 F1 + 22 MotoGP races with itinerary building, shareable trip plans, and affiliate monetization.

**Production**: raceweekend.co — deployed on Vercel, database on TiDB Cloud (MySQL-compatible).

---

## v2.0 Direction — Current Focus

v2.0 is about turning raceweekend into a high-authority content destination, not just a data aggregator. Four pillars:

### 1. Experiences (Primary Revenue Driver)
- Deepen GYG experience pages — richer detail pages, better photos, reviews, highlights
- Improve experience discovery: smarter filtering, search, recommendation engine
- Experience windows: match activities to session gaps in the race schedule
- Affiliate click tracking already in place — optimize conversion paths
- Pipeline covers all 24 F1 + 22 MotoGP races via TOML configs

### 2. SEO / AEO / GEO (Growth Engine)
- Every race page = a structured SEO content hub (title, description, FAQs, JSON-LD, OG images)
- JSON-LD schemas in use: BreadcrumbList, FAQPage, Article, SportsEvent
- Target: rank for "[city] F1 2026 experiences", "[city] MotoGP travel guide", etc.
- AEO: FAQ content structured for AI answer extraction
- GEO: City guides, getting-there, where-to-stay pages per race
- `seo-aeo-geo-strategist` agent available for page-level audits
- `race_content` table holds all SEO copy — title, description, keywords, guides, FAQs, circuit facts

### 3. Blogging (In Progress — Not Yet Built)
- Planned route: `/blog`, `/blog/[slug]`
- Content types: race previews, experience reviews, city guides, F1/MotoGP news
- AI-assisted content generation (Claude/Gemini pipeline already in place)
- Blog posts will link internally to race pages and experience detail pages
- Will need: `blog_posts` DB table, `blog.service.ts`, MDX or DB-backed content

### 4. Races (Content Hubs)
- Each race = a multi-page content hub (overview, schedule, experiences, guide, tickets, tips, travel-guide, getting-there, where-to-stay)
- Race pages drive internal linking to experiences and blog posts
- `official_event_url` + `official_tickets_url` columns support direct ticket links
- Race themes (accent colors, glow) give each race visual identity

---

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack, cacheComponents: true), TypeScript, React 19 (React Compiler)
- **Database**: MySQL via Drizzle ORM — local dev + TiDB Cloud (prod)
- **Styling**: Tailwind CSS 4.2, Framer Motion 12
- **AI**: `@anthropic-ai/sdk` (Claude), `@google/generative-ai` (Gemini for content gen)
- **External APIs**: OpenF1 (live F1 data), GetYourGuide (experiences), Ticketmaster/Impact.com (tickets), SportsDB (MotoGP)
- **Validation**: Zod
- **Dev port**: 3002

### cacheComponents: true — Key Rules
- `Date.now()` / `new Date()` in Server Components must come AFTER a recognized dynamic data source
- Recognized sources: `fetch()`, `cookies()`, `headers()`, `connection()`, `searchParams`
- Drizzle DB queries are NOT recognized — use `await connection()` from `next/server` before any `Date.now()` calls
- `export const dynamic = 'force-dynamic'` is INCOMPATIBLE — use `await connection()` or `await headers()` instead
- `export const revalidate = N` is INCOMPATIBLE — remove from all route segments
- `getRaceBySlug()` calls `await connection()` — so any page that calls it first is safe

---

## Key Directories
```
src/app/f1/[raceSlug]/         F1 race pages (schedule, experiences, guide, tickets, tips, travel-guide, getting-there, where-to-stay)
src/app/motogp/[raceSlug]/     MotoGP race pages (same structure)
src/app/itinerary/             Itinerary builder & viewer
src/app/api/                   API routes
src/components/
  experiences/                 ExperiencesClient, ExperienceCard, ExperienceSuggestions, ExperienceTOC, FeaturedExperiences, PhotoSlider
  itinerary/                   ItineraryBuilder, ItineraryView
  layout/                      Nav, NavWrapper, Footer, CustomCursor, ScrollProgressBar, HomepageHero, AnimatedHero, LoadingScreen, ErrorState, UpcomingRacesStrip, FeatureRevealStrip, TabbedCalendar, TelemetryVisualizer, RaceImage
  race/                        RaceHero, RaceCard, RaceCardsGrid, RaceCountdown, RaceNavGrid, RaceSchedule, RaceGallery, RaceSubNav, RaceOverviewHeader, GuideNavCards, GuideAccordion, RelatedRaces, SeriesBadge, SeriesLandingClient, SeriesCalendarFilters, PageBreadcrumb, LiveStatusBar, SessionLiveWidget, LiveWeather, LiveLeaderboard, LiveTacticalHub
  tickets/                     TicketsClient, TicketCard, TicketSidebarCTA, OfficialTicketsBanner
src/services/                  Service layer (race, experience, ticket, itinerary)
src/lib/db/                    Drizzle schema + DB init (MySQL)
src/lib/api/                   External API clients (openf1, ticketmaster, motogp, sportsdb)
src/lib/constants/             Series metadata, category colors, race themes, icons
src/lib/affiliates.ts          GYG & Ticketmaster affiliate URL builders
src/types/                     TypeScript interfaces
pipeline/                      Python GYG data pipeline + TOML race configs (24 F1 + 22 MotoGP)
scripts/                       TypeScript seeding & patch scripts (50+ files)
drizzle/                       DB migrations
public/races/                  Race-specific images (hero, circuit, gallery)
public/tracks/                 Track/circuit layout images (AVIF)
```

---

## Database Tables (10 tables)
| Table | Purpose | Key Columns |
|---|---|---|
| `races` | F1/MotoGP race definitions | series, slug, name, season, round, circuit_name, city, country, timezone, race_date, flag_emoji, is_active, is_cancelled, official_tickets_url, official_event_url, theme_accent/alt/glow |
| `sessions` | Race weekend sessions | race_id, name, short_name, session_type (fp1-3/qualifying/sprint/race/warmup/practice/support/event), day_of_week, start/end_time |
| `experiences` | GetYourGuide activities (43 cols) | race_id, title, slug, category (food/culture/adventure/daytrip/nightlife), pricing, ratings, photos (JSON), affiliate_url, faq_items/highlights/includes/excludes (JSON) |
| `experience_windows` | Time windows mapping activities to sessions | race_id, day_of_week, start/end_time, slug, label |
| `experience_windows_map` | Junction: experiences ↔ windows | experience_id + window_id (composite PK) |
| `race_content` | SEO metadata, guides, FAQs (21 cols) | race_id, page_title/desc/keywords, guide_intro, tips, faq_items, faq_ld, circuit_facts, getting_there, where_to_stay, transport_options, city_guide, hero_title/subtitle, why_city_text, travel_tips |
| `tickets` | Ticketmaster event tickets | race_id, tm_event_id, title, category, price_min/max, ticket_url, last_synced_at |
| `itineraries` | User-created shareable trip plans | id (nanoid), race_id, sessions_selected (JSON), experiences_selected (JSON), itinerary_json |
| `affiliate_clicks` | Click analytics for affiliate links | experience_id, source, session_id, user_agent |
| `contacts` | Contact form submissions | name, email, subject, message, status |

---

## Services Layer
| Service | Key Functions |
|---|---|
| `race.service.ts` | `getRaceBySlug()` ← calls `connection()` first, `getRacesBySeries()`, `getSessionsByRace()`, `getRaceWithSessions()`, `getRaceContent()`, `getActiveRaceBySeries()`, `getNearbyRaces()` |
| `experience.service.ts` | `getExperiencesByRace()`, `getExperienceBySlug()`, `getFeaturedExperiences()` + filtering/sorting |
| `ticket.service.ts` | `getTicketsByRace()` with 6h TTL cache + Ticketmaster fallback — calls `connection()` |
| `itinerary.service.ts` | `createItinerary()`, `getItineraryById()`, view count increment |

---

## API Routes
```
GET  /api/experiences              Filtered experiences (race, category, sort, window)
GET  /api/tickets                  Tickets by raceId (6h TTL)
POST /api/itinerary                Create itinerary (Zod validated)
GET  /api/itinerary/[id]           Fetch itinerary
GET  /api/itinerary/[id]/calendar  Export as iCalendar (.ics)
POST /api/click                    Log affiliate click
GET  /go/[type]/[id]               Affiliate redirect tracker
GET  /api/exchange-rates           Currency rates (1h cache)
GET  /api/live-session             Current live F1 session (60s revalidate)
GET  /api/openf1/leaderboard       Race positions
GET  /api/openf1/weather           Live weather
GET  /api/openf1/telemetry         Speed/throttle/brake data
```

---

## Route Structure
```
/                              Homepage
/f1                            F1 2026 calendar
/motogp                        MotoGP 2026 calendar
/f1/[raceSlug]                 Race overview (hub page)
/f1/[raceSlug]/schedule        Session timetable
/f1/[raceSlug]/experiences     Experience listing + filtering
/f1/[raceSlug]/experiences/[slug]  Experience detail page
/f1/[raceSlug]/guide           Race guide + FAQ
/f1/[raceSlug]/tickets         Event tickets
/f1/[raceSlug]/getting-there   Transport guide
/f1/[raceSlug]/where-to-stay   Accommodation guide
/f1/[raceSlug]/tips            Race tips
/f1/[raceSlug]/travel-guide    City guide
/motogp/[raceSlug]/...         (same sub-routes as F1)
/itinerary                     Builder interface
/itinerary/[id]                Shareable itinerary
/go/[type]/[id]                Affiliate redirect tracker
/about, /contact, /privacy, /terms, /site-directory
```

**Planned v2.0 routes:**
```
/blog                          Blog index
/blog/[slug]                   Blog post
/experiences                   Cross-race experience discovery (all series)
```

---

## Common Dev Commands
```bash
npm run dev                    # Start dev server (port 3002, --webpack flag)
npm run build                  # Production build (Turbopack)
npm run db:push                # Push schema to local MySQL (--force)
npm run db:push:tidb           # Push schema to TiDB Cloud
npm run db:sync                # Sync local MySQL data → TiDB Cloud (truncate + reimport)
npm run db:generate            # Generate Drizzle migrations
npm run seed:f1                # Seed F1 2026 races + sessions
npm run seed:motogp            # Seed MotoGP 2026 races + sessions
npm run seed:content           # Populate race_content table
npm run pipeline:f1:melbourne  # GYG pipeline for specific F1 race
npm run pipeline:motogp:thailand # GYG pipeline for specific MotoGP race
```

## DB Sync to TiDB Cloud
`npm run db:sync` — exports races/sessions/race_content/experiences/tickets from local MySQL → TiDB Cloud. Safe to re-run (truncates content tables, skips itineraries/clicks/contacts). Requires `TIDB_HOST`, `TIDB_USER`, `TIDB_PASSWORD`, `TIDB_DB` in `~/Desktop/.secrets/raceweekend.env`.

---

## Data Pipeline (`pipeline/`)
Python pipeline that fetches GYG experiences and seeds the DB.
```bash
cd raceweekend/pipeline && python main.py --race barcelona-2026
cd raceweekend/pipeline && python main.py --race barcelona-2026 --start-over
```
- Race configs: `pipeline/races/*.toml` (24 F1 + 22 MotoGP) — copy `_template.toml` to add a new race
- TOML sections: `[race]` metadata, `[gyg]` search config, `[pipeline]` scoring/content, `[schedule]` session times
- DB seeder: `pipeline/rw_db_seeder.py`
- Content AI: `pipeline/rw_content_generator.py` (Gemini)
- Output: `pipeline/output/` (JSON files)
- City guides: `pipeline/city-guides/` (JSON locale content)

---

## Experience Categories
| Category | Color | Emoji |
|---|---|---|
| food | #FF6B35 | 🍜 |
| culture | #A855F7 | ⛩️ |
| adventure | #22C55E | 🏔️ |
| daytrip | #3B82F6 | ✈️ |
| nightlife | #EC4899 | 🌙 |

---

## Environment Variables
```
# Local DB
DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME
# TiDB Cloud
DATABASE_URL (production connection string)
TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD, TIDB_DB
# APIs
GYG_PARTNER_ID
TICKETMASTER_API_KEY, TICKETMASTER_AFFILIATE_ID
OPENF1_BASE_URL
# App
CONTACT_EMAIL
NEXT_PUBLIC_GA_MEASUREMENT_ID
```

---

## Agents Available
- `seo-aeo-geo-strategist` — SEO/AEO/GEO optimization per page (inherited from root)
- `ui-design-auditor` — UI/UX design review (inherited from root)

## Docs
- Architecture overview: `../docs/ARCHITECTURE.md`
- GYG pipeline reference: `../docs/GYG-PIPELINE.md`
