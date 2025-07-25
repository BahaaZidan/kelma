PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_like` (
	`id` integer PRIMARY KEY NOT NULL,
	`liker` text NOT NULL,
	`comment_id` integer,
	`reply_id` integer,
	FOREIGN KEY (`liker`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reply_id`) REFERENCES `reply`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_like`("id", "liker", "comment_id", "reply_id") SELECT "id", "liker", "comment_id", "reply_id" FROM `like`;--> statement-breakpoint
DROP TABLE `like`;--> statement-breakpoint
ALTER TABLE `__new_like` RENAME TO `like`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `liker_comment_id` ON `like` (`liker`,`comment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `liker_reply_id` ON `like` (`liker`,`reply_id`);--> statement-breakpoint
CREATE INDEX `on_comment_id` ON `like` (`comment_id`);--> statement-breakpoint
CREATE INDEX `on_reply_id` ON `like` (`reply_id`);