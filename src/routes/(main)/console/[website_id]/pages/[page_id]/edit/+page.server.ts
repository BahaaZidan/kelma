import { error } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

import { db } from '$lib/server/db';
import { pageTable } from '$lib/server/db/schema';

import type { Actions, PageServerLoad } from './$types';

const schema = v.object({
	closed: v.boolean(),
	preModeration: v.boolean(),
});

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.session) return fail(401);

		const form = await superValidate(request, valibot(schema));
		if (!form.valid) {
			return message(form, 'Bad Request!');
		}

		const updateResult = await db
			.update(pageTable)
			.set({
				closed: form.data.closed,
				preModeration: form.data.preModeration,
			})
			.where(
				and(
					eq(pageTable.id, Number(params.page_id)),
					inArray(pageTable.websiteId, locals.session.websitesOwnedByCurrentUser!)
				)
			);

		if (updateResult.changes > 0) return message(form, 'Page updated successfully!');

		return fail(500);
	},
};

export const load: PageServerLoad = async ({ params }) => {
	const page = await db.query.page.findFirst({
		where: (t, { eq }) => eq(t.id, Number(params.page_id)),
	});
	if (!page) return error(404);

	const form = await superValidate(page, valibot(schema));

	return { form };
};
