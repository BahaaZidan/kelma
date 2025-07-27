DROP INDEX `idx_comment_page_website_parent_created`;--> statement-breakpoint
CREATE INDEX `idx_comment_parent_created` ON `comment` (`parent_id`,"created_at" desc);--> statement-breakpoint
CREATE INDEX `idx_comment_page_website_parent_created` ON `comment` (`page_id`,`website_id`,"created_at" desc) WHERE "comment"."parent_id" is null;