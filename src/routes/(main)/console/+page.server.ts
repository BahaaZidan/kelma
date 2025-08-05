import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';

import { env } from '$env/dynamic/public';

import { route } from '$lib/routes';
import { getStripe } from '$lib/server/stripe';

import type { Actions, PageServerLoad } from './$types';
import { topUpSchema } from './schemas';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, valibot(topUpSchema));
		if (!form.valid) return fail(400, { form });
		if (!locals.session?.user) return fail(401);

		const redirect_url = new URL(route('/console'), env.PUBLIC_BASE_URL);
		const stripe = getStripe();

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'payment',
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: { name: 'Top-up Balance' },
						unit_amount: Math.round(form.data.amount * 100),
					},
					quantity: 1,
				},
			],
			success_url: `${redirect_url}?checkout_result=success`,
			cancel_url: `${redirect_url}?checkout_result=cancel`,
			metadata: {
				userId: locals.session.user.id,
			},
		});

		return redirect(303, session.url!);
	},
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session?.user) return redirect(303, '/');
};
