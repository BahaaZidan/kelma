import type { RequestEvent } from '@sveltejs/kit';
import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import type { YogaInitialContext } from 'graphql-yoga';

import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';

export function createLoaders() {
	return {
		users: new DataLoader(async (keys: readonly string[]) => {
			const usersIds = [...keys];
			const users = await db.select().from(userTable).where(inArray(userTable.id, usersIds));
			return users;
		}),
	};
}

export type Context = YogaInitialContext &
	RequestEvent & { loaders: ReturnType<typeof createLoaders> };
