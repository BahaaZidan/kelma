<script lang="ts">
	import CornerDownLeftIcon from '@lucide/svelte/icons/corner-down-left';
	import CornerDownRightIcon from '@lucide/svelte/icons/corner-down-right';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { onMount } from 'svelte';

	import { graphql } from '$houdini';

	import { signOut } from '$lib/client/auth';
	import Spinner from '$lib/client/components/Spinner.svelte';
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { getDir } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages.js';
	import { route } from '$lib/routes';

	import type { PageProps } from './$houdini';
	import Comment from './components/Comment.svelte';
	import CreateCommentForm from './components/CreateCommentForm.svelte';

	let { data }: PageProps = $props();

	const TogglePageClosed = graphql(`
		mutation TogglePageClosed($id: ID!) {
			togglePageClosed(id: $id) {
				id
				closed
			}
		}
	`);
	let viewer = getViewerContext();
	let query = data.BigWebsiteQuery;
	let website = $derived($query.data?.node?.__typename === 'Website' ? $query.data?.node : null);
	let fetchingMore = $state(false);

	function sendHeight() {
		const height = document.body.scrollHeight;
		window.parent.postMessage(
			{
				type: 'resize',
				height: height,
			},
			// TODO: send only the origin of the customer
			'*'
		);
	}
	onMount(() => {
		window.addEventListener('load', sendHeight);
		const observer = new MutationObserver(sendHeight);
		observer.observe(document.body, { childList: true, subtree: true, attributes: true });
	});
</script>

{#if website?.page}
	<div data-theme={data.theme} class="flex flex-col items-center gap-2 bg-transparent">
		<div class="flex w-full items-center justify-between">
			{#if viewer}
				<div class="flex items-center gap-1">
					<div>
						{m.logged_in_as()}
						<b>{viewer.name}</b>
					</div>
					{#if website.owner.id === viewer.id}
						<details class="dropdown">
							<summary class="btn btn-sm btn-warning m-1"><SettingsIcon size={18} /></summary>
							<ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
								<div class="mb-2 pl-2 font-bold">{m.page_settings()}</div>
								<li class={{ 'menu-disabled': $TogglePageClosed.fetching }}>
									<label class="label">
										<input
											type="checkbox"
											checked={website.page.closed}
											class="toggle"
											disabled={$TogglePageClosed.fetching}
											onchange={() => {
												if (website.page) TogglePageClosed.mutate({ id: website.page.id });
											}}
										/>
										{m.closed()}
										<Spinner enabled={$TogglePageClosed.fetching} />
									</label>
								</li>
							</ul>
						</details>
					{/if}
				</div>
				<button class="btn btn-ghost" onclick={signOut}>{m.logout()}</button>
			{:else}
				<span>
					{m.you_must()}
					<a
						class="link font-bold"
						target="_top"
						href="{route('/login')}?callback_url={website.page.url}"
					>
						{m.login()}
					</a>
					{m.to_comment()}
				</span>
			{/if}
		</div>
		<CreateCommentForm page={website.page} />
		<div class="flex w-full flex-col gap-4 px-2">
			{#each website.page.comments.edges as { node } (node.id)}
				<Comment data={node} {website} page={website.page} />
			{/each}

			{#if $query.pageInfo.hasNextPage}
				<div>
					<button
						class="btn btn-link"
						onclick={async () => {
							fetchingMore = true;
							await query.loadNextPage();
							fetchingMore = false;
						}}
						disabled={fetchingMore}
					>
						{#if fetchingMore}
							<span class="loading loading-spinner loading-sm"></span>
						{:else if getDir() === 'ltr'}
							<CornerDownRightIcon />
						{:else}
							<CornerDownLeftIcon />
						{/if}
						{m.moreComments()}
					</button>
				</div>
			{/if}
		</div>
		<span class="py-6 font-mono">
			{m.powered_by()}
			<a href="https://kelma.dev/" class="link-hover font-mono font-bold">kelma</a>
		</span>
	</div>
{/if}

<style>
	:root {
		background: transparent !important;
	}
</style>
