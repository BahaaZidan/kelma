<script lang="ts">
	import CornerDownRightIcon from '@lucide/svelte/icons/corner-down-right';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { siGithub, siGoogle } from 'simple-icons';
	import { onMount } from 'svelte';

	import { graphql } from '$houdini';

	import { githubSignIn, googleSignIn, signOut } from '$lib/client/auth';
	import BrandIcon from '$lib/client/components/BrandIcon.svelte';
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { m } from '$lib/paraglide/messages.js';

	import type { PageProps } from './$types';
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
	let viewer = getViewerContext();
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
							</ul>
						</details>
					{/if}
				</div>
				<button class="btn btn-ghost" onclick={signOut}>{m.logout()}</button>
			{:else}
				<span>
					{m.you_must()}
					<details class="dropdown">
						<summary class="link mb-1 font-bold">{m.login()}</summary>
						<ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
							<li>
								<button onclick={() => googleSignIn(website.page?.url)}>
									<BrandIcon icon={siGoogle} /> Google
								</button>
							</li>
							<li>
								<button onclick={() => githubSignIn(website.page?.url)}>
									<BrandIcon icon={siGithub} /> GitHub
								</button>
							</li>
						</ul>
					</details>
					{m.to_comment()}
				</span>
			{/if}
		</div>
		<CreateCommentForm pageId={website.page.id} disabled={!viewer || website.page.closed} />
		<div class="flex w-full flex-col gap-4 px-2">
			{#each website.page.comments.edges as { node } (node.id)}
				<Comment data={node} {website} page={website.page} />
			{/each}

			<div
				class={[
					{
						hidden: !$query.fetching && !$query.pageInfo.hasNextPage,
					},
				]}
			>
				<button
					class="btn btn-link"
					onclick={() => query.loadNextPage()}
					disabled={!$query.pageInfo.hasNextPage || $query.fetching}
				>
					{#if $query.fetching}
						{m.loading_more()}
					{:else if $query.pageInfo.hasNextPage}
						<CornerDownRightIcon /> More comments
					{/if}
				</button>
			</div>
		</div>
		<span class="py-6 font-mono">
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
