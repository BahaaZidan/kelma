import { drizzle } from 'drizzle-orm/d1';

import {
	accountTable,
	commentTable,
	pageTable,
	replyTable,
	sessionTable,
	userTable,
	verificationTable,
	websiteTable,
} from './schema';

const schema = {
	// DON'T CHANGE - START (better-auth expects these names)
	user: userTable,
	session: sessionTable,
	account: accountTable,
	verification: verificationTable,
	// DON'T CHANGE - END
	website: websiteTable,
	page: pageTable,
	comment: commentTable,
	reply: replyTable,
};

export type DB = ReturnType<typeof drizzle<typeof schema>>;
export const getDB = (db?: D1Database): DB => {
	if (!db) throw new Error('DATABASE NOT FOUND!');
	return drizzle<typeof schema>(db, {
		schema,
	});
};
