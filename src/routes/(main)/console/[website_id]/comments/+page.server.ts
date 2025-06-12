import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { commentTable, userTable } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const websiteId = Number(params.website_id);
	if (!locals.session?.websitesOwnedByCurrentUser?.includes(websiteId)) return error(400);

	const comments = await db
		.select({
			id: commentTable.id,
			content: commentTable.content,
			createdAt: commentTable.createdAt,
			published: commentTable.published,
			websiteId: commentTable.websiteId,
			author: {
				id: userTable.id,
				name: userTable.name,
				image: userTable.image,
			},
		})
		.from(commentTable)
		.orderBy(desc(commentTable.createdAt))
		.where(eq(commentTable.websiteId, websiteId))
		.leftJoin(userTable, eq(commentTable.authorId, userTable.id));

	return { comments };
};
