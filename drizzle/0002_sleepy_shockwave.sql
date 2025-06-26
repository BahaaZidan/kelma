PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_website` (
	`id` integer PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`domains` text DEFAULT '[]' NOT NULL,
	`pre_moderation` integer DEFAULT 0 NOT NULL,
	`embed_settings` text DEFAULT '{"theme":"dark","dir":"ltr","lang":"en"}',
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_website`("id", "owner_id", "name", "domains", "pre_moderation", "embed_settings") SELECT "id", "owner_id", "name", "domains", "pre_moderation", "embed_settings" FROM `website`;--> statement-breakpoint
DROP TABLE `website`;--> statement-breakpoint
ALTER TABLE `__new_website` RENAME TO `website`;--> statement-breakpoint
PRAGMA foreign_keys=ON;