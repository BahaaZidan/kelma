import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { commentTable, pageTable, userTable } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const loggedInUserId = locals.session?.user.id;
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

	const commentsResult = await db
		.select({
			id: commentTable.id,
			content: commentTable.content,
			createdAt: commentTable.createdAt,
			published: commentTable.published,
			author: {
				id: userTable.id,
				name: userTable.name,
				image: userTable.image,
			},
		})
		.from(commentTable)
		.orderBy(desc(commentTable.createdAt))
		.where(eq(commentTable.pageId, pageId))
		.leftJoin(userTable, eq(commentTable.authorId, userTable.id));

	const comments = commentsResult.map((c) => ({
		id: c.id,
		content: c.content,
		createdAt: c.createdAt,
		published: c.published,
		author: c.author,
		permissions: {
			delete: true,
			edit: c.author?.id === loggedInUserId,
			approve: !c.published,
		},
	}));
	return { comments };
};
