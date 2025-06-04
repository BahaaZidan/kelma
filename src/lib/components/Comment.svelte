<script lang="ts">
	import { EllipsisVerticalIcon, SquarePenIcon, Trash2Icon } from '@lucide/svelte';
	import { formatDistance } from 'date-fns';

	import { applyAction, enhance } from '$app/forms';

	import { route } from '$lib/__generated__/routes';

	type Props = {
		id: number;
		content: string;
		createdAt: Date;
		author?: {
			id: string;
			name: string;
			image?: string | null;
		} | null;
		permissions: {
			delete: boolean;
			edit: boolean;
		};
		redirect_url: string;
	};

	let { id, content, createdAt, author, permissions, redirect_url }: Props = $props();
	let editing = $state(false);

	let dialog: HTMLDialogElement;
</script>

{#if author}
	<div class="flex items-start gap-4">
		<img src={author.image} alt="{author.name} profile picture" class="mt-1 size-10 rounded-full" />
		{#if !editing}
			<div class="flex grow flex-col">
				<span>
					<b>{author.name}</b>
					<span class="text-secondary text-sm">
						{formatDistance(createdAt, new Date(), { addSuffix: true })}
					</span>
				</span>
				<span class="whitespace-pre-wrap">{content}</span>
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
						{#if permissions.delete}
							<li>
								<button
									onclick={() => {
										dialog.showModal();
									}}
								>
									<Trash2Icon /> Delete
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
									<SquarePenIcon /> Edit
								</button>
							</li>
						{/if}
					</ul>
				</div>
			{/if}
		{:else}
			<form
				class="flex grow flex-col gap-3"
				method="post"
				action={route('edit /comments/[comment_id]', { comment_id: id })}
				use:enhance={() => {
					return async ({ result }) => {
						await applyAction(result);
						editing = false;
					};
				}}
			>
				<input type="hidden" name="redirect_url" value={redirect_url} />
				<textarea class="textarea w-full" name="content">{content}</textarea>
				<div class="flex justify-end gap-2">
					<button class="btn" type="button" onclick={() => (editing = false)}>Cancel</button>
					<button class="btn" type="submit">Submit</button>
				</div>
			</form>
		{/if}
	</div>

	<dialog bind:this={dialog} class="modal">
		<div class="modal-box max-w-xs">
			<h3 class="text-lg font-bold">Delete comment</h3>
			<p class="py-4">Are you sure you want to delete this comment ?</p>
			<div class="flex justify-end gap-2">
				<form method="dialog">
					<button class="btn">Cancel</button>
				</form>
				<form
					method="post"
					action={route('delete /comments/[comment_id]', { comment_id: id })}
					use:enhance
				>
					<input type="hidden" name="redirect_url" value={redirect_url} />
					<button class="btn" type="submit">Delete</button>
				</form>
			</div>
		</div>
	</dialog>
{/if}
