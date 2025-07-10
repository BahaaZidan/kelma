PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reply` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published` integer DEFAULT 1 NOT NULL,
	`author_id` text NOT NULL,
	`comment_id` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_reply`("id", "content", "created_at", "updated_at", "published", "author_id", "comment_id") SELECT "id", "content", "created_at", "updated_at", "published", "author_id", "comment_id" FROM `reply`;--> statement-breakpoint
DROP TABLE `reply`;--> statement-breakpoint
ALTER TABLE `__new_reply` RENAME TO `reply`;--> statement-breakpoint
PRAGMA foreign_keys=ON;