<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import SquareCheckBigIcon from '@lucide/svelte/icons/square-check-big';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import ThumbsDownIcon from '@lucide/svelte/icons/thumbs-down';
	import ThumbsUpIcon from '@lucide/svelte/icons/thumbs-up';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { formatDistance } from 'date-fns';
	import { ar, enUS } from 'date-fns/locale';

	import { fragment, graphql, type CommentComponent } from '$houdini';

	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';

	type Props = {
		data: CommentComponent;
	};

	let { data }: Props = $props();

	let comment = $derived(
		fragment(
			data,
			graphql(`
				fragment CommentComponent on Comment {
					id
					content
					createdAt
					published
					author {
						id
						name
						image
					}
					permissions {
						delete
						edit
						approve
					}
					repliesCount
				}
			`)
		)
	);
	let { id, content, createdAt, author, permissions, published, repliesCount } = $derived($comment);

	let editing = $state(false);
	let contentVal = $derived(content);

	const DeleteComment = graphql(`
		mutation DeleteComment($input: DeleteCommentInput!) {
			deleteComment(input: $input) {
				id @Comment_delete
			}
		}
	`);
	const UpdateCommentContent = graphql(`
		mutation UpdateCommentContent($input: UpdateCommentContentInput!) {
			updateCommentContent(input: $input) {
				id
				content
				createdAt
				updatedAt
			}
		}
	`);
	const PublishComment = graphql(`
		mutation PublishComment($input: PublishCommentInput!) {
			publishComment(input: $input) {
				id
				content
				createdAt
				updatedAt
				published
			}
		}
	`);

	const localeMap = {
		en: enUS,
		ar,
	} as const;

	const repliesQuery = graphql(`
		query CommentRepliesQuery($id: ID!) {
			node(id: $id) {
				... on Comment {
					id
					replies(first: 10) @paginate(name: "Comment_Replies") {
						edges {
							node {
								id
								content
								createdAt
								author {
									id
									image
									name
								}
							}
						}
					}
				}
			}
		}
	`);
	let replies = $derived(
		$repliesQuery.data?.node?.__typename === 'Comment'
			? $repliesQuery.data?.node.replies.edges.map(({ node }) => node)
			: []
	);

	let reply_open = $state(false);
</script>

<div class="flex items-start gap-4">
	<img
		src={author.image || 'https://avatars.githubusercontent.com/u/22656046?v=4'}
		alt="{author.name} {m.profile_picture()}"
		class="mt-1 size-10 rounded-full"
	/>
	{#if !editing}
		<div class="flex grow flex-col">
			<span>
				<span class="font-semibold">{author.name}</span>
				<span class="text-secondary text-sm">
					{formatDistance(createdAt, new Date(), {
						addSuffix: true,
						locale: localeMap[getLocale()],
					})}
				</span>
				{#if !published}
					<div class="badge badge-info badge-sm rounded-2xl">{m.awaiting_approval()}</div>
				{/if}
			</span>
			<span class="whitespace-pre-wrap">{content}</span>
			<div class="flex gap-2">
				<button class="btn btn-xs btn-ghost"><ThumbsUpIcon size={16} /></button>
				<button class="btn btn-xs btn-ghost"><ThumbsDownIcon size={16} /></button>
				<button class="btn btn-xs btn-ghost">Reply</button>
			</div>
			{#if repliesCount}
				<details
					bind:open={reply_open}
					ontoggle={(e) => {
						if (!e.currentTarget.open) return;
						repliesQuery.fetch({ variables: { id } });
					}}
				>
					<summary class="btn btn-ghost btn-xs w-24 p-1">
						{#if $repliesQuery.fetching}
							<span class="loading loading-spinner loading-xs"></span>
						{:else if reply_open}
							<ChevronUpIcon />
						{:else}
							<ChevronDownIcon />
						{/if}
						{repliesCount} Replies
					</summary>
					<div class="flex flex-col gap-2">
						{#each replies as reply (reply.id)}
							<div class="flex items-start gap-4">
								<img
									src={reply.author.image || 'https://avatars.githubusercontent.com/u/22656046?v=4'}
									alt="{reply.author.name} {m.profile_picture()}"
									class="mt-1 size-6 rounded-full"
								/>
								<div class="flex grow flex-col">
									<span>
										<span class="font-semibold">{reply.author.name}</span>
										<span class="text-secondary text-sm">
											{formatDistance(reply.createdAt, new Date(), {
												addSuffix: true,
												locale: localeMap[getLocale()],
											})}
										</span>
									</span>
									<span class="whitespace-pre-wrap">{reply.content}</span>
								</div>
							</div>
						{/each}
					</div>
				</details>
			{/if}
		</div>
		{#if Object.values(permissions).includes(true)}
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-circle btn-ghost">
					<EllipsisVerticalIcon size={18} />
				</div>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
				>
					{#if permissions.approve}
						<li>
							<button onclick={() => PublishComment.mutate({ input: { commentId: id } })}>
								<SquareCheckBigIcon />
								{m.approve()}
							</button>
						</li>
					{/if}
					{#if permissions.delete}
						<li>
							<button
								onclick={() => {
									let confirmed = confirm('Are you sure you want to delete this comment ?');
									if (confirmed) DeleteComment.mutate({ input: { commentId: id } });
								}}
							>
								<Trash2Icon />
								{m.delete()}
							</button>
						</li>
					{/if}
					{#if permissions.edit}
						<li>
							<button
								onclick={() => {
									editing = true;
								}}
							>
								<SquarePenIcon />
								{m.edit()}
							</button>
						</li>
					{/if}
				</ul>
			</div>
		{/if}
	{:else}
		<div class="flex grow flex-col gap-3">
			<textarea class="textarea w-full" name="content" bind:value={contentVal}></textarea>
			<div class="flex justify-end gap-2">
				<button class="btn" onclick={() => (editing = false)}>{m.cancel()}</button>
				<button
					class="btn"
					onclick={async () => {
						await UpdateCommentContent.mutate({ input: { commentId: id, content: contentVal } });
						editing = false;
					}}
				>
					{m.submit()}
				</button>
			</div>
		</div>
	{/if}
</div>
