CREATE TABLE `membership` (
	`user_id` text NOT NULL,
	`website_id` integer NOT NULL,
	`banned` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`website_id`) REFERENCES `website`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_id_website_id` ON `membership` (`user_id`,`website_id`);