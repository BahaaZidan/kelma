import { and, eq, isNull } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { comment, page } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { page_id: pageId, website_id } = params;
	const websiteId = Number(website_id);

	const pageFound = !!(
		await db
			.select()
			.from(page)
			.limit(1)
			.where(and(eq(page.websiteId, websiteId), eq(page.id, pageId)))
	)[0];
	if (!pageFound) await db.insert(page).values({ id: pageId, websiteId });

	const comments = await db
		.select()
		.from(comment)
		.where(
			and(eq(comment.websiteId, websiteId), eq(comment.pageId, pageId), isNull(comment.parentId))
		);

	return { comments };
};
