import { and, desc, eq, inArray, lt, not, or } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { DateTimeResolver, URLResolver } from 'graphql-scalars';
import { Base64 } from 'js-base64';
import * as v from 'valibot';

import type { Resolvers } from '$lib/__generated__/graphql-resolvers-types';
import { commentTable, pageTable, websiteTable } from '$lib/server/db/schema';

const schema = v.object({
	content: v.pipe(v.string(), v.trim(), v.minLength(4), v.maxLength(300)),
});

export const resolvers: Resolvers = {
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
			const inputValidation = v.safeParse(schema, input);
			if (!inputValidation.success) throw new GraphQLError('BAD_INPUT');

			const pageId = Number(fromGlobalId(input.pageId).id);

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
					.where(eq(pageTable.id, pageId))
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
		deleteComment: async (_, { input }, { locals, db }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');

			const commentId = Number(fromGlobalId(input.commentId).id);

			const deletedComment = (
				await db
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
					.returning()
			)[0];

			if (!deletedComment) throw new GraphQLError('UNAUTHORIZED');

			return deletedComment;
		},
		updateCommentContent: async (_, { input }, { locals, db }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');
			const inputValidation = v.safeParse(schema, input);
			if (!inputValidation.success) throw new GraphQLError('BAD_INPUT');
			const commentId = Number(fromGlobalId(input.commentId).id);

			const updatedComment = (
				await db
					.update(commentTable)
					.set({
						content: inputValidation.output.content,
						updatedAt: new Date(),
					})
					.where(
						and(eq(commentTable.id, commentId), eq(commentTable.authorId, locals.session.user.id))
					)
					.returning()
			)[0];

			if (!updatedComment) throw new GraphQLError('UNAUTHORIZED');

			return updatedComment;
		},
		publishComment: async (_, { input }, { locals, db }) => {
			if (!locals.session?.websitesOwnedByCurrentUser?.length)
				throw new GraphQLError('UNAUTHORIZED');
			const commentId = Number(fromGlobalId(input.commentId).id);

			const updatedComment = (
				await db
					.update(commentTable)
					.set({
						published: true,
					})
					.where(
						and(
							eq(commentTable.id, commentId),
							eq(commentTable.published, false),
							inArray(commentTable.websiteId, locals.session.websitesOwnedByCurrentUser)
						)
					)
					.returning()
			)[0];
			if (!updatedComment) throw new GraphQLError('UNAUTHORIZED');

			return updatedComment;
		},
		togglePageClosed: async (_, args, { locals, db }) => {
			if (!locals.session?.websitesOwnedByCurrentUser?.length)
				throw new GraphQLError('UNAUTHORIZED');

			const pageDBId = Number(fromGlobalId(args.id).id);
			const updatedPage = (
				await db
					.update(pageTable)
					.set({ closed: not(pageTable.closed) })
					.where(
						and(
							eq(pageTable.id, pageDBId),
							inArray(pageTable.websiteId, locals.session.websitesOwnedByCurrentUser)
						)
					)
					.returning()
			)[0];

			return updatedPage;
		},
		togglePagePreModeration: async (_, args, { locals, db }) => {
			if (!locals.session?.websitesOwnedByCurrentUser?.length)
				throw new GraphQLError('UNAUTHORIZED');

			const pageDBId = Number(fromGlobalId(args.id).id);
			const updatedPage = (
				await db
					.update(pageTable)
					.set({ preModeration: not(pageTable.preModeration) })
					.where(
						and(
							eq(pageTable.id, pageDBId),
							inArray(pageTable.websiteId, locals.session.websitesOwnedByCurrentUser)
						)
					)
					.returning()
			)[0];

			return updatedPage;
		},
		createWebsite: async (_, { input }, { locals, db }) => {
			if (!locals.session) throw new GraphQLError('UNAUTHORIZED');
			const createdWebsite = (
				await db
					.insert(websiteTable)
					.values({ ownerId: locals.session.user.id, name: input.name, domains: input.domains })
					.returning()
			)[0];
			return createdWebsite;
		},
		updateWebsite: async (_, { input }, { locals, db }) => {
			const dbId = Number(fromGlobalId(input.id).id);
			if (!locals.session || !locals.session.websitesOwnedByCurrentUser?.includes(dbId))
				throw new GraphQLError('UNAUTHORIZED');

			const setMap = {
				...(input.name ? { name: input.name } : {}),
				...(input.domains?.length ? { domains: input.domains } : {}),
				...(typeof input.preModeration === 'boolean' ? { preModeration: input.preModeration } : {}),
			};
			const updatedWebsite = (
				await db.update(websiteTable).set(setMap).where(eq(websiteTable.id, dbId)).returning()
			)[0];

			return updatedWebsite;
		},
	},
	Node: {
		__resolveType(obj) {
			// @ts-expect-error TODO
			return obj.__typename;
		},
	},
	User: {
		id: (parent) => toGlobalId('User', parent.id),
		websites: (parent, _args, { db }) => {
			return db.select().from(websiteTable).where(eq(websiteTable.ownerId, parent.id));
		},
	},
	Website: {
		id: (parent) => toGlobalId('Website', parent.id),
		owner: (parent, _args, { loaders }) => {
			return loaders.users.load(parent.ownerId);
		},
		page: async (parent, args, { db }) => {
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
		id: (parent) => toGlobalId('Page', parent.id),
		comments: async (parent, args, { locals, db }) => {
			const isWebsiteOwner = locals.session?.websitesOwnedByCurrentUser?.includes(parent.websiteId);
			const loggedInUserId = locals.session?.user.id;

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
			return loaders.websites.load(parent.websiteId);
		},
		permissions: async (parent, _args, { locals }) => {
			const isWebsiteOwner = (locals.session?.websitesOwnedByCurrentUser || []).includes(
				parent.websiteId
			);

			return {
				createComment: !parent.closed && !!locals.session?.user,
				toggleClosed: isWebsiteOwner,
				togglePreModeration: isWebsiteOwner,
			};
		},
	},
	Comment: {
		id: (parent) => toGlobalId('Comment', parent.id),
		author: (parent, _args, context) => {
			return context.loaders.users.load(parent.authorId);
		},
		page: (parent, _args, context) => {
			return context.loaders.pages.load(parent.pageId);
		},
		website: (parent, _args, context) => {
			return context.loaders.websites.load(parent.websiteId);
		},
		permissions: (parent, _args, { locals }) => {
			const loggedInUserId = locals.session?.user.id;
			const websitesOwnedByLoggedInUser = locals.session?.websitesOwnedByCurrentUser;
			const isWebsiteOwner = websitesOwnedByLoggedInUser?.includes(parent.websiteId) ?? false;

			return {
				delete: parent.authorId === loggedInUserId || isWebsiteOwner,
				edit: parent.authorId === loggedInUserId,
				approve: !parent.published && isWebsiteOwner,
			};
		},
	},
	DateTime: DateTimeResolver,
	URL: URLResolver,
};

function toGlobalId(type: string, id: string | number): string {
	return Base64.encode(`${type}:${id}`);
}

function fromGlobalId(globalId: string): { type: string; id: string } {
	const [type, id] = Base64.decode(globalId).split(':');
	return { type, id };
}
