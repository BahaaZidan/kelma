<script lang="ts">
	import { onMount } from 'svelte';

	import { route } from '$lib/__generated__/routes';
	import { signOut } from '$lib/client/auth';
	import { createCursorPaginatedCommentsQuery } from '$lib/client/queries';
	import CommentsList from '$lib/components/CommentsList.svelte';
	import TextArea from '$lib/components/TextArea.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const query = createCursorPaginatedCommentsQuery(
		route('GET /api/[website_id]/[page_id]/comments', {
			website_id: data.page.websiteId,
			page_id: data.page.id,
		}),
		['embeded_comments', data.page.id],
		data.session
	);

	function sendHeight() {
		const height = document.body.scrollHeight;
		window.parent.postMessage(
			{
				type: 'resize',
				height: height,
			},
			'*'
		);
	}

	onMount(() => {
		window.addEventListener('load', sendHeight);
		const observer = new MutationObserver(sendHeight);
		observer.observe(document.body, { childList: true, subtree: true, attributes: true });
	});
</script>

<div class="flex flex-col items-center gap-2">
	<div class="flex w-full items-center justify-between">
		{#if data.session}
			<div>
				Logged in as <b>{data.session.user.name}</b>
			</div>
			<button class="btn btn-ghost" onclick={signOut}>Logout</button>
		{:else}
			<span>
				You must <a
					class="link font-bold"
					target="_top"
					href="{route('/embeds/login')}?callback_url={data.searchParams.url}"
				>
					login
				</a>
				to comment
			</span>
		{/if}
	</div>
	<!-- <form method="post" class="flex w-full flex-col items-end gap-2">

		<TextArea
			{superform}
			field="comment"
			label="Comment"
			disabled={!data.permissions.create}
			class="w-full"
		/>
		<button type="submit" class="btn">Submit</button>
	</form> -->
	<CommentsList {query} />
	<span class="py-6">
		Powered by <a href="https://gebna.tools/" class="link-hover font-bold">gebna.tools</a>
	</span>
</div>

<style>
	:root {
		background: transparent !important;
	}
</style>
