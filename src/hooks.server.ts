import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { type Locale } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getAuth, type Session } from '$lib/server/auth';
import { getDB } from '$lib/server/db';

const handleAuth: Handle = async ({ event, resolve }) => {
	const db = getDB(event.platform?.env.DB);
	const auth = getAuth(db);
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.session = session as Session;

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
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', inferDir(locale)),
		});
	});

export const handle = sequence(handleAuth, handleParaglide);

function inferDir(lang: Locale): 'rtl' | 'ltr' {
	if (lang === 'ar') return 'rtl';
	return 'ltr';
}
