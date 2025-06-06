import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

import { db } from '$lib/server/db';
import { commentTable, pageTable, websiteTable } from '$lib/server/db/schema';

import type { Actions } from './$types';

const redirectURlSchema = v.pipe(v.string());

const editSchema = v.object({
	content: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(500)),
	redirect_url: redirectURlSchema,
});

const deleteSchema = v.object({
	redirect_url: redirectURlSchema,
});

export const actions: Actions = {
	edit: async ({ params, locals, request }) => {
		if (!locals.session) return fail(401);

		const formData = await request.formData();
		const form = v.safeParse(editSchema, {
			content: formData.get('content'),
			redirect_url: formData.get('redirect_url'),
		});
		if (!form.success) return fail(400);

		const commentUpdate = await db
			.update(commentTable)
			.set({
				content: form.output.content,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(commentTable.id, Number(params.comment_id)),
					eq(commentTable.authorId, locals.session.user.id)
				)
			);

		if (commentUpdate.changes === 0) return fail(400);

		return redirect(303, form.output.redirect_url);
	},
	delete: async ({ params, locals, request }) => {
		if (!locals.session) return fail(401);

		const formData = await request.formData();
		const form = v.safeParse(deleteSchema, {
			redirect_url: formData.get('redirect_url'),
		});
		if (!form.success) return fail(400);

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
			return redirect(303, form.output.redirect_url);
		}

		return fail(401);
	},
	approve: async ({ params, locals, request }) => {
		if (!locals.session) return fail(401);

		const formData = Object.fromEntries((await request.formData()).entries());
		const form = v.safeParse(deleteSchema, formData);
		if (!form.success) return fail(400);

		const commentId = Number(params.comment_id);

		const websiteOwnerId = (
			await db
				.select({
					id: commentTable.id,
					pageId: commentTable.pageId,
					website: {
						id: websiteTable.id,
						ownerId: websiteTable.ownerId,
					},
				})
				.from(commentTable)
				.where(eq(commentTable.id, commentId))
				.leftJoin(pageTable, eq(commentTable.pageId, pageTable.id))
				.leftJoin(websiteTable, eq(pageTable.websiteId, websiteTable.id))
				.limit(1)
		)[0].website?.ownerId;

		if (websiteOwnerId !== locals.session.user.id) return fail(401);

		const commentUpdate = await db
			.update(commentTable)
			.set({
				published: true,
			})
			.where(eq(commentTable.id, commentId));

		if (commentUpdate.changes === 0) return fail(400);

		return redirect(303, form.output.redirect_url);
	},
};
