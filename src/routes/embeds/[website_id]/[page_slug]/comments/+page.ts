import { error } from '@sveltejs/kit';
import * as v from 'valibot';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
	const { page_slug: slug, website_id } = params;
	const searchParamsValidation = v.safeParse(
		searchParamsSchema,
		Object.fromEntries(url.searchParams.entries())
	);
	if (!searchParamsValidation.success)
		return error(400, searchParamsValidation.issues.map((i) => i.message).join('\n'));
	const searchParams = searchParamsValidation.output;
	return {
		queryVariables: {
			websiteId: website_id,
			pageInput: {
				slug,
				overrides: {
					name: searchParams.name,
					url: searchParams.url,
				},
			},
		},
	};
};

const searchParamsSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	url: v.pipe(v.string(), v.trim(), v.url()),
});
