<script lang="ts">
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { siGithub } from 'simple-icons';

	import { authClient, signOut } from '$lib/client/auth';
	import BrandIcon from '$lib/client/components/BrandIcon.svelte';
	import { route } from '$lib/routes';

	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	let user = $derived(data.session?.user);

	async function githubSignIn() {
		await authClient.signIn.social({ provider: 'github' });
	}
</script>

<header class="bg-base-100 w-full shadow-sm">
	<div class="navbar mx-auto w-full max-w-4xl p-0">
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
			{#if user}
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
						<div class="w-10 rounded-full">
							<img alt="{user.name} Avatar" src={user.image} />
						</div>
					</div>
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<ul
						tabindex="0"
						class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
					>
						<li><a href={route('/console')}><LayoutDashboardIcon /> Console</a></li>
						<li><button onclick={signOut}><LogOutIcon /> Logout</button></li>
					</ul>
				</div>
			{:else}
				<button onclick={githubSignIn} class="btn">Login <BrandIcon icon={siGithub} /></button>
			{/if}
		</div>
	</div>
</header>

<main class="w-full">
	<div class="mx-auto w-full max-w-4xl">
		{@render children()}
	</div>
</main>
