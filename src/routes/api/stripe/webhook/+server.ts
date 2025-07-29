import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';

import { env } from '$env/dynamic/private';

import { PAGEVIEW_COST_SCALER } from '$lib/constants';
import { logger } from '$lib/logger';
import { getDB } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { getStripe } from '$lib/server/stripe';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
	const rawBody = await request.text();
	const signature = request.headers.get('stripe-signature');
	const stripe = getStripe();

	let event: Stripe.Event;
	try {
		logger({ signature, SECRET_STRIPE_WEBHOOK: env.SECRET_STRIPE_WEBHOOK });
		logger({ rawBody });
		event = stripe.webhooks.constructEvent(rawBody, signature!, env.SECRET_STRIPE_WEBHOOK);
	} catch (_err) {
		logger({ message: 'Bad signature', _err });
		return new Response('Bad signature', { status: 400 });
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		const userId = session.metadata?.userId;
		const amount_in_cents = session.amount_total!;

		logger({ session, userId, amount_in_cents });

		if (userId && amount_in_cents) {
			try {
				const db = getDB(platform?.env.DB);
				await db
					.update(userTable)
					.set({ balance: sql`${userTable.balance} + ${amount_in_cents * PAGEVIEW_COST_SCALER}` })
					.where(eq(userTable.id, userId));
			} catch (_e) {
				logger({ db_error: _e });
				return new Response('Something went wrong!', { status: 500 });
			}
		}
	}

	return new Response(undefined, { status: 200 });
};
