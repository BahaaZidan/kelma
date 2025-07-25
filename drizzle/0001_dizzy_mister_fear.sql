CREATE TABLE `like` (
	`id` integer PRIMARY KEY NOT NULL,
	`comment_id` integer,
	`reply_id` integer,
	FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reply_id`) REFERENCES `reply`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `like_comment_id_unique` ON `like` (`comment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `like_reply_id_unique` ON `like` (`reply_id`);