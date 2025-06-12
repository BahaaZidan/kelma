<script lang="ts">
	import { route } from '$lib/__generated__/routes';
	import Comment from '$lib/components/Comment.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex w-full flex-col gap-4 px-5">
	{#each data.comments as comment (comment.id)}
		<Comment
			{...comment}
			redirect_url={route('/console/[website_id]/comments', { website_id: data.websiteId })}
		/>
	{/each}
</div>
