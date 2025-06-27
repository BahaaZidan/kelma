import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { inferDir } from '$lib/i18n';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';

const handleAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

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
