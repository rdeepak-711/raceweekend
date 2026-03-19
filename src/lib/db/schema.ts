import {
  mysqlTable, int, varchar, year, decimal, char, date, timestamp,
  mysqlEnum, time, boolean, json, bigint, primaryKey, text, longtext,
  unique, index
} from "drizzle-orm/mysql-core";

export const races = mysqlTable("races", {
  id:            int("id").primaryKey().autoincrement(),
  series:        mysqlEnum("series", ["f1", "motogp"]).notNull().default("f1"),
  slug:          varchar("slug", { length: 100 }).unique(),
  name:          varchar("name", { length: 255 }),
  season:        year("season"),
  round:         int("round"),
  circuit_name:  varchar("circuit_name", { length: 255 }),
  city:          varchar("city", { length: 100 }),
  country:       varchar("country", { length: 100 }),
  country_code:  char("country_code", { length: 2 }),
  circuit_lat:   decimal("circuit_lat", { precision: 10, scale: 6 }),
  circuit_lng:   decimal("circuit_lng", { precision: 10, scale: 6 }),
  timezone:      varchar("timezone", { length: 50 }),
  race_date:     date("race_date"),
  flag_emoji:    varchar("flag_emoji", { length: 10 }),
  is_active:     boolean("is_active").default(true),
  is_cancelled:  boolean("is_cancelled").default(false),
  official_tickets_url: varchar("official_tickets_url", { length: 500 }),
  official_event_url: varchar("official_event_url", { length: 500 }),
  theme_accent:     varchar("theme_accent", { length: 30 }),
  theme_accent_alt: varchar("theme_accent_alt", { length: 30 }),
  theme_glow:       varchar("theme_glow", { length: 60 }),
  created_at:    timestamp("created_at").defaultNow(),
});

export const sessions = mysqlTable("sessions", {
  id:           int("id").primaryKey().autoincrement(),
  race_id:      int("race_id").references(() => races.id),
  name:         varchar("name", { length: 100 }),
  short_name:   varchar("short_name", { length: 20 }),
  session_type: mysqlEnum("session_type", ["fp1", "fp2", "fp3", "qualifying", "sprint", "race", "warmup", "practice", "support", "event"]),
  day_of_week:  mysqlEnum("day_of_week", ["Thursday", "Friday", "Saturday", "Sunday"]),
  start_time:   time("start_time"),
  end_time:     time("end_time"),
  series_key:   varchar("series_key", { length: 50 }),
  series_label: varchar("series_label", { length: 100 }),
  created_at:   timestamp("created_at").defaultNow(),
}, (table) => ({
  ux_session_full: unique("ux_session_full").on(table.race_id, table.day_of_week, table.start_time, table.short_name),
  race_id_idx: index("race_id_idx").on(table.race_id),
}));

export const experience_windows = mysqlTable("experience_windows", {
  id:                int("id").primaryKey().autoincrement(),
  race_id:           int("race_id").references(() => races.id),
  slug:              varchar("slug", { length: 50 }),
  label:             varchar("label", { length: 100 }),
  day_of_week:       mysqlEnum("day_of_week", ["Thursday", "Friday", "Saturday", "Sunday"]),
  start_time:        time("start_time"),
  end_time:          time("end_time"),
  max_duration_hours: decimal("max_duration_hours", { precision: 3, scale: 1 }),
  description:       text("description"),
  sort_order:        int("sort_order"),
  created_at:        timestamp("created_at").defaultNow(),
}, (table) => ({
  ux_window_race_slug: unique("ux_window_race_slug").on(table.race_id, table.slug),
}));

export const experiences = mysqlTable("experiences", {
  id:                    int("id").primaryKey().autoincrement(),
  race_id:               int("race_id").references(() => races.id),
  title:                 varchar("title", { length: 255 }),
  slug:                  varchar("slug", { length: 255 }),
  category:              mysqlEnum("category", ["food", "culture", "adventure", "daytrip", "nightlife"]),
  description:           text("description"),
  short_description:     varchar("short_description", { length: 500 }),
  abstract:              text("abstract"),
  price_amount:          decimal("price_amount", { precision: 10, scale: 2 }),
  price_currency:        varchar("price_currency", { length: 3 }),
  price_label:           varchar("price_label", { length: 50 }),
  duration_hours:        decimal("duration_hours", { precision: 3, scale: 1 }),
  duration_label:        varchar("duration_label", { length: 50 }),
  rating:                decimal("rating", { precision: 3, scale: 1 }),
  review_count:          int("review_count"),
  image_url:             varchar("image_url", { length: 500 }),
  image_emoji:           varchar("image_emoji", { length: 10 }),
  photos:                json("photos"),            // string[]
  affiliate_url:         varchar("affiliate_url", { length: 1000 }),
  affiliate_product_id:  varchar("affiliate_product_id", { length: 100 }),
  highlights:            json("highlights"),         // string[]
  includes:              json("includes"),           // string[]
  excludes:              json("excludes"),           // string[]
  important_info:        text("important_info"),
  reviews_snapshot:      json("reviews_snapshot"),  // ReviewSnapshot[]
  f1_context:            text("f1_context"),
  guide_article:         longtext("guide_article"),
  faq_items:             json("faq_items"),          // FAQItem[]
  meeting_point:         text("meeting_point"),
  bestseller:            boolean("bestseller"),
  original_price:        decimal("original_price", { precision: 10, scale: 2 }),
  discount_pct:          int("discount_pct"),
  has_pick_up:           boolean("has_pick_up"),
  mobile_voucher:        boolean("mobile_voucher"),
  instant_confirmation:  boolean("instant_confirmation"),
  skip_the_line:         boolean("skip_the_line"),
  options_snapshot:      json("options_snapshot"),  // OptionSnapshot[]
  seo_keywords:          json("seo_keywords"),      // string[]
  lat:                   decimal("lat", { precision: 10, scale: 7 }),
  lng:                   decimal("lng", { precision: 10, scale: 7 }),
  languages:             json("languages"),          // string[]
  distance_km:           decimal("distance_km", { precision: 10, scale: 2 }),
  neighborhood:          varchar("neighborhood", { length: 100 }),
  travel_mins:           int("travel_mins"),
  sort_order:            int("sort_order"),
  is_featured:           boolean("is_featured").default(false),
  affiliate_partner:     varchar("affiliate_partner", { length: 32 }).notNull().default("getyourguide"),
  source_event_id:       varchar("source_event_id", { length: 64 }),
  f1_windows_label:      varchar("f1_windows_label", { length: 255 }),
  created_at:            timestamp("created_at").defaultNow(),
  updated_at:            timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  ux_exp_race_product: unique("ux_exp_race_product").on(table.race_id, table.affiliate_product_id),
  exp_race_id_idx: index("exp_race_id_idx").on(table.race_id),
  exp_category_idx: index("exp_category_idx").on(table.category),
  exp_is_featured_idx: index("exp_is_featured_idx").on(table.is_featured),
}));

export const experience_windows_map = mysqlTable("experience_windows_map", {
  experience_id: int("experience_id").notNull().references(() => experiences.id),
  window_id:     int("window_id").notNull().references(() => experience_windows.id),
}, (table) => [
  primaryKey({ columns: [table.experience_id, table.window_id], name: "experience_windows_map_experience_id_window_id" }),
  index("ewm_window_id_idx").on(table.window_id),
]);

export const itineraries = mysqlTable("itineraries", {
  id:                    varchar("id", { length: 12 }).primaryKey(),
  race_id:               int("race_id").references(() => races.id),
  sessions_selected:     json("sessions_selected"),    // number[] (session IDs)
  experiences_selected:  json("experiences_selected"), // number[] (experience IDs)
  itinerary_json:        longtext("itinerary_json"),
  group_size:            int("group_size").default(1),
  notes:                 text("notes"),
  view_count:            int("view_count").default(0),
  created_at:            timestamp("created_at").defaultNow(),
});

export const affiliate_clicks = mysqlTable("affiliate_clicks", {
  id:            bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
  experience_id: int("experience_id").references(() => experiences.id),
  itinerary_id:  varchar("itinerary_id", { length: 12 }),
  source:        mysqlEnum("source", ["feed", "itinerary", "featured", "map", "guide", "ticket", "hero", "sidebar"]),
  session_id:    varchar("session_id", { length: 64 }),
  user_agent:    varchar("user_agent", { length: 500 }),
  referer:       varchar("referer", { length: 1000 }),
  clicked_at:    timestamp("clicked_at").defaultNow(),
});

export const race_content = mysqlTable("race_content", {
  id:                  int("id").primaryKey().autoincrement(),
  race_id:             int("race_id").notNull().unique(),
  page_title:          varchar("page_title", { length: 255 }),
  page_description:    text("page_description"),
  page_keywords:       json("page_keywords").$type<string[]>(),
  guide_intro:         text("guide_intro"),
  tips_content:        text("tips_content"),
  faq_items:           json("faq_items"),
  faq_ld:              json("faq_ld"),
  circuit_facts:       json("circuit_facts"),
  circuit_map_src:     varchar("circuit_map_src", { length: 255 }),
  getting_there:       text("getting_there"),
  where_to_stay:       text("where_to_stay"),
  hero_title:          varchar("hero_title", { length: 255 }),
  hero_subtitle:       text("hero_subtitle"),
  why_city_text:       text("why_city_text"),
  highlights_list:     json("highlights_list").$type<string[]>(),
  getting_there_intro: text("getting_there_intro"),
  transport_options:   json("transport_options").$type<Array<{ icon: string; title: string; desc: string }>>(),
  travel_tips:         json("travel_tips").$type<Array<{ heading: string; body: string }>>(),
  city_guide:          longtext("city_guide"),
  currency:            varchar("currency", { length: 3 }),
  created_at:          timestamp("created_at").defaultNow(),
});

export const tickets = mysqlTable("tickets", {
  id:                 bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
  race_id:            int("race_id").references(() => races.id),
  tm_event_id:        varchar("tm_event_id", { length: 50 }),
  stubhub_event_id:   varchar("stubhub_event_id", { length: 50 }),
  title:              varchar("title", { length: 255 }),
  category:           varchar("category", { length: 100 }),
  price_min:          decimal("price_min", { precision: 10, scale: 2 }),
  price_max:          decimal("price_max", { precision: 10, scale: 2 }),
  currency:           varchar("currency", { length: 3 }),
  quantity_available: int("quantity_available"),
  ticket_url:         varchar("ticket_url", { length: 1000 }),
  ticket_source:      varchar("ticket_source", { length: 20 }).default('ticketmaster'),
  section:            varchar("section", { length: 100 }),
  row:                varchar("row", { length: 20 }),
  zone:               varchar("zone", { length: 100 }),
  image_url:          varchar("image_url", { length: 500 }),
  last_synced_at:     timestamp("last_synced_at").defaultNow(),
}, (table) => ({
  tickets_race_id_idx: index("tickets_race_id_idx").on(table.race_id),
}));

export const contacts = mysqlTable("contacts", {
  id:         int("id").primaryKey().autoincrement(),
  name:       varchar("name", { length: 255 }).notNull(),
  email:      varchar("email", { length: 255 }).notNull(),
  subject:    varchar("subject", { length: 255 }),
  message:    text("message").notNull(),
  status:     mysqlEnum("status", ["new", "read", "replied", "archived"]).default("new"),
  created_at: timestamp("created_at").defaultNow(),
});
