import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';

import { load_ConsoleQuery } from '$houdini';

import type { PageLoad } from './$houdini';
import { topUpSchema } from './schemas';

export const load: PageLoad = async (event) => {
	const form = await superValidate(valibot(topUpSchema));

	return {
		form,
		...(await load_ConsoleQuery({ event })),
	};
};
