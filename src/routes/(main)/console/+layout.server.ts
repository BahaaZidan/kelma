import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { websiteTable } from '$lib/server/db/schema';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.session) return error(404);

	const websites = await db
		.select()
		.from(websiteTable)
		.where(eq(websiteTable.ownerId, locals.session.user.id));

	return { websites };
};
