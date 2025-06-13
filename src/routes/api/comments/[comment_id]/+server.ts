import { error } from '@sveltejs/kit';
import { and, eq, inArray, or } from 'drizzle-orm';
import * as v from 'valibot';

import { db } from '$lib/server/db';
import { commentTable } from '$lib/server/db/schema';

import type { RequestHandler } from './$types';

const editSchema = v.object({
	content: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(500)),
});

export const PUT: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.session) return error(401);

	const requestBody = await request.json();
	const form = v.safeParse(editSchema, requestBody);
	if (!form.success) return error(400);

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

	if (commentUpdate.changes === 0) return error(400);

	return new Response(null, { status: 200 });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.session?.websitesOwnedByCurrentUser?.length) return error(401);

	const deletion = await db
		.delete(commentTable)
		.where(
			and(
				eq(commentTable.id, Number(params.comment_id)),
				or(
					eq(commentTable.authorId, locals.session.user.id),
					inArray(commentTable.websiteId, locals.session.websitesOwnedByCurrentUser)
				)
			)
		);

	if (deletion.changes === 0) return error(401);
	return new Response(null, { status: 200 });
};

export const PATCH: RequestHandler = async ({ params, locals }) => {
	if (!locals.session?.websitesOwnedByCurrentUser?.length) return error(401);

	const commentUpdate = await db
		.update(commentTable)
		.set({
			published: true,
		})
		.where(
			and(
				eq(commentTable.id, Number(params.comment_id)),
				inArray(commentTable.websiteId, locals.session.websitesOwnedByCurrentUser)
			)
		);

	if (commentUpdate.changes === 0) return error(400);

	return new Response(null, { status: 200 });
};
