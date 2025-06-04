import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

import { db } from './db';
import { commentTable, pageTable, userTable, websiteTable } from './db/schema';

export async function fetchPageComments(pageId: number, loggedInUserId?: string) {
	const page = (
		await db
			.select({
				id: pageTable.id,
				closed: pageTable.closed,
				website: {
					id: websiteTable.id,
					ownerId: websiteTable.ownerId,
				},
			})
			.from(pageTable)
			.where(eq(pageTable.id, pageId))
			.leftJoin(websiteTable, eq(pageTable.websiteId, websiteTable.id))
			.limit(1)
	)[0];

	if (!page) return error(404);

	const commentsResult = await db
		.select({
			id: commentTable.id,
			content: commentTable.content,
			createdAt: commentTable.createdAt,
			author: {
				id: userTable.id,
				name: userTable.name,
				image: userTable.image,
			},
		})
		.from(commentTable)
		.orderBy(desc(commentTable.createdAt))
		.where(eq(commentTable.pageId, pageId))
		.leftJoin(userTable, eq(commentTable.authorId, userTable.id));

	const comments = commentsResult.map((c) => ({
		id: c.id,
		content: c.content,
		createdAt: c.createdAt,
		author: c.author,
		permissions: {
			delete: c.author?.id === loggedInUserId || page.website?.ownerId === loggedInUserId,
			edit: c.author?.id === loggedInUserId,
		},
	}));

	return {
		comments,
		permissions: {
			create: !!loggedInUserId && !page.closed,
		},
	};
}
