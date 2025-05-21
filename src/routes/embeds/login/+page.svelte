<script lang="ts">
	import { siGithub } from 'simple-icons';

	import { authClient } from '$lib/client/auth';
	import BrandIcon from '$lib/components/BrandIcon.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const session = authClient.useSession();
	async function githubSignIn() {
		await authClient.signIn.social({ provider: 'github', callbackURL: data.callbackURL });
	}
	async function signOut() {
		await authClient.signOut();
	}

	$effect(() => {
		if ($session.data) window.close();
	});
</script>

<div class="flex flex-col items-center gap-2 p-4">
	{#if $session.data}
		<div>
			Logged in as <b>{$session.data.user.name}</b>
		</div>
		<button class="btn btn-ghost" onclick={signOut}>Logout</button>
	{:else}
		<button onclick={githubSignIn} class="btn btn-block">
			Login <BrandIcon icon={siGithub} />
		</button>
	{/if}

	<span class="py-6">
		Powered by <a href="https://gebna.tools/" class="link-hover font-bold">gebna.tools</a>
	</span>
</div>
