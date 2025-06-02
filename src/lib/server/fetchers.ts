import { desc, eq } from 'drizzle-orm';

import { db } from './db';
import { commentTable, pageTable, userTable, websiteTable } from './db/schema';

export async function fetchPageComments(pageId: number, loggedInUserId?: string) {
	const comments = (
		await db
			.select({
				id: commentTable.id,
				content: commentTable.content,
				createdAt: commentTable.createdAt,
				author: {
					id: userTable.id,
					name: userTable.name,
					image: userTable.image,
				},
				page: {
					id: pageTable.id,
					websiteId: pageTable.websiteId,
				},
				website: {
					id: websiteTable.id,
					ownerId: websiteTable.ownerId,
				},
			})
			.from(commentTable)
			.orderBy(desc(commentTable.createdAt))
			.where(eq(commentTable.pageId, pageId))
			.leftJoin(userTable, eq(commentTable.authorId, userTable.id))
			.leftJoin(pageTable, eq(commentTable.pageId, pageTable.id))
			.leftJoin(websiteTable, eq(pageTable.websiteId, websiteTable.id))
	).map((c) => ({
		id: c.id,
		content: c.content,
		createdAt: c.createdAt,
		author: c.author,
		permissions: {
			delete: c.author?.id === loggedInUserId || c.website?.ownerId === loggedInUserId,
		},
	}));

	return comments;
}
