-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `affiliate_clicks` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`experience_id` int,
	`itinerary_id` varchar(12),
	`source` enum('feed','itinerary','featured','map','guide'),
	`session_id` varchar(64),
	`user_agent` varchar(500),
	`referer` varchar(1000),
	`clicked_at` timestamp DEFAULT (now()),
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience_windows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`race_id` int,
	`slug` varchar(50),
	`label` varchar(100),
	`day_of_week` enum('Thursday','Friday','Saturday','Sunday'),
	`start_time` time,
	`end_time` time,
	`max_duration_hours` decimal(3,1),
	`description` text,
	`sort_order` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `experience_windows_id` PRIMARY KEY(`id`),
	CONSTRAINT `ux_window_race_slug` UNIQUE(`race_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `experience_windows_map` (
	`experience_id` int NOT NULL,
	`window_id` int NOT NULL,
	CONSTRAINT `experience_windows_map_experience_id_window_id` PRIMARY KEY(`experience_id`,`window_id`)
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`race_id` int,
	`title` varchar(255),
	`slug` varchar(255),
	`category` enum('food','culture','adventure','daytrip','nightlife'),
	`description` text,
	`short_description` varchar(500),
	`abstract` text,
	`price_amount` decimal(10,2),
	`price_currency` varchar(3),
	`price_label` varchar(50),
	`duration_hours` decimal(3,1),
	`duration_label` varchar(50),
	`rating` decimal(3,1),
	`review_count` int,
	`image_url` varchar(500),
	`image_emoji` varchar(10),
	`photos` json,
	`affiliate_url` varchar(1000),
	`affiliate_product_id` varchar(100),
	`highlights` json,
	`includes` json,
	`excludes` json,
	`important_info` text,
	`reviews_snapshot` json,
	`f1_context` text,
	`guide_article` longtext,
	`faq_items` json,
	`meeting_point` text,
	`bestseller` tinyint(1),
	`original_price` decimal(10,2),
	`discount_pct` int,
	`has_pick_up` tinyint(1),
	`mobile_voucher` tinyint(1),
	`instant_confirmation` tinyint(1),
	`skip_the_line` tinyint(1),
	`options_snapshot` json,
	`seo_keywords` json,
	`lat` decimal(10,7),
	`lng` decimal(10,7),
	`languages` json,
	`distance_km` decimal(5,1),
	`neighborhood` varchar(100),
	`travel_mins` int,
	`sort_order` int,
	`is_featured` tinyint(1) DEFAULT 0,
	`f1_windows_label` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `experiences_id` PRIMARY KEY(`id`),
	CONSTRAINT `ux_exp_race_product` UNIQUE(`race_id`,`affiliate_product_id`)
);
--> statement-breakpoint
CREATE TABLE `itineraries` (
	`id` varchar(12) NOT NULL,
	`race_id` int,
	`sessions_selected` json,
	`experiences_selected` json,
	`itinerary_json` longtext,
	`group_size` int DEFAULT 1,
	`notes` text,
	`view_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `itineraries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `race_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`race_id` int NOT NULL,
	`page_title` varchar(255),
	`page_description` text,
	`page_keywords` json,
	`guide_intro` text,
	`tips_content` text,
	`faq_items` json,
	`faq_ld` json,
	`circuit_facts` json,
	`getting_there` text,
	`where_to_stay` text,
	`hero_title` varchar(255),
	`hero_subtitle` text,
	`why_city_text` text,
	`highlights_list` json,
	`getting_there_intro` text,
	`transport_options` json,
	`travel_tips` json,
	`currency` varchar(3),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `race_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `race_content_race_id_unique` UNIQUE(`race_id`)
);
--> statement-breakpoint
CREATE TABLE `races` (
	`id` int AUTO_INCREMENT NOT NULL,
	`series` enum('f1','motogp') NOT NULL DEFAULT 'f1',
	`slug` varchar(100),
	`name` varchar(255),
	`season` year,
	`round` int,
	`circuit_name` varchar(255),
	`city` varchar(100),
	`country` varchar(100),
	`country_code` char(2),
	`circuit_lat` decimal(10,6),
	`circuit_lng` decimal(10,6),
	`timezone` varchar(50),
	`race_date` date,
	`flag_emoji` varchar(10),
	`is_active` tinyint(1) DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `races_id` PRIMARY KEY(`id`),
	CONSTRAINT `races_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`race_id` int,
	`name` varchar(100),
	`short_name` varchar(20),
	`session_type` enum('fp1','fp2','fp3','qualifying','sprint','race','warmup','practice','support','event'),
	`day_of_week` enum('Thursday','Friday','Saturday','Sunday'),
	`start_time` time,
	`end_time` time,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `ux_session_race_name` UNIQUE(`race_id`,`short_name`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`race_id` int,
	`stubhub_event_id` varchar(50),
	`title` varchar(255),
	`category` varchar(100),
	`price_min` decimal(10,2),
	`price_max` decimal(10,2),
	`currency` varchar(3),
	`quantity_available` int,
	`ticket_url` varchar(1000),
	`section` varchar(100),
	`row` varchar(20),
	`zone` varchar(100),
	`last_synced_at` timestamp DEFAULT (now()),
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `affiliate_clicks` ADD CONSTRAINT `affiliate_clicks_experience_id_experiences_id_fk` FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_windows` ADD CONSTRAINT `experience_windows_race_id_races_id_fk` FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_windows_map` ADD CONSTRAINT `experience_windows_map_experience_id_experiences_id_fk` FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_windows_map` ADD CONSTRAINT `experience_windows_map_window_id_experience_windows_id_fk` FOREIGN KEY (`window_id`) REFERENCES `experience_windows`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experiences` ADD CONSTRAINT `experiences_race_id_races_id_fk` FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `itineraries` ADD CONSTRAINT `itineraries_race_id_races_id_fk` FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_race_id_races_id_fk` FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_race_id_races_id_fk` FOREIGN KEY (`race_id`) REFERENCES `races`(`id`) ON DELETE no action ON UPDATE no action;
*/