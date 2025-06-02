import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { commentTable, pageTable, websiteTable } from '$lib/server/db/schema';

import type { Actions } from './$types';

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		if (!locals.session) return fail(401);

		const comment = (
			await db
				.select({
					id: commentTable.id,
					content: commentTable.content,
					createdAt: commentTable.createdAt,
					authorId: commentTable.authorId,
					page: {
						id: pageTable.id,
						websiteId: pageTable.websiteId,
					},
					website: {
						id: websiteTable.id,
						ownerId: websiteTable.ownerId,
					},
				})
				.from(commentTable)
				.where(eq(commentTable.id, Number(params.comment_id)))
				.leftJoin(pageTable, eq(commentTable.pageId, pageTable.id))
				.leftJoin(websiteTable, eq(pageTable.websiteId, websiteTable.id))
				.limit(1)
		)[0];
		if (!comment) return fail(400);
		if (
			comment.authorId === locals.session.user.id ||
			comment.website?.ownerId === locals.session.user.id
		) {
			const deletion = await db
				.delete(commentTable)
				.where(eq(commentTable.id, Number(params.comment_id)));
			if (deletion.changes === 0) return fail(500);
			return { success: true };
		}

		return fail(401);
	},
};
