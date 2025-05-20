import { and, eq } from 'drizzle-orm';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { comment, page } from '$lib/server/db/schema';

import type { Actions, PageServerLoad } from './$types';

const schema = v.object({
	comment: v.pipe(v.string(), v.trim(), v.minLength(4), v.maxLength(300)),
});

export const actions: Actions = {
	default: async ({ request, params }) => {
		const session = await auth.api.getSession({
			headers: request.headers,
		});
		if (!session) return fail(401);

		const form = await superValidate(request, valibot(schema));
		if (!form.valid) {
			return message(form, 'Invalid name or domain!');
		}

		const pageId = (
			await db
				.select()
				.from(page)
				.where(and(eq(page.slug, params.page_slug), eq(page.websiteId, Number(params.website_id))))
		)[0]?.id;
		if (!pageId) fail(401);

		const insertResult = await db.insert(comment).values({
			content: form.data.comment,
			authorId: session.user.id,
			pageId,
		});
		if (insertResult.changes > 0) return message(form, 'Website created successfully!');

		return fail(500);
	},
};

export const load: PageServerLoad = async ({ params, url }) => {
	const { page_slug: pageSlug, website_id } = params;
	const websiteId = Number(website_id);
	const name = url.searchParams.get('name');

	const page_ = (
		await db
			.insert(page)
			.values({ slug: pageSlug, websiteId, name })
			.onConflictDoUpdate({ target: [page.slug, page.websiteId], set: { name } })
			.returning()
	)[0];

	const comments = await db.select().from(comment).where(eq(comment.pageId, page_.id));

	const form = await superValidate(valibot(schema));

	return { form, comments, url: url.toString() };
};
