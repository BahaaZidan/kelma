import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { commentTable } from '$lib/server/db/schema';
import { fetchCursorPaginatedComments } from '$lib/server/queries';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const websiteId = Number(params.website_id);
	if (!locals.session?.websitesOwnedByCurrentUser?.includes(websiteId)) return error(400);

	const response = await fetchCursorPaginatedComments(url, eq(commentTable.websiteId, websiteId));
	return response;
};
