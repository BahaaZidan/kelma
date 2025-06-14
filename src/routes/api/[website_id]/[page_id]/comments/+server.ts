import { error, json } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';
import * as v from 'valibot';

import { db } from '$lib/server/db';
import { commentTable, pageTable, websiteTable } from '$lib/server/db/schema';
import { fetchCursorPaginatedComments } from '$lib/server/queries';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const websiteId = Number(params.website_id);
	const pageId = Number(params.page_id);
	const isWebsiteOwner = locals.session?.websitesOwnedByCurrentUser?.includes(websiteId);
	const loggedInUserId = locals.session?.user.id;

	const where = and(
		eq(commentTable.pageId, pageId),
		eq(commentTable.websiteId, websiteId),
		!isWebsiteOwner
			? or(
					eq(commentTable.published, true),
					loggedInUserId
						? and(eq(commentTable.published, false), eq(commentTable.authorId, loggedInUserId))
						: undefined
				)
			: undefined
	);

	const response = await fetchCursorPaginatedComments(url, where);
	return response;
};

const schema = v.object({
	comment: v.pipe(v.string(), v.trim(), v.minLength(4), v.maxLength(300)),
});

export const POST: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.session) return error(401);
	const requestBody = await request.json();
	const requestBodyValidation = v.safeParse(schema, requestBody);
	if (!requestBodyValidation.success) return error(400);

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
			.where(
				and(
					eq(pageTable.id, Number(params.page_id)),
					eq(pageTable.websiteId, Number(params.website_id))
				)
			)
			.leftJoin(websiteTable, eq(pageTable.websiteId, websiteTable.id))
			.limit(1)
	)[0];
	if (!page) return error(400);
	if (page.closed) return error(401);

	const insertResult = (
		await db
			.insert(commentTable)
			.values({
				content: requestBodyValidation.output.comment,
				authorId: locals.session.user.id,
				pageId: page.id,
				websiteId: Number(params.website_id),
				published:
					page.website?.ownerId === locals.session.user.id ||
					(!page.website?.preModeration && !page.preModeration),
			})
			.returning()
	)[0];

	if (!insertResult) return error(500);

	return json({ comment: insertResult });
};
