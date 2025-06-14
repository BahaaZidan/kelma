<script lang="ts">
	import type { createCursorPaginatedCommentsQuery } from '$lib/client/queries';

	import Comment from './Comment.svelte';

	interface Props {
		query: ReturnType<typeof createCursorPaginatedCommentsQuery>;
	}
	let { query }: Props = $props();
</script>

<div class="flex w-full flex-col gap-4 px-2">
	{#if $query.isPending}
		<div>Loading...</div>
	{/if}
	{#if $query.error}
		<span>Error: {$query.error.message}</span>
	{/if}
	{#if $query.data}
		{#each $query.data as comment (comment.id)}
			<Comment {...comment} />
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
