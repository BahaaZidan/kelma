import { betterAuth } from 'better-auth';
import { drizzleAdapter, type DB } from 'better-auth/adapters/drizzle';

import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';

import type { UserSelectModel } from './db/schema';

export const getAuth = (db: DB) => {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite',
		}),
		socialProviders: {
			github: {
				clientId: GITHUB_CLIENT_ID,
				clientSecret: GITHUB_CLIENT_SECRET,
			},
		},
		// TODO: only trust paying customers
		trustedOrigins: ['*'],
		baseURL: PUBLIC_BASE_URL,
	});
};

type Auth = ReturnType<typeof getAuth>;
type SessionBase = Auth['$Infer']['Session'];

export type Session = Pick<SessionBase, 'session'> & { user: UserSelectModel } & {
	websitesOwnedByCurrentUser?: number[];
};
