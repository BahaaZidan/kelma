import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { commentTable, pageTable } from '$lib/server/db/schema';
import { commentBaseQuery } from '$lib/server/queries';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pageId = Number(params.page_id);
	if (!locals.session?.websitesOwnedByCurrentUser?.includes(Number(params.website_id)))
		return error(400);

	const page = (
		await db
			.select({
				id: pageTable.id,
				closed: pageTable.closed,
				websiteId: pageTable.websiteId,
			})
			.from(pageTable)
			.where(eq(pageTable.id, pageId))
			.limit(1)
	)[0];

	if (!page) return error(404);
	if (!locals.session?.websitesOwnedByCurrentUser?.includes(page.websiteId)) return error(400);

	const comments = await commentBaseQuery.where(eq(commentTable.pageId, pageId));

	return { comments };
};
