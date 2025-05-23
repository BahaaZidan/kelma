import { count, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { commentTable, pageTable } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const pages = await db
		.select({
			id: pageTable.id,
			slug: pageTable.slug,
			name: pageTable.name,
			url: pageTable.url,
			commentsCount: count(commentTable.id),
		})
		.from(pageTable)
		.where(eq(pageTable.websiteId, Number(params.website_id)))
		.leftJoin(commentTable, eq(pageTable.id, commentTable.pageId))
		.groupBy(pageTable.id);

	return { pages };
};
