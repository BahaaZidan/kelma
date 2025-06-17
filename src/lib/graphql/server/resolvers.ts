import { and, desc, eq, lt, or } from 'drizzle-orm';
import { DateTimeResolver, URLResolver } from 'graphql-scalars';

import type { Resolvers } from '$lib/__generated__/graphql-resolvers-types';
import { db } from '$lib/server/db';
import { commentTable, pageTable, userTable, websiteTable } from '$lib/server/db/schema';

export const resolvers: Resolvers = {
	DateTime: DateTimeResolver,
	URL: URLResolver,
	Query: {
		website: async (_parent, args) => {
			const website = (
				await db.select().from(websiteTable).where(eq(websiteTable.id, args.id)).limit(1)
			)[0];
			return website;
		},
	},
	Website: {
		owner: async (parent) => {
			const user = (
				await db.select().from(userTable).where(eq(userTable.id, parent.ownerId)).limit(1)
			)[0];
			return user;
		},
		page: async (parent, args) => {
			const page = (
				await db
					.insert(pageTable)
					.values({
						slug: args.slug,
						websiteId: parent.id,
						name: args.name,
						url: args.url.toString(),
					})
					.onConflictDoUpdate({
						target: [pageTable.slug, pageTable.websiteId],
						set: { name: args.name, url: args.url.toString() },
					})
					.returning()
			)[0];
			return page;
		},
	},
	Page: {
		comments: async (parent, args, context) => {
			const isWebsiteOwner = context.locals.session?.websitesOwnedByCurrentUser?.includes(
				parent.websiteId
			);
			const loggedInUserId = context.locals.session?.user.id;

			const cursor = args.before;
			const pageSize = args.last || 10;

			const commentsWExtraOne = await db
				.select()
				.from(commentTable)
				.orderBy(desc(commentTable.createdAt))
				.where(
					and(
						and(
							eq(commentTable.pageId, parent.id),
							eq(commentTable.websiteId, parent.websiteId),
							!isWebsiteOwner
								? or(
										eq(commentTable.published, true),
										loggedInUserId
											? and(
													eq(commentTable.published, false),
													eq(commentTable.authorId, loggedInUserId)
												)
											: undefined
									)
								: undefined
						),
						cursor ? lt(commentTable.id, cursor) : undefined
					)
				)
				.limit(pageSize + 1);

			const comments = commentsWExtraOne.slice(0, pageSize);

			return {
				edges: comments.map((c) => ({ node: c, cursor: c.id })),
				pageInfo: {
					hasPreviousPage: commentsWExtraOne.length > comments.length,
					startCursor: comments[comments.length - 1].id,
				},
			};
		},
		website: async (parent) => {
			const website = (
				await db.select().from(websiteTable).where(eq(websiteTable.id, parent.websiteId)).limit(1)
			)[0];
			return website;
		},
	},
	Comment: {
		author: async (parent, _args, context) => {
			const user = await context.loaders.users.load(parent.authorId);
			return user;
		},
		page: async (parent, _args, context) => {
			const page = await context.loaders.pages.load(parent.pageId);
			return page;
		},
		website: async (parent, _args, context) => {
			const website = await context.loaders.websites.load(parent.websiteId);
			return website;
		},
	},
};
