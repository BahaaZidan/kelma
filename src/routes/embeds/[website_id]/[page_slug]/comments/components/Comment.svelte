<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import ThumbsDownIcon from '@lucide/svelte/icons/thumbs-down';
	import ThumbsUpIcon from '@lucide/svelte/icons/thumbs-up';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { formatDistance } from 'date-fns';
	import { ar, enUS } from 'date-fns/locale';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import {
		fragment,
		graphql,
		type CommentComponent,
		type CommentComponentPage,
		type CommentComponentWebsite,
	} from '$houdini';

	import Textarea from '$lib/client/components/Textarea.svelte';
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import { contentSchema } from '$lib/validation-schemas';

	import CreateReplyForm from './CreateReplyForm.svelte';

	type Props = {
		data: CommentComponent;
		website: CommentComponentWebsite;
		page: CommentComponentPage;
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
				}
			`)
		)
	);

	let website_ = $derived(
		fragment(
			website,
			graphql(`
				fragment CommentComponentWebsite on Website {
					owner {
						id
					}
				}
			`)
		)
	);

	let page_ = $derived(
		fragment(
			page,
			graphql(`
				fragment CommentComponentPage on Page {
					closed
				}
			`)
		)
	);

	let viewer = getViewerContext();
	let permissions = $derived({
		delete: $comment.author.id === viewer?.id || viewer?.id === $website_.owner.id,
		edit: $comment.author.id === viewer?.id,
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

	let replies_list_shown = $state(false);
	let create_reply_form_shown = $state(false);

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

	const DeleteReply = graphql(`
		mutation DeleteReply($id: ID!) {
			deleteReply(id: $id) {
				id @Reply_delete
			}
		}
	`);
</script>

<div class="flex items-start gap-4">
	<img
		src={$comment.author.image}
		alt="{$comment.author.name} {m.profile_picture()}"
		class="mt-1 size-10 rounded-full"
	/>
	{#if !editing}
		<div class="flex grow flex-col">
			<span>
				<span class="font-semibold">{$comment.author.name}</span>
				<span class="text-secondary text-sm">
					{formatDistance($comment.createdAt, new Date(), {
						addSuffix: true,
						locale: localeMap[getLocale()],
					})}
				</span>
			</span>
			<span class="whitespace-pre-wrap">{$comment.content}</span>
			{#if viewer && !$page_.closed}
				<div class="flex gap-2">
					<button class="btn btn-xs btn-ghost"><ThumbsUpIcon size={16} /></button>
					<button class="btn btn-xs btn-ghost"><ThumbsDownIcon size={16} /></button>
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
								<div
									class={[
										'dropdown dropdown-end',
										{ invisible: !Object.values(permissions).includes(true) },
									]}
								>
									<div tabindex="0" role="button" class="btn btn-circle btn-ghost">
										<EllipsisVerticalIcon size={16} />
									</div>
									<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
									<ul
										tabindex="0"
										class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
									>
										{#if permissions.delete}
											<li>
												<button
													onclick={async () => {
														let confirmed = confirm('Are you sure you want to delete this reply ?');
														if (!confirmed) return;
														await DeleteReply.mutate({ id: reply.id });
													}}
												>
													<Trash2Icon />
													{m.delete()}
												</button>
											</li>
										{/if}
										<!-- {#if permissions.edit}
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
				{/if} -->
									</ul>
								</div>
							</div>
						{/each}
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
							onclick={() => {
								let confirmed = confirm('Are you sure you want to delete this comment ?');
								if (confirmed) DeleteComment.mutate({ id: $comment.id });
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
	{:else}
		<form method="post" use:superform.enhance class="flex grow flex-col gap-3">
			<Textarea {superform} field="content" placeholder={m.comment()} />
			<div class="flex justify-end gap-2">
				<button type="button" class="btn" onclick={() => (editing = false)}>{m.cancel()}</button>
				<button type="submit" class="btn btn-primary">
					{m.submit()}
				</button>
			</div>
		</form>
	{/if}
</div>
