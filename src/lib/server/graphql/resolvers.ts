import { and, desc, eq, inArray, isNull, lt, not, or, sql } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { DateTimeResolver, URLResolver, USCurrencyResolver } from 'graphql-scalars';
import * as v from 'valibot';

import { PAGEVIEW_COST_IN_CENTS, PAGEVIEW_COST_SCALER } from '$lib/constants';
import type { DB } from '$lib/server/db';
import {
	commentTable,
	likesTable,
	membershipTable,
	pageTable,
	websiteTable,
} from '$lib/server/db/schema';
import { contentSchema } from '$lib/validation-schemas';

import { isDomainTrusted } from '../utils';
import type { Resolvers } from './resolvers.types';
import { fromGlobalId, toGlobalId } from './utils';

export const resolvers: Resolvers = {
	DateTime: DateTimeResolver,
	URL: URLResolver,
	USCurrency: USCurrencyResolver,
	Query: {
		node: async (_parent, { id }, { db }) => {
			const { type, id: dbId } = fromGlobalId(id);
			switch (type) {
				case 'User': {
					const user = await db.query.user.findFirst({ where: (t, { eq }) => eq(t.id, dbId) });
					return user ? { ...user, __typename: 'User' } : null;
				}
				case 'Website': {
					const website = await db.query.website.findFirst({
						where: (t, { eq }) => eq(t.id, Number(dbId)),
					});
					return website ? { ...website, __typename: 'Website' } : null;
				}
				case 'Page': {
					const page = await db.query.page.findFirst({
						where: (t, { eq }) => eq(t.id, Number(dbId)),
					});
					return page ? { ...page, __typename: 'Page' } : null;
				}
				case 'Comment': {
					const comment = await db.query.comment.findFirst({
						where: (t, { eq }) => eq(t.id, Number(dbId)),
					});
					return comment ? { ...comment, __typename: 'Comment' } : null;
				}
				default:
					return null;
			}
		},
		viewer: async (_parent, _args, { locals }) => {
			return locals.session?.user;
		},
	},
	Mutation: {
		createComment: async (_, { input }, { locals, db }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');
			const inputValidation = v.safeParse(contentSchema, input);
			if (!inputValidation.success) throw new GraphQLError('BAD_INPUT');

			const pageId = Number(fromGlobalId(input.pageId).id);

			const [page] = await db
				.select({
					id: pageTable.id,
					closed: pageTable.closed,
					websiteId: pageTable.websiteId,
				})
				.from(pageTable)
				.where(eq(pageTable.id, pageId))
				.limit(1);

			if (!page) throw new GraphQLError('NOT_FOUND');
			if (page.closed) throw new GraphQLError('UNAUTHORIZED');

			const banned = await isUserBanned(db, page.websiteId, locals.session.user.id);
			// this error message is intentional. banned users don't need to know they're banned.
			// a determined harasser might create another acount after a ban if it's visible.
			// but if the ban is obscured, they might not even realize they got banned.
			if (banned) throw new GraphQLError('INTERNAL_SERVER_ERROR');

			try {
				const [insertResult] = await db
					.insert(commentTable)
					.values({
						content: inputValidation.output.content,
						authorId: locals.session.user.id,
						pageId: page.id,
						websiteId: page.websiteId,
						...(input.parentId ? { parentId: Number(fromGlobalId(input.parentId).id) } : {}),
					})
					.returning();

				return insertResult;
			} catch (_e) {
				throw new GraphQLError('INTERNAL_SERVER_ERROR');
			}
		},
		deleteComment: async (_, args, { locals, db }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');

			const commentId = Number(fromGlobalId(args.id).id);

			const [deletedComment] = await db
				.delete(commentTable)
				.where(
					and(
						eq(commentTable.id, commentId),
						or(
							eq(commentTable.authorId, locals.session.user.id),
							inArray(commentTable.websiteId, locals.session.websitesOwnedByCurrentUser || [])
						)
					)
				)
				.returning();

			if (!deletedComment) throw new GraphQLError('UNAUTHORIZED');

			return deletedComment;
		},
		updateCommentContent: async (_, { input }, { locals, db }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');
			const inputValidation = v.safeParse(contentSchema, input);
			if (!inputValidation.success) throw new GraphQLError('BAD_INPUT');
			const commentId = Number(fromGlobalId(input.commentId).id);

			const [updatedComment] = await db
				.update(commentTable)
				.set({
					content: inputValidation.output.content,
					updatedAt: new Date(),
				})
				.where(
					and(eq(commentTable.id, commentId), eq(commentTable.authorId, locals.session.user.id))
				)
				.returning();

			if (!updatedComment) throw new GraphQLError('UNAUTHORIZED');

			return updatedComment;
		},
		togglePageClosed: async (_, args, { locals, db }) => {
			if (!locals.session?.websitesOwnedByCurrentUser?.length)
				throw new GraphQLError('UNAUTHORIZED');

			const pageDBId = Number(fromGlobalId(args.id).id);
			const [updatedPage] = await db
				.update(pageTable)
				.set({ closed: not(pageTable.closed) })
				.where(
					and(
						eq(pageTable.id, pageDBId),
						inArray(pageTable.websiteId, locals.session.websitesOwnedByCurrentUser)
					)
				)
				.returning();

			return updatedPage;
		},
		createWebsite: async (_, { input }, { locals, db }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');
			const [createdWebsite] = await db
				.insert(websiteTable)
				.values({ ownerId: locals.session.user.id, name: input.name, domains: input.domains })
				.returning();

			return createdWebsite;
		},
		updateWebsite: async (_, { input }, { locals, db }) => {
			const dbId = Number(fromGlobalId(input.id).id);
			if (!locals.session || !locals.session.websitesOwnedByCurrentUser?.includes(dbId))
				throw new GraphQLError('UNAUTHORIZED');

			const setMap = {
				...(input.name ? { name: input.name } : {}),
				...(input.domains?.length ? { domains: input.domains } : {}),
			};
			const [updatedWebsite] = await db
				.update(websiteTable)
				.set(setMap)
				.where(eq(websiteTable.id, dbId))
				.returning();

			return updatedWebsite;
		},
		updateUserWebsiteBan: async (_, { input }, { locals, db }) => {
			if (!locals.session?.user) throw new GraphQLError('UNAUTHORIZED');

			const userId = fromGlobalId(input.userId).id;
			const websiteId = Number(fromGlobalId(input.websiteId).id);

			if (!locals.session.websitesOwnedByCurrentUser?.includes(websiteId))
				throw new GraphQLError('UNAUTHORIZED');
			if (userId === locals.session.user.id) throw new GraphQLError('UNAUTHORIZED');

			const [membership] = await db
				.insert(membershipTable)
				.values({
					websiteId,
					userId,
					banned: input.banned,
				})
				.onConflictDoUpdate({
					target: [membershipTable.websiteId, membershipTable.userId],
					set: {
						banned: input.banned,
					},
				})
				.returning();

			if (!membership) throw new GraphQLError('INTERNAL_SERVER_ERROR');

			const user = await db.query.user.findFirst({
				where: (t, { eq }) => eq(t.id, membership.userId),
			});

			return user;
		},
		toggleLike: async (_, args, { locals, db }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');

			const liker = locals.session.user.id;

			const commentId = Number(fromGlobalId(args.id).id);

			try {
				await db.insert(likesTable).values({ liker, commentId });
			} catch (_e) {
				await db
					.delete(likesTable)
					.where(and(eq(likesTable.liker, liker), eq(likesTable.commentId, commentId)));
			}

			const result = await db.query.comment.findFirst({
				where: (t, { eq }) => eq(t.id, commentId),
			});
			if (!result) throw new Error('SOMETHING_WENT_WRONG');
			return result;
		},
	},
	Node: {
		__resolveType(parent) {
			// @ts-expect-error TODO
			return parent.__typename;
		},
	},
	User: {
		id: (parent) => toGlobalId('User', parent.id),
		websites: (parent, _args, { locals, db }) => {
			if (parent.id !== locals.session?.user.id) throw new GraphQLError('INTERNAL_SERVER_ERROR');
			return db.select().from(websiteTable).where(eq(websiteTable.ownerId, parent.id));
		},
		balance: (parent, _args, { locals }) => {
			if (parent.id !== locals.session?.user.id) throw new GraphQLError('INTERNAL_SERVER_ERROR');
			return parent.balance / PAGEVIEW_COST_SCALER;
		},
		pageViewsLeft: (parent, _args, { locals }) => {
			if (parent.id !== locals.session?.user.id) throw new GraphQLError('INTERNAL_SERVER_ERROR');
			return parent.balance / PAGEVIEW_COST_SCALER / PAGEVIEW_COST_IN_CENTS;
		},
	},
	Website: {
		id: (parent) => toGlobalId('Website', parent.id),
		owner: (parent, _args, { loaders }) => {
			return throwIfNull(loaders.users.load(parent.ownerId));
		},
		page: async (parent, { input: { slug, overrides } }, { db, request }) => {
			if (!isDomainTrusted(request, parent.domains)) return null;

			if (overrides) {
				const [page] = await db
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
					.returning();

				return page;
			}
			const [page] = await db
				.select()
				.from(pageTable)
				.where(and(eq(pageTable.websiteId, parent.id), eq(pageTable.slug, slug)))
				.limit(1);

			return page;
		},
		bannedUsers: async (parent, _args, { loaders }) => {
			return loaders.websiteBannedUsers.load(parent.id);
		},
	},
	Page: {
		id: (parent) => toGlobalId('Page', parent.id),
		comments: async (parent, args, { db }) => {
			const cursor = args.after;
			const pageSize = args.first || 10;

			const commentsWExtraOne = await db
				.select()
				.from(commentTable)
				.orderBy(desc(commentTable.createdAt))
				.where(
					and(
						eq(commentTable.pageId, parent.id),
						eq(commentTable.websiteId, parent.websiteId),
						isNull(commentTable.parentId),
						cursor ? lt(commentTable.id, Number(fromGlobalId(cursor).id)) : undefined
					)
				)
				.limit(pageSize + 1);
			const comments = commentsWExtraOne.slice(0, pageSize);

			return {
				edges: comments.map((c) => ({ node: c, cursor: toGlobalId('Comment', c.id) })),
				pageInfo: {
					hasNextPage: commentsWExtraOne.length > comments.length,
					endCursor: comments.length
						? toGlobalId('Comment', comments[comments.length - 1].id)
						: null,
				},
			};
		},
		website: (parent, _args, { loaders }) => {
			return throwIfNull(loaders.websites.load(parent.websiteId));
		},
	},
	Comment: {
		id: (parent) => toGlobalId('Comment', parent.id),
		author: (parent, _args, { loaders }) => {
			return throwIfNull(loaders.users.load(parent.authorId));
		},
		page: (parent, _args, { loaders }) => {
			return throwIfNull(loaders.pages.load(parent.pageId));
		},
		website: (parent, _args, { loaders }) => {
			return throwIfNull(loaders.websites.load(parent.websiteId));
		},
		repliesCount: (parent, _args, { loaders }) => {
			return loaders.repliesCounts.load(parent.id);
		},
		replies: async (parent, args, { db }) => {
			const cursor = args.after;
			const pageSize = args.first || 10;

			const resultPlusOne = await db
				.select()
				.from(commentTable)
				.orderBy(desc(commentTable.createdAt))
				.where(
					and(
						eq(commentTable.parentId, parent.id),
						cursor ? lt(commentTable.id, Number(fromGlobalId(cursor).id)) : undefined
					)
				)
				.limit(pageSize + 1);

			const replies = resultPlusOne.slice(0, pageSize);

			return {
				edges: replies.map((r) => ({ node: r, cursor: toGlobalId('Comment', r.id) })),
				pageInfo: {
					hasNextPage: resultPlusOne.length > replies.length,
					endCursor: replies.length ? toGlobalId('Comment', replies[replies.length - 1].id) : null,
				},
			};
		},
		likedByViewer: (parent, _args, { loaders, locals }) => {
			if (!locals.session) return null;
			return loaders.isLikedByUser.load({
				commentId: parent.id,
				userId: locals.session.user.id,
			});
		},
	},
};

async function throwIfNull<T>(value: Promise<T>) {
	const result = await value;
	if (!result) throw new GraphQLError('INTERNAL_SERVER_ERROR');
	return result;
}

async function isUserBanned(db: DB, websiteId: number, userId: string): Promise<boolean> {
	const result = await db
		.select({ exists: sql<boolean>`1` })
		.from(membershipTable)
		.where(
			and(
				eq(membershipTable.websiteId, websiteId),
				eq(membershipTable.userId, userId),
				eq(membershipTable.banned, true)
			)
		)
		.limit(1)
		.get();

	return !!result;
}
