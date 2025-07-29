<script lang="ts">
	import {
		// siGithub,
		siGoogle,
	} from 'simple-icons';

	import {
		authClient,
		//  githubSignIn,
		googleSignIn,
		signOut,
	} from '$lib/client/auth';
	import BrandIcon from '$lib/client/components/BrandIcon.svelte';
	import { m } from '$lib/paraglide/messages';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const session = authClient.useSession();

	$effect(() => {
		if ($session.data) window.close();
	});
</script>

<svelte:head>
	<title>Kelma | Login</title>
</svelte:head>

<div class="flex h-screen w-screen items-center justify-center">
	<div class="flex w-full max-w-md flex-col items-center gap-2 p-4 font-mono">
		{#if $session.data}
			<div>
				{m.logged_in_as()}
				<b>{$session.data.user.name}</b>
			</div>
			<button class="btn btn-ghost" onclick={signOut}>{m.logout()}</button>
		{:else}
			<h1>{m.login_via()}</h1>
			<button onclick={() => googleSignIn(data.callbackURL)} class="btn btn-block">
				<BrandIcon icon={siGoogle} />
				{m.google()}
			</button>
			<!-- <button onclick={() => githubSignIn(data.callbackURL)} class="btn btn-block">
				<BrandIcon icon={siGithub} />
				{m.github()}
			</button> -->
		{/if}

		<span class="py-6">
			{m.powered_by()}
			<a href="https://kelma.dev/" class="link-hover font-mono font-bold">{m.kelma()}</a>
		</span>
	</div>
</div>
