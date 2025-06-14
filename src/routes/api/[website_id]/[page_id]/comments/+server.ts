import { and, eq, or } from 'drizzle-orm';

import { commentTable } from '$lib/server/db/schema';
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
