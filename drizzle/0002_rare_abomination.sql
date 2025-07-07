PRAGMA defer_foreign_keys = on;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`balance_in_cents` real DEFAULT 50 NOT NULL,
	CONSTRAINT "balance_minimum" CHECK("__new_user"."balance_in_cents" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "email_verified", "image", "created_at", "updated_at", "balance_in_cents") SELECT "id", "name", "email", "email_verified", "image", "created_at", "updated_at", "balance_in_cents" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA defer_foreign_keys = off;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);