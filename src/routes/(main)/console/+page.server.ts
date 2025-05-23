import { fail, message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';

import { db } from '$lib/server/db';
import { websiteTable } from '$lib/server/db/schema';

import type { Actions, PageServerLoad } from './$types';

const schema = v.object({
	name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	// TODO: appropriate domain validation
	domain: v.pipe(v.string(), v.trim(), v.nonEmpty()),
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session) return fail(401);

		const form = await superValidate(request, valibot(schema));
		if (!form.valid) {
			return message(form, 'Invalid name or domain!');
		}

		const insertResult = await db
			.insert(websiteTable)
			.values({
				ownerId: locals.session.user.id,
				name: form.data.name,
				domains: [form.data.domain],
			});

		if (insertResult.changes > 0) return message(form, 'Website created successfully!');

		return fail(500);
	},
};

export const load: PageServerLoad = async () => {
	const form = await superValidate(valibot(schema));

	return { form };
};
