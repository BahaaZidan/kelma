import type { RequestEvent } from '@sveltejs/kit';
import DataLoader from 'dataloader';
import { count, inArray } from 'drizzle-orm';
import type { YogaInitialContext } from 'graphql-yoga';

import type { DB } from '$lib/server/db';
import { pageTable, replyTable, userTable, websiteTable } from '$lib/server/db/schema';

export function createLoaders(db: DB) {
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
		repliesCounts: new DataLoader<number, number>(async (keys) => {
			const commentIds = [...keys];
			const rows = await db
				.select({
					commentId: replyTable.commentId,
					count: count(),
				})
				.from(replyTable)
				.where(inArray(replyTable.commentId, commentIds))
				.groupBy(replyTable.commentId);

			const countMap = new Map<number, number>();
			for (const row of rows) {
				countMap.set(row.commentId, row.count);
			}

			return commentIds.map((id) => countMap.get(id) ?? 0);
		}),
	};
}

export type Context = YogaInitialContext &
	RequestEvent & { loaders: ReturnType<typeof createLoaders>; db: DB };
