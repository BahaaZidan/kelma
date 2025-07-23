<script lang="ts">
	import { siGithub, siGoogle } from 'simple-icons';

	import { authClient, githubSignIn, googleSignIn, signOut } from '$lib/client/auth';
	import BrandIcon from '$lib/client/components/BrandIcon.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const session = authClient.useSession();

	$effect(() => {
		if ($session.data) window.close();
	});
</script>

<div class="flex h-screen w-screen items-center justify-center">
	<div class="flex w-full max-w-md flex-col items-center gap-2 p-4 font-mono">
		{#if $session.data}
			<div>
				Logged in as <b>{$session.data.user.name}</b>
			</div>
			<button class="btn btn-ghost" onclick={signOut}>Logout</button>
		{:else}
			<h1>Login via</h1>
			<button onclick={() => googleSignIn(data.callbackURL)} class="btn btn-block">
				Google <BrandIcon icon={siGoogle} />
			</button>
			<button onclick={() => githubSignIn(data.callbackURL)} class="btn btn-block">
				GitHub <BrandIcon icon={siGithub} />
			</button>
		{/if}

		<span class="py-6">
			Powered by <a href="https://kelma.dev/" class="link-hover font-mono font-bold">kelma</a>
		</span>
	</div>
</div>
