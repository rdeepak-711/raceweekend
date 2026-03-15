CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`subject` varchar(255),
	`message` text NOT NULL,
	`status` enum('new','read','replied','archived') DEFAULT 'new',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sessions` DROP INDEX `ux_session_race_name`;--> statement-breakpoint
ALTER TABLE `affiliate_clicks` MODIFY COLUMN `source` enum('feed','itinerary','featured','map','guide','ticket','hero','sidebar');--> statement-breakpoint
ALTER TABLE `experiences` MODIFY COLUMN `bestseller` boolean;--> statement-breakpoint
ALTER TABLE `experiences` MODIFY COLUMN `has_pick_up` boolean;--> statement-breakpoint
ALTER TABLE `experiences` MODIFY COLUMN `mobile_voucher` boolean;--> statement-breakpoint
ALTER TABLE `experiences` MODIFY COLUMN `instant_confirmation` boolean;--> statement-breakpoint
ALTER TABLE `experiences` MODIFY COLUMN `skip_the_line` boolean;--> statement-breakpoint
ALTER TABLE `experiences` MODIFY COLUMN `is_featured` boolean;--> statement-breakpoint
ALTER TABLE `experiences` MODIFY COLUMN `is_featured` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `races` MODIFY COLUMN `is_active` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `experiences` ADD `affiliate_partner` varchar(32) DEFAULT 'getyourguide' NOT NULL;--> statement-breakpoint
ALTER TABLE `experiences` ADD `source_event_id` varchar(64);--> statement-breakpoint
ALTER TABLE `experiences` ADD `inventory_status` varchar(20) DEFAULT 'available';--> statement-breakpoint
ALTER TABLE `race_content` ADD `circuit_map_src` varchar(255);--> statement-breakpoint
ALTER TABLE `race_content` ADD `city_guide` longtext;--> statement-breakpoint
ALTER TABLE `sessions` ADD `series_key` varchar(50);--> statement-breakpoint
ALTER TABLE `sessions` ADD `series_label` varchar(100);--> statement-breakpoint
ALTER TABLE `tickets` ADD `tm_event_id` varchar(50);--> statement-breakpoint
ALTER TABLE `tickets` ADD `ticket_source` varchar(20) DEFAULT 'ticketmaster';--> statement-breakpoint
ALTER TABLE `tickets` ADD `inventory_status` varchar(20) DEFAULT 'available';--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `ux_session_full` UNIQUE(`race_id`,`day_of_week`,`start_time`,`short_name`);--> statement-breakpoint
CREATE INDEX `race_id_idx` ON `sessions` (`race_id`);