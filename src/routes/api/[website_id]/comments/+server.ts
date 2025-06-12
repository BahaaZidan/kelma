import { error, json } from '@sveltejs/kit';
import { and, eq, lt } from 'drizzle-orm';
import * as v from 'valibot';

import { commentTable } from '$lib/server/db/schema';
import { commentBaseQuery } from '$lib/server/queries';

import type { RequestHandler } from './$types';

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

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const websiteId = Number(params.website_id);
	if (!locals.session?.websitesOwnedByCurrentUser?.includes(websiteId)) return error(400);

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
		.where(
			and(eq(commentTable.websiteId, websiteId), cursor ? lt(commentTable.id, cursor) : undefined)
		)
		.limit(pageSize + 1);

	const comments = commentsWExtraOne.slice(0, pageSize);

	return json({ comments, hasNextPage: commentsWExtraOne.length > comments.length });
};
