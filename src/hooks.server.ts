import { error, redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { eq, sql } from 'drizzle-orm';

import { PAGEVIEW_COST_IN_CENTS } from '$lib/constants';
import { type Locale } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getAuth, type Session } from '$lib/server/auth';
import { getDB } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { fromGlobalId } from '$lib/server/graphql/utils';

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

const handleEmbedPageview: Handle = async ({ event, resolve }) => {
	const response = resolve(event);
	if (event.route.id === '/embeds/[website_id]/[page_slug]/comments' && event.params.website_id) {
		const website_id = Number(fromGlobalId(event.params.website_id).id);
		const db = getDB(event.platform?.env.DB);
		const website = await db.query.website.findFirst({
			columns: { ownerId: true },
			where: (t, { eq }) => eq(t.id, website_id),
		});
		if (!website) return error(404);

		try {
			const balance_decrement_result = await db
				.update(userTable)
				.set({ balance_in_cents: sql`${userTable.balance_in_cents} - ${PAGEVIEW_COST_IN_CENTS}` })
				.where(eq(userTable.id, website.ownerId));

			if (!balance_decrement_result.success) return error(402);
		} catch (_e) {
			return error(402);
		}
	}

	return response;
};

export const handle = sequence(handleAuth, handleParaglide, handleEmbedPageview);

function inferDir(lang: Locale): 'rtl' | 'ltr' {
	if (lang === 'ar') return 'rtl';
	return 'ltr';
}
