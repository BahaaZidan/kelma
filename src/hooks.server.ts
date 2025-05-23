import { svelteKitHandler } from 'better-auth/svelte-kit';

import { auth } from '$lib/server/auth';

export async function handle({ event, resolve }) {
	const session = await auth.api.getSession({
		headers: event.request.headers,
	});
	event.locals.session = session;

	return svelteKitHandler({ event, resolve, auth });
}
