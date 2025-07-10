CREATE TABLE `reply` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published` integer DEFAULT 1 NOT NULL,
	`author_id` text NOT NULL,
	`comment_id` integer NOT NULL,
	`page_id` integer NOT NULL,
	`website_id` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`page_id`) REFERENCES `page`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`website_id`) REFERENCES `website`(`id`) ON UPDATE no action ON DELETE cascade
);
