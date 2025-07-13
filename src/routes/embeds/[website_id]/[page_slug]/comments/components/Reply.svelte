<script lang="ts">
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { formatDistance } from 'date-fns';
	import { ar, enUS } from 'date-fns/locale';

	import { fragment, graphql, type ReplyComponent, type WebsiteOwner } from '$houdini';

	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';

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

	const localeMap = {
		en: enUS,
		ar,
	} as const;

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
		src={$reply.author.image || 'https://avatars.githubusercontent.com/u/22656046?v=4'}
		alt="{$reply.author.name} {m.profile_picture()}"
		class="mt-1 size-6 rounded-full"
	/>
	<div class="flex grow flex-col">
		<span>
			<span class="font-semibold">{$reply.author.name}</span>
			<span class="text-secondary text-sm">
				{formatDistance($reply.createdAt, new Date(), {
					addSuffix: true,
					locale: localeMap[getLocale()],
				})}
			</span>
		</span>
		<span class="whitespace-pre-wrap">{$reply.content}</span>
	</div>
	<div class={['dropdown dropdown-end', { invisible: !Object.values(permissions).includes(true) }]}>
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
