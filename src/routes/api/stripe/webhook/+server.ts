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
	const payload = Buffer.from(await request.arrayBuffer());
	const signature = request.headers.get('stripe-signature');
	if (!signature) return new Response('Missing signature', { status: 400 });
	const stripe = getStripe();

	let event: Stripe.Event;
	try {
		logger({ signature, payload });
		event = stripe.webhooks.constructEvent(payload, signature, env.SECRET_STRIPE_WEBHOOK);
	} catch (_err) {
		logger({
			message: 'Bad signature',
			_err,
			errortype: typeof _err,
			props: Object.entries(_err as object),
		});
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
