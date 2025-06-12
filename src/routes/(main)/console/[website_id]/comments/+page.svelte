<script lang="ts">
	import { createInfiniteQuery } from '@tanstack/svelte-query';

	import { route } from '$lib/__generated__/routes';
	import Comment from '$lib/components/Comment.svelte';
	import { commentPermissions } from '$lib/permissions';
	import type { CursorPaginatedComments } from '$lib/server/queries';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const fetchComments = async (cursor?: number | null) =>
		await fetch(
			route('GET /api/[website_id]/comments', { website_id: data.websiteId }) +
				(cursor ? `?cursor=${cursor}` : '')
		).then((r) => r.json() as unknown as CursorPaginatedComments);

	const query = createInfiniteQuery({
		queryKey: ['website_comments', data.websiteId],
		queryFn: ({ pageParam }) => fetchComments(pageParam),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			if (lastPage.hasNextPage) {
				return lastPage.comments[lastPage.comments.length - 1].id;
			}
			return undefined;
		},
		select: (responses) =>
			responses.pages
				.map((p) =>
					p.comments.map((c) => ({
						...c,
						permissions: commentPermissions({ comment: c, session: data.session }),
					}))
				)
				.flat(),
	});
</script>

<div class="flex w-full flex-col gap-4 px-5">
	{#if $query.isPending}
		<div>Loading...</div>
	{/if}
	{#if $query.error}
		<span>Error: {$query.error.message}</span>
	{/if}
	{#if $query.data}
		{#each $query.data as comment (comment.id)}
			<Comment
				{...comment}
				redirect_url={route('/console/[website_id]/comments', { website_id: data.websiteId })}
			/>
		{/each}
	{/if}
	<button
		class="btn"
		onclick={() => $query.fetchNextPage()}
		disabled={!$query.hasNextPage || $query.isFetchingNextPage}
	>
		{#if $query.isFetching}
			Loading more...
		{:else if $query.hasNextPage}
			Load More
		{:else}Nothing more to load{/if}
	</button>
</div>
