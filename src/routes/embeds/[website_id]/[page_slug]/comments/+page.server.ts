import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

import { db } from '$lib/server/db';
import { pageTable, websiteTable } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

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

	const website = (
		await db
			.select({
				id: websiteTable.id,
				ownerId: websiteTable.ownerId,
				preModeration: websiteTable.preModeration,
			})
			.from(websiteTable)
			.where(eq(websiteTable.id, websiteId))
			.limit(1)
	)[0];
	if (!website) return error(404);

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
	if (!page) return error(500);

	const loggedInUserId = locals.session?.user.id;

	return {
		page,
		permissions: {
			create: !!loggedInUserId && !page.closed,
			publish:
				website.ownerId === locals.session?.user.id ||
				(!website.preModeration && !page.preModeration),
		},
		searchParams,
	};
};
