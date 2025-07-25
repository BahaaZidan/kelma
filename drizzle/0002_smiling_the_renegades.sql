DROP INDEX `like_comment_id_unique`;--> statement-breakpoint
DROP INDEX `like_reply_id_unique`;--> statement-breakpoint
ALTER TABLE `like` ADD `liker` integer REFERENCES user(id);--> statement-breakpoint
CREATE UNIQUE INDEX `liker_comment_id` ON `like` (`liker`,`comment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `liker_reply_id` ON `like` (`liker`,`reply_id`);