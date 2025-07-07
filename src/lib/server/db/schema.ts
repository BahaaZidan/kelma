import { sql, type InferSelectModel } from 'drizzle-orm';
import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' })
		.$defaultFn(() => false)
		.notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	balance_in_cents: real().notNull().default(50),
});
export type UserSelectModel = InferSelectModel<typeof userTable>;

export const sessionTable = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
});

export const accountTable = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verificationTable = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
		() => /* @__PURE__ */ new Date()
	),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
		() => /* @__PURE__ */ new Date()
	),
});

export const websiteTable = sqliteTable('website', {
	id: integer('id').primaryKey(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	name: text().notNull(),
	domains: text('domains', { mode: 'json' })
		.notNull()
		.$type<string[]>()
		.default(sql`'[]'`),
	preModeration: integer('pre_moderation', { mode: 'boolean' })
		.default(sql`0`)
		.notNull(),
});
export type WebsiteSelectModel = InferSelectModel<typeof websiteTable>;

export const pageTable = sqliteTable(
	'page',
	{
		id: integer('id').primaryKey(),
		slug: text('slug').notNull(),
		websiteId: integer('website_id')
			.notNull()
			.references(() => websiteTable.id, { onDelete: 'cascade' }),
		name: text(),
		url: text(),
		preModeration: integer('pre_moderation', { mode: 'boolean' })
			.default(sql`0`)
			.notNull(),
		closed: integer('closed', { mode: 'boolean' })
			.default(sql`0`)
			.notNull(),
	},
	(self) => [uniqueIndex('slug_websiteId_uniq').on(self.slug, self.websiteId)]
);
export type PageSelectModel = InferSelectModel<typeof pageTable>;

export const commentTable = sqliteTable('comment', {
	id: integer('id').primaryKey(),
	content: text('content').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	published: integer('published', { mode: 'boolean' })
		.default(sql`1`)
		.notNull(),
	pageId: integer('page_id')
		.notNull()
		.references(() => pageTable.id, { onDelete: 'cascade' }),
	websiteId: integer('website_id')
		.notNull()
		.references(() => websiteTable.id, { onDelete: 'cascade' }),
	authorId: text('author_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
});
export type CommentSelectModel = InferSelectModel<typeof commentTable>;
