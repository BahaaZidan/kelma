import { error, json } from '@sveltejs/kit';
import { and, desc, eq, lt, SQL } from 'drizzle-orm';
import * as v from 'valibot';

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

export type CommentsBaseQueryResult = Awaited<typeof commentBaseQuery>;
export type CursorPaginatedComments = CursorPaginated<CommentsBaseQueryResult, 'comments'>;

const searchParamsSchema = v.object({
	cursor: v.optional(
		v.pipe(
			v.string(),
			v.transform((i) => Number(i)),
			v.number(),
			v.safeInteger(),
			v.minValue(1)
		)
	),
	pageSize: v.optional(
		v.pipe(
			v.string(),
			v.transform((i) => Number(i)),
			v.number(),
			v.safeInteger(),
			v.minValue(5),
			v.maxValue(30)
		)
	),
});

export async function fetchCursorPaginatedComments(url: URL, where?: SQL) {
	const searchParamsValidation = v.safeParse(
		searchParamsSchema,
		Object.fromEntries(url.searchParams.entries())
	);

	if (!searchParamsValidation.success)
		return error(400, searchParamsValidation.issues.map((i) => i.message).join('\n'));
	const searchParams = searchParamsValidation.output;

	const cursor = searchParams.cursor;
	const pageSize = searchParams.pageSize || 10;

	const commentsWExtraOne = await commentBaseQuery
		.where(and(where, cursor ? lt(commentTable.id, cursor) : undefined))
		.limit(pageSize + 1);

	const comments = commentsWExtraOne.slice(0, pageSize);

	return json({ comments, hasNextPage: commentsWExtraOne.length > comments.length });
}
