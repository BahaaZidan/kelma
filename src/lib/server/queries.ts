import { desc, eq } from 'drizzle-orm';

import { db } from './db';
import { commentTable, userTable } from './db/schema';

type CursorPaginated<T, N extends string> = {
	[K in N]: T;
} & {
	hasNextPage: boolean;
};

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

type CommentsBaseQueryResult = Awaited<typeof commentBaseQuery>;
export type CursorPaginatedComments = CursorPaginated<CommentsBaseQueryResult, 'comments'>;
