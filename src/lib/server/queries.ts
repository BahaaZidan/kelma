import { desc, eq } from 'drizzle-orm';

import { db } from './db';
import { commentTable, userTable } from './db/schema';

export const commentBaseQuery = db
	.select({
		id: commentTable.id,
		websiteId: commentTable.websiteId,
		content: commentTable.content,
		createdAt: commentTable.createdAt,
		published: commentTable.published,
		author: {
			id: userTable.id,
			name: userTable.name,
			image: userTable.image,
		},
	})
	.from(commentTable)
	.orderBy(desc(commentTable.createdAt))
	.leftJoin(userTable, eq(commentTable.authorId, userTable.id));

export type CommentsBaseQueryResult = Awaited<typeof commentBaseQuery>;
