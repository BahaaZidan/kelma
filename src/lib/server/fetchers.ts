import { desc, eq } from 'drizzle-orm';

import { db } from './db';
import { commentTable, userTable } from './db/schema';

export async function fetchPageComments(pageId: number) {
	const comments = await db
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

	return comments;
}
