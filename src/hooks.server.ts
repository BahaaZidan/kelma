import { redirect } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';

export async function handle({ event, resolve }) {
	// Suppress well-known Chrome DevTools requests
	if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
		return new Response(null, { status: 204 }); // Return empty response with 204 No Content
	}

	const session = await auth.api.getSession({
		headers: event.request.headers,
	});
	event.locals.session = session;

	if (event.locals.session && session) {
		const websitesOwnedByCurrentUser = (
			await db.query.website.findMany({
				columns: { id: true },
				where: (t, { eq }) => eq(t.ownerId, session.user.id),
			})
		).map((w) => w.id);
		event.locals.session.websitesOwnedByCurrentUser = websitesOwnedByCurrentUser;
	}

	if (event.url.pathname.includes('console') && !session?.user) throw redirect(303, '/');

	return svelteKitHandler({ event, resolve, auth });
}
