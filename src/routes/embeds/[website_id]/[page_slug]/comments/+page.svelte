<script lang="ts">
	import { siGithub } from 'simple-icons';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';

	import { authClient } from '$lib/client/auth';
	import BrandIcon from '$lib/components/BrandIcon.svelte';
	import Comment from '$lib/components/Comment.svelte';
	import TextArea from '$lib/components/TextArea.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const superform = superForm(data.form);

	const session = authClient.useSession();
	async function githubSignIn() {
		await authClient.signIn.social({ provider: 'github', callbackURL: data.url });
	}
	async function signOut() {
		await authClient.signOut();
	}

	onMount(() => {
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

		window.addEventListener('load', sendHeight);

		const observer = new MutationObserver(sendHeight);
		observer.observe(document.body, { childList: true, subtree: true, attributes: true });
	});
</script>

<div class="flex flex-col items-center gap-2 p-4">
	<div class="flex w-full items-center justify-between">
		{#if $session.data}
			<div>
				Logged in as <b>{$session.data.user.name}</b>
			</div>
			<button class="btn btn-ghost" onclick={signOut}>Logout</button>
		{:else}
			<div>You must login to comment</div>
			<button onclick={githubSignIn} class="btn">Login <BrandIcon icon={siGithub} /></button>
		{/if}
	</div>
	<form method="post" use:superform.enhance class="flex w-full flex-col items-end gap-2">
		<TextArea
			{superform}
			field="comment"
			label="Comment"
			disabled={!$session.data}
			class="w-full"
		/>
		<button type="submit" class="btn">Submit</button>
	</form>
	<div class="flex w-full flex-col gap-4">
		{#each data.comments as comment (comment.id)}
			<Comment author={comment.author} content={comment.content} createdAt={comment.createdAt} />
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
