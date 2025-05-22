import { and, desc, eq } from 'drizzle-orm';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { commentTable, pageTable, userTable } from '$lib/server/db/schema';

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
				.from(pageTable)
				.where(
					and(
						eq(pageTable.slug, params.page_slug),
						eq(pageTable.websiteId, Number(params.website_id))
					)
				)
		)[0]?.id;
		if (!pageId) fail(401);

		const insertResult = await db.insert(commentTable).values({
			content: form.data.comment,
			authorId: session.user.id,
			pageId,
		});
		if (insertResult.changes > 0) return message(form, 'Website created successfully!');

		return fail(500);
	},
};

const searchParamsSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	callback_url: v.pipe(v.string(), v.trim(), v.url()),
});

export const load: PageServerLoad = async ({ params, url }) => {
	const { page_slug: pageSlug, website_id } = params;
	const websiteId = Number(website_id);
	const searchParams = v.parse(searchParamsSchema, Object.fromEntries(url.searchParams.entries()));
	const name = searchParams.name;
	const callbackURL = searchParams.callback_url;

	const page_ = (
		await db
			.insert(pageTable)
			.values({ slug: pageSlug, websiteId, name })
			.onConflictDoUpdate({ target: [pageTable.slug, pageTable.websiteId], set: { name } })
			.returning()
	)[0];

	const comments = await db
		.select({
			id: commentTable.id,
			content: commentTable.content,
			createdAt: commentTable.createdAt,
			author: {
				id: userTable.id,
				name: userTable.name,
				image: userTable.image,
			},
		})
		.from(commentTable)
		.orderBy(desc(commentTable.createdAt))
		.where(eq(commentTable.pageId, page_.id))
		.leftJoin(userTable, eq(commentTable.authorId, userTable.id));

	const form = await superValidate(valibot(schema));

	return { form, comments, url: url.toString(), callbackURL };
};
