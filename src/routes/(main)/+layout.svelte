<script lang="ts">
	import { siGithub } from 'simple-icons';

	import { authClient, signOut } from '$lib/client/auth';
	import BrandIcon from '$lib/components/BrandIcon.svelte';

	let { children, data } = $props();

	async function githubSignIn() {
		await authClient.signIn.social({ provider: 'github' });
	}
</script>

<div class="navbar bg-base-100 shadow-sm">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</div>
		</div>
		<a class="btn btn-ghost text-xl" href="/">gebna.tools</a>
	</div>
	<div class="navbar-center hidden lg:flex"></div>
	<div class="navbar-end">
		{#if data.session}
			<button onclick={signOut} class="btn">Signout</button>
		{:else}
			<button onclick={githubSignIn} class="btn">Login <BrandIcon icon={siGithub} /></button>
		{/if}
	</div>
</div>

{@render children()}
