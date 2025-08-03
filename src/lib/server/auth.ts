import { betterAuth } from 'better-auth';
import type { BetterAuthPlugin } from 'better-auth';
import { drizzleAdapter, type DB } from 'better-auth/adapters/drizzle';
import { bearer, createAuthMiddleware } from 'better-auth/plugins';

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
		plugins: [bearer(), plugin()],
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

const plugin = () => {
	return {
		id: 'my-plugin',
		hooks: {
			after: [
				{
					matcher(context) {
						return context.path === '/callback/:id';
					},
					handler: createAuthMiddleware(async (context) => {
						const token =
							context.context.newSession?.session.token ||
							context.context.responseHeaders?.get('set-auth-token');
						const location = context.context.responseHeaders?.get('location');

						const dist = new URL(`?token=${token}`, location!).toString();
						throw context.redirect(dist);
					}),
				},
			],
		},
	} satisfies BetterAuthPlugin;
};
