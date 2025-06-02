<script lang="ts">
	import { ArrowLeftIcon } from '@lucide/svelte';

	import { route } from '$lib/__generated__/routes';
	import Comment from '$lib/components/Comment.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex w-full flex-col gap-4 px-5">
	<a class="btn" href={route('/console/[website_id]/pages', { website_id: data.websiteId })}>
		<ArrowLeftIcon /> Back to pages
	</a>
	{#each data.comments as comment (comment.id)}
		<Comment author={comment.author} content={comment.content} createdAt={comment.createdAt} />
	{/each}
</div>
