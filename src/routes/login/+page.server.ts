import * as v from 'valibot';

import type { PageServerLoad } from './$types';

const schema = v.pipe(v.string(), v.trim(), v.url());

export const load: PageServerLoad = async ({ url }) => {
	const callbackURL = v.parse(schema, url.searchParams.get('callback_url'));

	return { url: url.toString(), callbackURL };
};
