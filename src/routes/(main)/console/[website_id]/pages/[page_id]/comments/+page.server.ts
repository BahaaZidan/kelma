import { fetchPageComments } from '$lib/server/fetchers';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const comments = await fetchPageComments(Number(params.page_id));
	return { comments };
};
