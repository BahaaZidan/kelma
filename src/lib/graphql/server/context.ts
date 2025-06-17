import type { RequestEvent } from '@sveltejs/kit';
import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import type { YogaInitialContext } from 'graphql-yoga';

import { db } from '$lib/server/db';
import { pageTable, userTable, websiteTable } from '$lib/server/db/schema';

export function createLoaders() {
	return {
		users: new DataLoader(async (keys: readonly string[]) => {
			const usersIds = [...keys];
			const users = await db.select().from(userTable).where(inArray(userTable.id, usersIds));
			return users;
		}),
		pages: new DataLoader(async (keys: readonly number[]) => {
			const pageIds = [...keys];
			const pages = await db.select().from(pageTable).where(inArray(pageTable.id, pageIds));
			return pages;
		}),
		websites: new DataLoader(async (keys: readonly number[]) => {
			const websiteIds = [...keys];
			const websites = await db
				.select()
				.from(websiteTable)
				.where(inArray(websiteTable.id, websiteIds));
			return websites;
		}),
	};
}

export type Context = YogaInitialContext &
	RequestEvent & { loaders: ReturnType<typeof createLoaders> };
