import { createInfiniteQuery } from '@tanstack/svelte-query';

import { commentPermissions } from '$lib/permissions';
import type { Session } from '$lib/server/auth';
import type { CursorPaginatedComments } from '$lib/server/queries';

export function createCursorPaginatedCommentsQuery(
	endpoint: string,
	queryKey: (string | number)[],
	session?: Pick<Session, 'user' | 'websitesOwnedByCurrentUser'>
) {
	const fetchComments = async (cursor?: number | null) =>
		await fetch(endpoint + (cursor ? `?cursor=${cursor}` : '')).then(
			(r) => r.json() as unknown as CursorPaginatedComments
		);

	const query = createInfiniteQuery({
		queryKey: ['comments', ...queryKey],
		queryFn: ({ pageParam }) => fetchComments(pageParam),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			if (lastPage.hasNextPage) {
				return lastPage.comments[lastPage.comments.length - 1].id;
			}
			return undefined;
		},
		select: (responses) =>
			responses.pages.flatMap((p) =>
				p.comments.map((c) => ({
					...c,
					permissions: commentPermissions({ comment: c, session }),
				}))
			),
	});

	return query;
}
