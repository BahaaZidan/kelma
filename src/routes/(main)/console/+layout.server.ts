import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { website } from '$lib/server/db/schema';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session) return error(404);

	const websites = await db.select().from(website).where(eq(website.ownerId, session.user.id));

	return { websites };
};
