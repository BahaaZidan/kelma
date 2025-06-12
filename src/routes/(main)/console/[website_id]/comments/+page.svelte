<script lang="ts">
	import { onMount } from 'svelte';

	import { route } from '$lib/__generated__/routes';
	import Comment from '$lib/components/Comment.svelte';
	import { commentPermissions } from '$lib/permissions';
	import type { CommentsBaseQueryResult } from '$lib/server/queries';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let loading = $state(true);
	let fetchedComments: CommentsBaseQueryResult = $state([]);

	onMount(async () => {
		fetchedComments = await fetch(
			route('GET /api/[website_id]/comments', { website_id: data.websiteId }) +
				'?pageSize=5&cursor=23'
		).then((r) => r.json());
		loading = false;
	});

	let comments = $derived(
		fetchedComments.map((comment) => ({
			...comment,
			permissions: commentPermissions({ comment, session: data.session }),
		}))
	);
</script>

<div class="flex w-full flex-col gap-4 px-5">
	{#if loading}
		<div>Loading...</div>
	{/if}
	{#each comments as comment (comment.id)}
		<Comment
			{...comment}
			redirect_url={route('/console/[website_id]/comments', { website_id: data.websiteId })}
		/>
	{/each}
</div>
