import { and, desc, eq, inArray, lt, or } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { DateTimeResolver, URLResolver } from 'graphql-scalars';
import * as v from 'valibot';

import type { Resolvers } from '$lib/__generated__/graphql-resolvers-types';
import { db } from '$lib/server/db';
import { commentTable, pageTable, userTable, websiteTable } from '$lib/server/db/schema';

const schema = v.object({
	content: v.pipe(v.string(), v.trim(), v.minLength(4), v.maxLength(300)),
});

export const resolvers: Resolvers = {
	Query: {
		website: async (_parent, args) => {
			const website = (
				await db.select().from(websiteTable).where(eq(websiteTable.id, args.id)).limit(1)
			)[0];
			return website;
		},
	},
	Mutation: {
		createComment: async (_, { input }, { locals }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');
			const inputValidation = v.safeParse(schema, input);
			if (!inputValidation.success) throw new GraphQLError('BAD_INPUT');

			const page = (
				await db
					.select({
						id: pageTable.id,
						closed: pageTable.closed,
						preModeration: pageTable.preModeration,
						website: {
							id: websiteTable.id,
							ownerId: websiteTable.ownerId,
							preModeration: websiteTable.preModeration,
						},
					})
					.from(pageTable)
					.where(eq(pageTable.id, input.pageId))
					.leftJoin(websiteTable, eq(pageTable.websiteId, websiteTable.id))
					.limit(1)
			)[0];
			if (!page) throw new GraphQLError('NOT_FOUND');
			if (page.closed) throw new GraphQLError('UNAUTHORIZED');

			const website = page.website!;
			const insertResult = (
				await db
					.insert(commentTable)
					.values({
						content: inputValidation.output.content,
						authorId: locals.session.user.id,
						pageId: page.id,
						websiteId: website.id,
						published:
							website.ownerId === locals.session.user.id ||
							(!website.preModeration && !page.preModeration),
					})
					.returning()
			)[0];
			if (!insertResult) throw new GraphQLError('INTERNAL_SERVER_ERROR');

			return insertResult;
		},
		deleteComment: async (_, { input }, { locals }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');

			const deletedComment = (
				await db
					.delete(commentTable)
					.where(
						and(
							eq(commentTable.id, input.commentId),
							or(
								eq(commentTable.authorId, locals.session.user.id),
								inArray(commentTable.websiteId, locals.session.websitesOwnedByCurrentUser || [])
							)
						)
					)
					.returning()
			)[0];

			if (!deletedComment) throw new GraphQLError('UNAUTHORIZED');

			return deletedComment;
		},
		updateCommentContent: async (_, { input }, { locals }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');
			const inputValidation = v.safeParse(schema, input);
			if (!inputValidation.success) throw new GraphQLError('BAD_INPUT');

			const updatedComment = (
				await db
					.update(commentTable)
					.set({
						content: inputValidation.output.content,
						updatedAt: new Date(),
					})
					.where(
						and(
							eq(commentTable.id, input.commentId),
							eq(commentTable.authorId, locals.session.user.id)
						)
					)
					.returning()
			)[0];

			if (!updatedComment) throw new GraphQLError('UNAUTHORIZED');

			return updatedComment;
		},
		publishComment: async (_, { input }, { locals }) => {
			if (!locals.session?.websitesOwnedByCurrentUser?.length)
				throw new GraphQLError('UNAUTHORIZED');

			const updatedComment = (
				await db
					.update(commentTable)
					.set({
						published: true,
					})
					.where(
						and(
							eq(commentTable.id, input.commentId),
							eq(commentTable.published, false),
							inArray(commentTable.websiteId, locals.session.websitesOwnedByCurrentUser)
						)
					)
					.returning()
			)[0];
			if (!updatedComment) throw new GraphQLError('UNAUTHORIZED');

			return updatedComment;
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
			const {
				input: { slug, overrides },
			} = args;

			if (overrides) {
				const page = (
					await db
						.insert(pageTable)
						.values({
							slug,
							websiteId: parent.id,
							name: overrides.name,
							url: overrides.url.toString(),
						})
						.onConflictDoUpdate({
							target: [pageTable.slug, pageTable.websiteId],
							set: { name: overrides.name, url: overrides.url.toString() },
						})
						.returning()
				)[0];
				return page;
			}
			const page = (
				await db
					.select()
					.from(pageTable)
					.where(and(eq(pageTable.websiteId, parent.id), eq(pageTable.slug, slug)))
					.limit(1)
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

			const cursor = args.after;
			const pageSize = args.first || 10;

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
					hasNextPage: commentsWExtraOne.length > comments.length,
					endCursor: comments[comments.length - 1].id,
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
	DateTime: DateTimeResolver,
	URL: URLResolver,
};
