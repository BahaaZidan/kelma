import type { RequestEvent } from '@sveltejs/kit';
import DataLoader from 'dataloader';
import { and, count, eq, inArray, isNotNull, or } from 'drizzle-orm';
import type { YogaInitialContext } from 'graphql-yoga';

import type { DB } from '$lib/server/db';
import {
	commentTable,
	likesTable,
	membershipTable,
	pageTable,
	userTable,
	websiteTable,
	type UserSelectModel,
} from '$lib/server/db/schema';

export function createLoaders(db: DB) {
	return {
		users: new DataLoader(async (keys: readonly string[]) => {
			const users = await db
				.select()
				.from(userTable)
				.where(inArray(userTable.id, keys as string[]));

			const userMap = new Map(users.map((user) => [user.id, user]));
			return keys.map((key) => userMap.get(key) ?? null);
		}),
		pages: new DataLoader(async (keys: readonly number[]) => {
			const pages = await db
				.select()
				.from(pageTable)
				.where(inArray(pageTable.id, keys as number[]));

			const pageMap = new Map(pages.map((page) => [page.id, page]));
			return keys.map((key) => pageMap.get(key) ?? null);
		}),
		websites: new DataLoader(async (keys: readonly number[]) => {
			const websites = await db
				.select()
				.from(websiteTable)
				.where(inArray(websiteTable.id, keys as number[]));

			const websiteMap = new Map(websites.map((site) => [site.id, site]));
			return keys.map((key) => websiteMap.get(key) ?? null);
		}),
		repliesCounts: new DataLoader<number, number>(async (commentIds) => {
			const rows = await db
				.select({
					parentId: commentTable.parentId,
					count: count(),
				})
				.from(commentTable)
				.where(
					and(
						inArray(commentTable.parentId, commentIds as number[]),
						isNotNull(commentTable.parentId)
					)
				)
				.groupBy(commentTable.parentId);

			const countsMap = new Map<number, number>();
			for (const row of rows) {
				if (row.parentId) {
					countsMap.set(row.parentId, Number(row.count));
				}
			}

			return commentIds.map((id) => countsMap.get(id) ?? 0);
		}),
		websiteBannedUsers: new DataLoader<number, UserSelectModel[]>(async (websiteIds) => {
			const results = await db
				.select({
					websiteId: membershipTable.websiteId,
					user: userTable,
				})
				.from(membershipTable)
				.innerJoin(userTable, eq(membershipTable.userId, userTable.id))
				.where(
					and(
						inArray(membershipTable.websiteId, websiteIds as number[]),
						eq(membershipTable.banned, true)
					)
				);

			const grouped = new Map<number, UserSelectModel[]>();
			for (const { websiteId, user } of results) {
				if (!grouped.has(websiteId)) {
					grouped.set(websiteId, []);
				}
				grouped.get(websiteId)!.push(user);
			}

			return websiteIds.map((id) => grouped.get(id) ?? []);
		}),
		isLikedByUser: new DataLoader<LikedByUserKey, boolean>(async (keys) => {
			const rows = await db
				.select({ liker: likesTable.liker, commentId: likesTable.commentId })
				.from(likesTable)
				.where(
					or(
						...keys.map((k) =>
							and(eq(likesTable.liker, k.userId), eq(likesTable.commentId, k.commentId))
						)
					)
				);

			const existing = new Set(rows.map((r) => `${r.liker}:${r.commentId}`));

			return keys.map(({ userId, commentId }) => existing.has(`${userId}:${commentId}`));
		}),
	};
}
type LikedByUserKey = { userId: string; commentId: number };

export type Context = YogaInitialContext &
	RequestEvent & { loaders: ReturnType<typeof createLoaders>; db: DB };
