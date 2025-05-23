import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (locals.session)
		return {
			session: {
				user: locals.session.user,
			},
		};
};
