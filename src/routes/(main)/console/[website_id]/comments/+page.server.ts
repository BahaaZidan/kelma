import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { commentTable } from '$lib/server/db/schema';
import { commentBaseQuery } from '$lib/server/queries';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const websiteId = Number(params.website_id);
	if (!locals.session?.websitesOwnedByCurrentUser?.includes(websiteId)) return error(400);

	const comments = await commentBaseQuery.where(eq(commentTable.websiteId, websiteId));

	return { comments };
};
