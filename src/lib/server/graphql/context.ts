import type { RequestEvent } from '@sveltejs/kit';
import DataLoader from 'dataloader';
import { and, count, eq, inArray, or } from 'drizzle-orm';
import type { YogaInitialContext } from 'graphql-yoga';

import type { DB } from '$lib/server/db';
import {
	likesTable,
	membershipTable,
	pageTable,
	replyTable,
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
		likesCount: new DataLoader<LikesCountKey, number>(async (keys) => {
			const commentIds = keys.filter((k) => k.type === 'Comment').map((k) => k.id);
			const replyIds = keys.filter((k) => k.type === 'Reply').map((k) => k.id);

			const rows = await db
				.select()
				.from(likesTable)
				.where(
					or(
						inArray(likesTable.commentId, commentIds as number[]),
						inArray(likesTable.replyId, replyIds as number[])
					)
				);

			const map = new Map<string, number>();

			for (const row of rows) {
				if (row.commentId)
					map.set(`Comment:${row.commentId}`, (map.get(`Comment:${row.commentId}`) ?? 0) + 1);
				if (row.replyId)
					map.set(`Reply:${row.replyId}`, (map.get(`Reply:${row.replyId}`) ?? 0) + 1);
			}

			return keys.map(({ type, id }) => map.get(`${type}:${id}`) ?? 0);
		}),
		isLikedByUser: new DataLoader<LikedByUserKey, boolean>(async (keys) => {
			const commentKeys = keys.filter((k) => k.type === 'Comment');
			const replyKeys = keys.filter((k) => k.type === 'Reply');

			const rows = await db
				.select()
				.from(likesTable)
				.where(
					or(
						...[
							...commentKeys.map((k) =>
								and(eq(likesTable.liker, k.userId), eq(likesTable.commentId, k.id))
							),
							...replyKeys.map((k) =>
								and(eq(likesTable.liker, k.userId), eq(likesTable.replyId, k.id))
							),
						]
					)
				);

			const set = new Set<string>();
			for (const r of rows) {
				if (r.commentId) set.add(`${r.liker}:Comment:${r.commentId}`);
				if (r.replyId) set.add(`${r.liker}:Reply:${r.replyId}`);
			}

			return keys.map(({ userId, type, id }) => set.has(`${userId}:${type}:${id}`));
		}),
	};
}
type LikesCountKey = { type: 'Comment' | 'Reply'; id: number };
type LikedByUserKey = { userId: string; type: 'Comment' | 'Reply'; id: number };

export type Context = YogaInitialContext &
	RequestEvent & { loaders: ReturnType<typeof createLoaders>; db: DB };
