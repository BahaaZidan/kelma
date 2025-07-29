import { betterAuth } from 'better-auth';
import { drizzleAdapter, type DB } from 'better-auth/adapters/drizzle';

import { env as privateVars } from '$env/dynamic/private';
import { env as publicVars } from '$env/dynamic/public';

import type { UserSelectModel } from './db/schema';

export const getAuth = (db: DB) => {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite',
		}),
		socialProviders: {
			github: {
				clientId: publicVars.PUBLIC_GITHUB_CLIENT_ID,
				clientSecret: privateVars.GITHUB_CLIENT_SECRET,
			},
			google: {
				clientId: privateVars.AUTH_GOOGLE_ID,
				clientSecret: privateVars.AUTH_GOOGLE_SECRET,
			},
		},
		trustedOrigins: ['*'],
		advanced: {
			defaultCookieAttributes: {
				sameSite: 'None',
				secure: true,
			},
		},
		baseURL: publicVars.PUBLIC_BASE_URL,
		user: {
			additionalFields: {
				balance: {
					type: 'number',
					// WORKAROUND: betterauth is dogshit
					defaultValue: 50_000,
				},
			},
		},
	});
};

type Auth = ReturnType<typeof getAuth>;
type SessionBase = Auth['$Infer']['Session'];

export type Session = Pick<SessionBase, 'session'> & { user: UserSelectModel } & {
	websitesOwnedByCurrentUser?: number[];
};
