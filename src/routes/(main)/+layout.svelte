<script lang="ts">
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	import { env } from '$env/dynamic/public';

	import { signOut } from '$lib/client/auth';
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { route } from '$lib/routes';

	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	let viewer = getViewerContext();
</script>

<header class="bg-base-100 w-full shadow-sm">
	<div class="navbar mx-auto w-full max-w-4xl p-0">
		<div class="navbar-start">
			<a class="btn btn-ghost font-mono text-xl" href="/">kelma</a>
		</div>
		<div class="navbar-center hidden lg:flex"></div>
		<div class="navbar-end">
			{#if viewer}
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
						<div class="w-10 rounded-full">
							<img alt="{viewer.name} Avatar" src={viewer.image} />
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
				<a
					class="btn btn-link"
					href="{route('/login')}?callback_url={env.PUBLIC_BASE_URL + route('/console')}"
				>
					Login
				</a>
			{/if}
		</div>
	</div>
</header>

<main class="w-full">
	<div class="mx-auto w-full max-w-4xl">
		{@render children()}
	</div>
</main>
