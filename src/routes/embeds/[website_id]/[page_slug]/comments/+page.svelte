<script lang="ts">
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';

	import { route } from '$lib/__generated__/routes';
	import { signOut } from '$lib/client/auth';
	import Comment from '$lib/components/Comment.svelte';
	import TextArea from '$lib/components/TextArea.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const superform = superForm(data.form);

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
	<form method="post" use:superform.enhance class="flex w-full flex-col items-end gap-2">
		<TextArea {superform} field="comment" label="Comment" disabled={!data.session} class="w-full" />
		<button type="submit" class="btn">Submit</button>
	</form>
	<div class="flex w-full flex-col gap-4">
		{#each data.comments as comment (comment.id)}
			<Comment
				id={comment.id}
				author={comment.author}
				content={comment.content}
				createdAt={comment.createdAt}
				permissions={comment.permissions}
				redirect_url="{route('/embeds/[website_id]/[page_slug]/comments', {
					website_id: data.websiteId,
					page_slug: data.pageSlug,
				})}?url={data.searchParams.url}&name={data.searchParams.name}"
			/>
		{/each}
	</div>
	<span class="py-6">
		Powered by <a href="https://gebna.tools/" class="link-hover font-bold">gebna.tools</a>
	</span>
</div>

<style>
	:root {
		background: transparent !important;
	}
</style>
