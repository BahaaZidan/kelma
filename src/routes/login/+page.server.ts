import * as v from 'valibot';

import { env } from '$env/dynamic/public';

import type { PageServerLoad } from './$types';

const schema = v.pipe(v.string(), v.trim(), v.url());

export const load: PageServerLoad = async ({ url }) => {
	const validation = v.safeParse(schema, url.searchParams.get('callback_url'));
	const callbackURL = validation.success ? validation.output : env.PUBLIC_BASE_URL;

	return { url: url.toString(), callbackURL };
};
