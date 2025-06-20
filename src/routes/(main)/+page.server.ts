import { error, redirect } from '@sveltejs/kit';

import { route } from '$lib/__generated__/routes';
import { toGlobalId } from '$lib/global-id-utils';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { commentTable, pageTable, websiteTable } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

const userEmail = 'admin@admin.com';
const websiteId = 42;
const pageSlug = 'example-page';
const page_title = 'Example Page';
const page_url = 'https://gebna.gg/blog/complex-defaults';

const redirectTarget = `${route('/embeds/[website_id]/[page_slug]/comments', {
	website_id: toGlobalId('Website', websiteId),
	page_slug: pageSlug,
})}?url=${page_url}&name=${page_title}`;

async function getUser() {
	try {
		const { user } = await auth.api.signUpEmail({
			body: {
				email: userEmail,
				password: 'adminnnn',
				name: 'admin',
			},
		});
		return user;
	} catch (_error) {
		return redirect(303, redirectTarget);
	}
	// return await db.query.user.findFirst({ where: (t, { eq }) => eq(t.email, userEmail) });
}

export const load: PageServerLoad = async () => {
	const user = await getUser();

	if (!user) return error(500);

	const website = (
		await db
			.insert(websiteTable)
			.values({
				id: websiteId,
				name: 'example',
				domains: ['example.com'],
				ownerId: user.id,
			})
			.onConflictDoNothing()
			.returning()
	)[0];

	const page = (
		await db
			.insert(pageTable)
			.values({
				slug: pageSlug,
				websiteId: website.id,
				name: 'wow an example page',
				url: 'https://gebna.gg/blog/complex-defaults',
			})
			.onConflictDoNothing()
			.returning()
	)[0];

	for (let index = 0; index < 25; index++) {
		const date = new Date();
		date.setDate(date.getDate() - index);

		await db
			.insert(commentTable)
			.values({
				id: index,
				authorId: user.id,
				pageId: page.id,
				websiteId: website.id,
				content: `Comment number: ${25 - index}`,
				createdAt: date,
				updatedAt: date,
			})
			.onConflictDoNothing();
	}

	return redirect(303, redirectTarget);
};
