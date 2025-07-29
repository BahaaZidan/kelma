import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session?.user) return redirect(303, '/console');
};
