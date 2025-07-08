import Stripe from 'stripe';

import { env } from '$env/dynamic/private';

export const stripe = new Stripe(env.SECRET_STRIPE_KEY, { apiVersion: '2025-06-30.basil' });
