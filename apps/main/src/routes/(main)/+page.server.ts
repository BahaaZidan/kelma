import { redirect } from '@sveltejs/kit';

import { route } from '$lib/routes';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session?.user) return redirect(303, route('/console'));
};
