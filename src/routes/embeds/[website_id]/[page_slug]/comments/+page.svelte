<script lang="ts">
	import CornerDownLeftIcon from '@lucide/svelte/icons/corner-down-left';
	import CornerDownRightIcon from '@lucide/svelte/icons/corner-down-right';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { onMount } from 'svelte';

	import { graphql } from '$houdini';

	import { fetchWithAuth, SessionToken, signOut } from '$lib/client/auth';
	import { getDir } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import { route } from '$lib/routes';

	import type { PageProps } from './$houdini';
	import Comment from './components/Comment.svelte';
	import CreateCommentForm from './components/CreateCommentForm.svelte';

	let { data }: PageProps = $props();

	let query = graphql(`
		query BigWebsiteQuery($websiteId: ID!, $pageInput: PageInput!) {
			node(id: $websiteId) {
				... on Website {
					...WebsiteOwner
					id
					name
					owner {
						id
					}
					page(input: $pageInput) {
						...IsPageClosed
						id
						closed
						url
						comments(first: 10) @paginate(name: "Embed_Comments") {
							edges {
								node {
									id
									...CommentComponent
								}
							}
						}
					}
				}
			}
		}
	`);
	let viewerQuery = graphql(`
		query EmbedViewerQuery {
			viewer {
				id
				name
				image
			}
		}
	`);

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
	onMount(async () => {
		try {
			if (data.token) {
				console.log(data.token);
				SessionToken.value = data.token;
			}
			await Promise.all([
				query.fetch({ variables: data.queryVariables, fetch: fetchWithAuth }),
				viewerQuery.fetch({ fetch: fetchWithAuth }),
			]);

			sendHeight();
			window.addEventListener('load', sendHeight);
			const observer = new MutationObserver(sendHeight);
			observer.observe(document.body, { childList: true, subtree: true, attributes: true });
		} catch (e) {
			console.error({ e });
		}
	});

	const TogglePageClosed = graphql(`
		mutation TogglePageClosed($id: ID!) {
			togglePageClosed(id: $id) {
				id
				closed
			}
		}
	`);

	let website = $derived($query.data?.node?.__typename === 'Website' ? $query.data?.node : null);
	let viewer = $derived($viewerQuery.data?.viewer);
	let fetchingMore = $state(false);
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

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
												if (website.page)
													TogglePageClosed.mutate(
														{ id: website.page.id },
														{ fetch: fetchWithAuth }
													);
											}}
										/>
										{m.closed()}
										{#if $TogglePageClosed.fetching}
											<span class="loading loading-spinner loading-sm"></span>
										{/if}
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
						href="/{getLocale()}{route('/login')}?callback_url={website.page.url}"
					>
						{m.login()}
					</a>
					{m.to_comment()}
				</span>
			{/if}
		</div>

		<div class="flex w-full flex-col gap-4 px-2">
			<CreateCommentForm page={website.page} />
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
		<span class="py-3 font-mono">
			{m.powered_by()}
			<a href="https://kelma.dev/" target="_blank" class="link-hover font-mono font-bold">
				{m.kelma()}
			</a>
		</span>
	</div>
{:else if $query.fetching}
	<div class="flex h-56 items-center justify-center">
		<span class="loading loading-spinner loading-xl"></span>
	</div>
{/if}

<style>
	:root {
		background: transparent !important;
	}
</style>
