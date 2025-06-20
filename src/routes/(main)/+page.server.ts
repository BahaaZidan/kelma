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

	const days = 26; // from 25 days ago to today = 26 days total
	const start = new Date();
	start.setDate(start.getDate() - 25); // 25 days ago

	for (let i = 0; i < days; i++) {
		const date = new Date(start); // clone the start date
		date.setDate(start.getDate() + i); // add i days

		await db
			.insert(commentTable)
			.values({
				id: i,
				authorId: user.id,
				pageId: page.id,
				websiteId: website.id,
				content: `Commented on: ${date}`,
				createdAt: date,
				updatedAt: date,
			})
			.onConflictDoNothing();
	}

	return redirect(303, redirectTarget);
};
