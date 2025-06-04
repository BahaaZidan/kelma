import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

import { db } from '$lib/server/db';
import { websiteTable } from '$lib/server/db/schema';

import type { Actions, PageServerLoad } from './$types';

const schema = v.object({
	name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	preModeration: v.boolean(),
});

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.session) return fail(401);

		const form = await superValidate(request, valibot(schema));
		if (!form.valid) {
			return message(form, 'Invalid form values!');
		}

		const updateResult = await db
			.update(websiteTable)
			.set({
				name: form.data.name,
				preModeration: form.data.preModeration,
			})
			.where(
				and(
					eq(websiteTable.id, Number(params.website_id)),
					eq(websiteTable.ownerId, locals.session.user.id)
				)
			);

		if (updateResult.changes > 0) return message(form, 'Website updated successfully!');

		return fail(500);
	},
};

export const load: PageServerLoad = async ({ params }) => {
	const website = await db.query.website.findFirst({
		where: (t, { eq }) => eq(t.id, Number(params.website_id)),
	});
	if (!website) return error(404);

	const form = await superValidate(website, valibot(schema));

	return { form };
};
