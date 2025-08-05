<script lang="ts">
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { siGoogle } from 'simple-icons';

	import { env } from '$env/dynamic/public';

	import { authClient, signOut } from '$lib/client/auth';
	import Avatar from '$lib/client/components/Avatar.svelte';
	import BrandIcon from '$lib/client/components/BrandIcon.svelte';
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { m } from '$lib/paraglide/messages';
	import { route } from '$lib/routes';

	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	let viewer = getViewerContext();

	const callbackURL = env.PUBLIC_BASE_URL + route('/console');
</script>

<header class="bg-base-100 w-full shadow-sm">
	<div class="navbar mx-auto w-full max-w-4xl p-0">
		<div class="navbar-start">
			<a class="btn btn-ghost font-mono text-xl" href="/">Kelma</a>
		</div>
		<div class="navbar-center hidden lg:flex"></div>
		<div class="navbar-end">
			{#if viewer}
				<button class="btn btn-link" popovertarget="popover-1" style="anchor-name:--anchor-1">
					<Avatar
						alt="{viewer.name} Avatar"
						src={viewer.image}
						fallback={viewer.name}
						class="size-9 min-h-9 min-w-9"
					/>
				</button>
				<ul
					class="dropdown menu rounded-box bg-secondary-content w-52 shadow-sm"
					popover
					id="popover-1"
					style="position-anchor:--anchor-1"
				>
					<li>
						<a href={route('/console')}><LayoutDashboardIcon /> Console</a>
					</li>
					<li><button onclick={() => signOut()}><LogOutIcon /> Logout</button></li>
				</ul>
			{:else}
				<button class="btn btn-secondary" popovertarget="popover-1" style="anchor-name:--anchor-1">
					Login
				</button>
				<ul
					class="dropdown menu rounded-box bg-secondary-content w-52 shadow-sm"
					popover
					id="popover-1"
					style="position-anchor:--anchor-1"
				>
					<li>
						<button
							onclick={async () => {
								await authClient.signIn.social({ provider: 'google', callbackURL });
							}}
						>
							<BrandIcon icon={siGoogle} />
							{m.google()}
						</button>
					</li>
				</ul>
			{/if}
		</div>
	</div>
</header>

<main class="w-full">
	<div class="mx-auto w-full max-w-4xl">
		{@render children()}
	</div>
</main>
