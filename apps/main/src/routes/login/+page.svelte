<script lang="ts">
	import { siGoogle } from 'simple-icons';

	import { authClient } from '$lib/client/auth';
	import BrandIcon from '$lib/client/components/BrandIcon.svelte';
	import { m } from '$lib/paraglide/messages';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Kelma | Login</title>
</svelte:head>

<div class="flex h-screen w-screen items-center justify-center">
	<div class="flex w-full max-w-md flex-col items-center gap-2 p-4 font-mono">
		<h1>{m.login_via()}</h1>
		<button
			onclick={async () => {
				await authClient.signIn.social({ provider: 'google', callbackURL: data.callbackURL });
			}}
			class="btn btn-block"
		>
			<BrandIcon icon={siGoogle} />
			{m.google()}
		</button>

		<span class="py-6">
			{m.powered_by()}
			<a href="https://kelma.dev/" class="link-hover font-mono font-bold">{m.kelma()}</a>
		</span>
	</div>
</div>
