import { fetchPageComments } from '$lib/server/fetchers';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { comments } = await fetchPageComments(Number(params.page_id), locals.session?.user.id);
	return { comments };
};
