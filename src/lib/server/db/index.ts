import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { DATABASE_URL } from '$env/static/private';

import {
	accountTable,
	commentTable,
	pageTable,
	sessionTable,
	userTable,
	verificationTable,
	websiteTable,
} from './schema';

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(DATABASE_URL);

export const db = drizzle(client, {
	schema: {
		// DON'T CHANGE - START (better-auth expects these names)
		user: userTable,
		session: sessionTable,
		account: accountTable,
		verification: verificationTable,
		// DON'T CHANGE - END
		website: websiteTable,
		page: pageTable,
		comment: commentTable,
	},
});
