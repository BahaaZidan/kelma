import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

import { db } from '$lib/server/db';
import { commentTable, pageTable, websiteTable } from '$lib/server/db/schema';
import { fetchPageComments, fetchUnpublishedUserCommentsByPage } from '$lib/server/fetchers';

import type { Actions, PageServerLoad } from './$types';

const schema = v.object({
	comment: v.pipe(v.string(), v.trim(), v.minLength(4), v.maxLength(300)),
});

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.session) return fail(401);

		const form = await superValidate(request, valibot(schema));
		if (!form.valid) {
			return message(form, 'Invalid comment!');
		}

		const page = (
			await db
				.select({
					id: pageTable.id,
					closed: pageTable.closed,
					preModeration: pageTable.preModeration,
					website: {
						id: websiteTable.id,
						ownerId: websiteTable.ownerId,
						preModeration: websiteTable.preModeration,
					},
				})
				.from(pageTable)
				.where(
					and(
						eq(pageTable.slug, params.page_slug),
						eq(pageTable.websiteId, Number(params.website_id))
					)
				)
				.leftJoin(websiteTable, eq(pageTable.websiteId, websiteTable.id))
				.limit(1)
		)[0];
		if (!page) return fail(400);
		if (page.closed) return fail(401);

		const insertResult = await db.insert(commentTable).values({
			content: form.data.comment,
			authorId: locals.session.user.id,
			pageId: page.id,
			published:
				page.website?.ownerId === locals.session.user.id ||
				(!page.website?.preModeration && !page.preModeration),
		});
		if (insertResult.changes > 0) return message(form, 'Comment submitted successfully!');

		return fail(500);
	},
};

const searchParamsSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	url: v.pipe(v.string(), v.trim(), v.url()),
});

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const { page_slug: pageSlug, website_id } = params;
	const websiteId = Number(website_id);
	const searchParamsValidation = v.safeParse(
		searchParamsSchema,
		Object.fromEntries(url.searchParams.entries())
	);
	if (!searchParamsValidation.success)
		return error(400, searchParamsValidation.issues.map((i) => i.message).join('\n'));

	const searchParams = searchParamsValidation.output;
	const page = (
		await db
			.insert(pageTable)
			.values({ slug: pageSlug, websiteId, name: searchParams.name, url: searchParams.url })
			.onConflictDoUpdate({
				target: [pageTable.slug, pageTable.websiteId],
				set: { name: searchParams.name, url: searchParams.url },
			})
			.returning()
	)[0];

	const { comments, permissions } = await fetchPageComments(page.id, locals.session?.user.id, true);
	const unpublishedCommentsByCurrentUser = await fetchUnpublishedUserCommentsByPage(
		page.id,
		locals.session?.user
	);

	const form = await superValidate(valibot(schema));

	return { form, comments, permissions, searchParams, unpublishedCommentsByCurrentUser };
};
