<script lang="ts">
	import {
		BitcoinIcon,
		ChartColumnIncreasingIcon,
		ChevronsUpDownIcon,
		CodeIcon,
		FileTextIcon,
		HouseIcon,
		MailIcon,
		MessageSquareIcon,
		SettingsIcon,
		UsersIcon,
		XIcon,
	} from '@lucide/svelte';

	import { navigating, page } from '$app/state';

	import { route } from '$lib/__generated__/routes';
	import WebsiteSelector from '$lib/components/WebsiteSelector.svelte';

	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	let dialog: HTMLDialogElement;

	let currentWebsite = $derived(
		page.params.website_id
			? data.websites.find((w) => w.id === Number(page.params.website_id))
			: data.websites[0]
	);

	$effect(() => {
		if (navigating.to) dialog.close();
	});

	function isActive(route: string) {
		return page.route.id === `/(main)/console${route}`;
	}

	const menuIconSize = 18;
</script>

<div class="flex gap-4 p-6">
	<div class="flex flex-col gap-4">
		<ul class="menu bg-base-200 rounded-box w-56">
			<li>
				<a href={route('/console')} class={{ 'menu-active': isActive('') }}>
					<HouseIcon size={menuIconSize} /> Home
				</a>
			</li>
			<li>
				<a href={route('/console/billing')} class={{ 'menu-active': isActive('/billing') }}>
					<BitcoinIcon size={menuIconSize} /> Billing
				</a>
			</li>
		</ul>
		{#if currentWebsite}
			<ul class="menu bg-base-200 rounded-box w-56">
				<li>
					<button onclick={() => dialog.showModal()} class="flex justify-between">
						<div class="flex flex-col">
							<span class="font-bold">{currentWebsite.name}</span>
							<div class="text-secondary">
								ID: <div class="badge badge-secondary badge-xs rounded-xl">
									{currentWebsite.id}
								</div>
							</div>
						</div>
						<ChevronsUpDownIcon size={16} />
					</button>
				</li>
				<li>
					<a
						class={{ 'menu-active': isActive('/[website_id]') }}
						href={route('/console/[website_id]', { website_id: currentWebsite.id })}
					>
						<ChartColumnIncreasingIcon size={menuIconSize} /> Overview
					</a>
				</li>
				<li>
					<a
						class={{ 'menu-active': isActive('/[website_id]/comments') }}
						href={route('/console/[website_id]/comments', { website_id: currentWebsite.id })}
					>
						<MessageSquareIcon size={menuIconSize} /> Comments
					</a>
				</li>
				<li>
					<a
						class={{ 'menu-active': isActive('/[website_id]/pages') }}
						href={route('/console/[website_id]/pages', { website_id: currentWebsite.id })}
					>
						<FileTextIcon size={menuIconSize} /> Pages
					</a>
				</li>
				<li>
					<a
						class={{ 'menu-active': isActive('/[website_id]/users') }}
						href={route('/console/[website_id]/users', { website_id: currentWebsite.id })}
					>
						<UsersIcon size={menuIconSize} /> Users
					</a>
				</li>
				<li>
					<a
						class={{ 'menu-active': isActive('/[website_id]/newsletter') }}
						href={route('/console/[website_id]/newsletter', { website_id: currentWebsite.id })}
					>
						<MailIcon size={menuIconSize} /> Newsletter
					</a>
				</li>
				<div class="divider"></div>
				<li>
					<a
						class={{ 'menu-active': isActive('/[website_id]/settings') }}
						href={route('/console/[website_id]/settings', { website_id: currentWebsite.id })}
					>
						<SettingsIcon size={menuIconSize} /> Settings
					</a>
				</li>
				<div class="divider"></div>
				<li>
					<a
						class={{ 'menu-active': isActive('/[website_id]/install') }}
						href={route('/console/[website_id]/install', { website_id: currentWebsite.id })}
					>
						<CodeIcon size={menuIconSize} /> Install
					</a>
				</li>
			</ul>
		{/if}
	</div>
	<div class="grow">
		{@render children()}
	</div>
</div>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<div class="flex flex-col gap-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-bold">Choose a Website</h3>
				<form method="dialog">
					<button class="btn btn-circle btn-ghost"><XIcon /></button>
				</form>
			</div>

			<WebsiteSelector websites={data.websites} />
		</div>
	</div>
</dialog>
