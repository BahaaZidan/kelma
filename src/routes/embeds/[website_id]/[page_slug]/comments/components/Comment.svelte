<script lang="ts">
	import BanIcon from '@lucide/svelte/icons/ban';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import CornerDownLeftIcon from '@lucide/svelte/icons/corner-down-left';
	import CornerDownRightIcon from '@lucide/svelte/icons/corner-down-right';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { formatDistance } from 'date-fns';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import {
		fragment,
		graphql,
		type CommentComponent,
		type IsPageClosed,
		type WebsiteOwner,
	} from '$houdini';

	import Avatar from '$lib/client/components/Avatar.svelte';
	import Textarea from '$lib/client/components/Textarea.svelte';
	import { dateLocaleMap } from '$lib/client/i18n';
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { getDir } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import { contentSchema } from '$lib/validation-schemas';

	import CreateReplyForm from './CreateReplyForm.svelte';
	import { is_page_closed, website_owner } from './fragments';
	import Reply from './Reply.svelte';

	type Props = {
		data: CommentComponent;
		website: WebsiteOwner;
		page: IsPageClosed;
	};

	let { data, website, page }: Props = $props();

	let comment = $derived(
		fragment(
			data,
			graphql(`
				fragment CommentComponent on Comment {
					id
					content
					createdAt
					author {
						id
						name
						image
					}
					repliesCount
					likedByViewer
				}
			`)
		)
	);

	let page_ = $derived(fragment(page, is_page_closed));
	let website_ = $derived(fragment(website, website_owner));
	let viewer = getViewerContext();
	let permissions = $derived({
		delete: $comment.author.id === viewer?.id || viewer?.id === $website_.owner.id,
		edit: $comment.author.id === viewer?.id,
		ban_user: viewer?.id === $website_.owner.id && $comment.author.id !== viewer.id,
	});

	let editing = $state(false);

	const DeleteComment = graphql(`
		mutation DeleteComment($id: ID!) {
			deleteComment(id: $id) {
				id @Comment_delete
			}
		}
	`);
	const UpdateCommentContent = graphql(`
		mutation UpdateCommentContent($input: UpdateCommentContentInput!) {
			updateCommentContent(input: $input) {
				id
				content
				updatedAt
			}
		}
	`);

	const repliesQuery = graphql(`
		query CommentRepliesQuery($id: ID!) {
			node(id: $id) {
				... on Comment {
					id
					replies(first: 10) @paginate(name: "Comment_Replies") {
						edges {
							node {
								...ReplyComponent
								id
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

	let replies_list_shown = $state(false);
	let create_reply_form_shown = $state(false);
	let fetchingMoreReplies = $state(false);

	const superform = superForm(defaults({ content: $comment.content }, valibot(contentSchema)), {
		SPA: true,
		validators: valibot(contentSchema),
		id: `edit_comment_superform_${$comment.id}`,
		async onUpdate({ form }) {
			if (form.valid) {
				await UpdateCommentContent.mutate({
					input: { commentId: $comment.id, content: form.data.content },
				});
				editing = false;
			}
		},
		resetForm: false,
	});

	const UpdateUserWebsiteBan = graphql(`
		mutation UpdateUserWebsiteBan($input: UpdateUserWebsiteBanInput!) {
			updateUserWebsiteBan(input: $input) {
				id
			}
		}
	`);

	const ToggleCommentLike = graphql(`
		mutation ToggleCommentLike($commentId: ID!) {
			toggleLike(input: { commentId: $commentId }) {
				... on Comment {
					id
					likedByViewer
					__typename
				}
			}
		}
	`);
</script>

<div class="flex items-start gap-4">
	<Avatar
		src={$comment.author.image}
		alt="{$comment.author.name} {m.profile_picture()}"
		class="mt-1 size-10"
		fallback={$comment.author.name}
	/>
	{#if !editing}
		<div class="flex grow flex-col">
			<span>
				<span class="font-semibold">{$comment.author.name}</span>
				<span class="text-secondary text-sm">
					{formatDistance($comment.createdAt, new Date(), {
						addSuffix: true,
						locale: dateLocaleMap[getLocale()],
					})}
				</span>
			</span>
			<span class="whitespace-pre-wrap">{$comment.content}</span>
			{#if viewer && !$page_.closed}
				<div class="flex gap-2">
					<button
						class="btn btn-xs btn-ghost"
						onclick={async () => {
							await ToggleCommentLike.mutate({ commentId: $comment.id });
						}}
					>
						<HeartIcon
							size={16}
							class={{
								'fill-red-500': $comment.likedByViewer,
							}}
						/>
					</button>
					<button
						class="btn btn-xs btn-ghost"
						onclick={() => (create_reply_form_shown = !create_reply_form_shown)}
					>
						{m.reply()}
					</button>
				</div>
			{/if}
			{#if create_reply_form_shown}
				<CreateReplyForm
					commentId={$comment.id}
					commentRepliesCount={$comment.repliesCount}
					onCancel={() => (create_reply_form_shown = false)}
					onSuccess={() => {
						create_reply_form_shown = false;
						replies_list_shown = true;
					}}
				/>
			{/if}
			{#if $comment.repliesCount}
				<details
					bind:open={replies_list_shown}
					ontoggle={(e) => {
						if (!e.currentTarget.open) return;
						repliesQuery.fetch({ variables: { id: $comment.id } });
					}}
				>
					<summary class="btn btn-ghost btn-xs w-24 p-1">
						{#if $repliesQuery.fetching}
							<span class="loading loading-spinner loading-xs"></span>
						{:else if replies_list_shown}
							<ChevronUpIcon />
						{:else}
							<ChevronDownIcon />
						{/if}
						{$comment.repliesCount}
						{m.replies()}
					</summary>
					<div class="flex flex-col gap-2">
						{#each replies as reply (reply.id)}
							<Reply data={reply} {website} />
						{/each}
						{#if $repliesQuery.pageInfo.hasNextPage}
							<div>
								<button
									class="btn btn-sm btn-link"
									onclick={async () => {
										fetchingMoreReplies = true;
										await repliesQuery.loadNextPage();
										fetchingMoreReplies = false;
									}}
									disabled={fetchingMoreReplies}
								>
									{#if fetchingMoreReplies}
										<span class="loading loading-spinner loading-sm"></span>
									{:else if getDir() === 'ltr'}
										<CornerDownRightIcon />
									{:else}
										<CornerDownLeftIcon />
									{/if}
									{m.moreReplies()}
								</button>
							</div>
						{/if}
					</div>
				</details>
			{/if}
		</div>
		<div
			class={['dropdown dropdown-end', { invisible: !Object.values(permissions).includes(true) }]}
		>
			<div tabindex="0" role="button" class="btn btn-circle btn-ghost">
				<EllipsisVerticalIcon size={18} />
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
				{#if permissions.delete}
					<li>
						<button
							onclick={async () => {
								let confirmed = confirm(m.delete_comment_confirm());
								if (!confirmed) return;
								await DeleteComment.mutate({ id: $comment.id });
								alert('Comment deleted');
							}}
						>
							<Trash2Icon />
							{m.delete()}
						</button>
					</li>
				{/if}
				{#if permissions.edit}
					<li>
						<button onclick={() => (editing = true)}>
							<SquarePenIcon />
							{m.edit()}
						</button>
					</li>
				{/if}
				{#if permissions.ban_user}
					<li>
						<button
							onclick={() => {
								let confirmed = confirm(m.ban_author_confirm());
								if (confirmed)
									UpdateUserWebsiteBan.mutate({
										input: { userId: $comment.author.id, websiteId: $website_.id, banned: true },
									});
							}}
						>
							<BanIcon />
							{m.ban_author()}
						</button>
					</li>
				{/if}
			</ul>
		</div>
	{:else}
		<form method="post" use:superform.enhance class="flex grow flex-col gap-3">
			<Textarea {superform} field="content" disabled={$UpdateCommentContent.fetching} />
			<div class="flex justify-end gap-2">
				<button
					type="button"
					class="btn"
					onclick={() => (editing = false)}
					disabled={$UpdateCommentContent.fetching}
				>
					{m.cancel()}
				</button>
				<button type="submit" class="btn btn-primary" disabled={$UpdateCommentContent.fetching}>
					{m.submit()}
					{#if $UpdateCommentContent.fetching}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
