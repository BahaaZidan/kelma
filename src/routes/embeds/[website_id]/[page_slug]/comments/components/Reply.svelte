<script lang="ts">
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { formatDistance } from 'date-fns';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { fragment, graphql, type ReplyComponent, type WebsiteOwner } from '$houdini';

	import Textarea from '$lib/client/components/Textarea.svelte';
	import { dateLocaleMap } from '$lib/client/i18n';
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import { contentSchema } from '$lib/validation-schemas';

	import { website_owner } from './fragments';

	type Props = {
		data: ReplyComponent;
		website: WebsiteOwner;
	};

	let { data, website }: Props = $props();

	let reply = $derived(
		fragment(
			data,
			graphql(`
				fragment ReplyComponent on Reply {
					id
					content
					createdAt
					author {
						id
						image
						name
					}
				}
			`)
		)
	);

	let website_ = $derived(fragment(website, website_owner));
	let viewer = getViewerContext();
	let permissions = $derived({
		delete: $reply.author.id === viewer?.id || viewer?.id === $website_.owner.id,
		edit: $reply.author.id === viewer?.id,
	});

	const DeleteReply = graphql(`
		mutation DeleteReply($id: ID!) {
			deleteReply(id: $id) {
				id @Reply_delete
			}
		}
	`);

	let editing = $state(false);
	const UpdateReply = graphql(`
		mutation UpdateReply($input: UpdateReplyInput!) {
			updateReply(input: $input) {
				id
				content
				updatedAt
			}
		}
	`);

	const superform = superForm(defaults({ content: $reply.content }, valibot(contentSchema)), {
		SPA: true,
		validators: valibot(contentSchema),
		id: `edit_reply_superform_${$reply.id}`,
		async onUpdate({ form }) {
			if (form.valid) {
				await UpdateReply.mutate({
					input: { replyId: $reply.id, content: form.data.content },
				});
				editing = false;
			}
		},
		resetForm: false,
	});
</script>

<div class="flex items-start gap-4">
	<img
		src={$reply.author.image || 'https://avatars.githubusercontent.com/u/22656046?v=4'}
		alt="{$reply.author.name} {m.profile_picture()}"
		class="mt-1 size-6 rounded-full"
	/>
	{#if !editing}
		<div class="flex grow flex-col">
			<span>
				<span class="font-semibold">{$reply.author.name}</span>
				<span class="text-secondary text-sm">
					{formatDistance($reply.createdAt, new Date(), {
						addSuffix: true,
						locale: dateLocaleMap[getLocale()],
					})}
				</span>
			</span>
			<span class="whitespace-pre-wrap">{$reply.content}</span>
		</div>
		<div
			class={['dropdown dropdown-end', { invisible: !Object.values(permissions).includes(true) }]}
		>
			<div tabindex="0" role="button" class="btn btn-circle btn-ghost">
				<EllipsisVerticalIcon size={16} />
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
				{#if permissions.delete}
					<li>
						<button
							onclick={async () => {
								let confirmed = confirm('Are you sure you want to delete this reply ?');
								if (!confirmed) return;
								await DeleteReply.mutate({ id: $reply.id });
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
			<Textarea {superform} field="content" />
			<div class="flex justify-end gap-2">
				<button type="button" class="btn btn-sm" onclick={() => (editing = false)}>
					{m.cancel()}
				</button>
				<button type="submit" class="btn btn-primary btn-sm">
					{m.submit()}
				</button>
			</div>
		</form>
	{/if}
</div>
