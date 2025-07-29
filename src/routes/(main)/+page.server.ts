import { env } from '$env/dynamic/public';

import { route } from '$lib/routes';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session?.user) return { cta_route: route('/console') };
	return {
		cta_route: `${route('/login')}?callback_url=${env.PUBLIC_BASE_URL + route('/console')}`,
	};
};
