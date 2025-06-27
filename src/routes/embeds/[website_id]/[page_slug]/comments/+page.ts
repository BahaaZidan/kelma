import { error } from '@sveltejs/kit';
import themeObject from 'daisyui/theme/object';
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
		theme: searchParams.theme,
		lang: searchParams.lang,
		dir: searchParams.dir,
	};
};

const supportedLanguages = ['ar', 'en'] as const;
const supportedThemes = Object.keys(themeObject);

const searchParamsSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	url: v.pipe(v.string(), v.trim(), v.url()),
	theme: v.optional(v.picklist(supportedThemes), 'business'),
	lang: v.optional(v.picklist(supportedLanguages), 'en'),
	dir: v.optional(v.picklist(['rtl', 'ltr']), 'ltr'),
});
