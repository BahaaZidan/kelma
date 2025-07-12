<script lang="ts">
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { onMount } from 'svelte';

	import { graphql } from '$houdini';

	import { signOut } from '$lib/client/auth';
	import { m } from '$lib/paraglide/messages.js';
	import { route } from '$lib/routes';

	import type { PageProps } from './$types';
	import Comment from './components/Comment.svelte';
	import CreateCommentForm from './components/CreateCommentForm.svelte';

	let { data }: PageProps = $props();

	let query = graphql(`
		query BigWebsiteQuery($websiteId: ID!, $pageInput: PageInput!) {
			viewer {
				...CommentComponentViewer
				id
				name
			}
			node(id: $websiteId) {
				... on Website {
					...CommentComponentWebsite
					id
					name
					owner {
						id
					}
					preModeration
					page(input: $pageInput) {
						id
						preModeration
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
	onMount(async () => {
		await query.fetch({
			variables: data.queryVariables,
		});
	});

	const TogglePageClosed = graphql(`
		mutation TogglePageClosed($id: ID!) {
			togglePageClosed(id: $id) {
				id
				closed
			}
		}
	`);
	const TogglePagePreModeration = graphql(`
		mutation TogglePagePreModeration($id: ID!) {
			togglePagePreModeration(id: $id) {
				id
				preModeration
			}
		}
	`);
	let viewer = $derived($query.data?.viewer);
	let website = $derived($query.data?.node?.__typename === 'Website' ? $query.data?.node : null);

	function sendHeight() {
		const height = document.body.scrollHeight;
		window.parent.postMessage(
			{
				type: 'resize',
				height: height,
			},
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
	<div data-theme={data.theme} class="flex flex-col items-center gap-2">
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
								<li>
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
									</label>
								</li>
								<li>
									<label class="label">
										<input
											type="checkbox"
											checked={website.page.preModeration}
											class="toggle"
											disabled={$TogglePagePreModeration.fetching}
											onchange={() => {
												if (website.page) TogglePagePreModeration.mutate({ id: website.page.id });
											}}
										/>
										{m.pre_moderation()}
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
						href="{route('/embeds/login')}?callback_url={website.page.url}"
					>
						{m.login()}
					</a>
					{m.to_comment()}
				</span>
			{/if}
		</div>
		<CreateCommentForm pageId={website.page.id} disabled={!viewer || website.page.closed} />
		<div class="flex w-full flex-col gap-4 px-2">
			{#each website.page.comments.edges as { node } (node.id)}
				<Comment data={node} {viewer} {website} />
			{/each}

			<button
				class={['btn', { hidden: !$query.fetching && !$query.pageInfo.hasNextPage }]}
				onclick={() => query.loadNextPage()}
				disabled={!$query.pageInfo.hasNextPage || $query.fetching}
			>
				{#if $query.fetching}
					{m.loading_more()}
				{:else if $query.pageInfo.hasNextPage}
					{m.load_more()}
				{/if}
			</button>
		</div>
		<span class="py-6">
			{m.powered_by()}
			<a href="https://gebna.tools/" class="link-hover font-bold">gebna.tools</a>
		</span>
	</div>
{/if}

<style>
	:root {
		background: transparent !important;
	}
</style>
