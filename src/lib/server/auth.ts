import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

// import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

import { db } from './db';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: 'Iv33lifPE8V2JMMVCsML',
			clientSecret: 'feb01cf23455d22ef5d655ed5fd3030ce85bd86q',
		},
	},
	// TODO: only trust paying customers
	trustedOrigins: ['*'],
});

export type Session = typeof auth.$Infer.Session & { websitesOwnedByCurrentUser?: number[] };
