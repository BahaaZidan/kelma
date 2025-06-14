<script lang="ts">
	import {
		EllipsisVerticalIcon,
		SquareCheckBigIcon,
		SquarePenIcon,
		Trash2Icon,
	} from '@lucide/svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { formatDistance } from 'date-fns';

	import { route } from '$lib/__generated__/routes';
	import type { CommentsInfiniteData } from '$lib/client/queries';
	import { revertOptimisticUpdate } from '$lib/client/query';

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
			approve: boolean;
		};
		published?: boolean;
	};

	let { id, content, createdAt, author, permissions, published }: Props = $props();
	let editing = $state(false);
	let contentVal = $derived(content);

	let dialog: HTMLDialogElement;

	const queryClient = useQueryClient();

	const approveCommentMutation = createMutation({
		mutationFn: async () => {
			const res = await fetch(route('PATCH /api/comments/[comment_id]', { comment_id: id }), {
				method: 'PATCH',
			});
			if (!res.ok) throw new Error();
			return res.status;
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ['comments'], exact: false });

			const previousData = queryClient.getQueriesData<CommentsInfiniteData>({
				queryKey: ['comments'],
				exact: false,
			});

			previousData.forEach(([queryKey, oldData]) => {
				if (!oldData) return;

				const newData: CommentsInfiniteData = {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						comments: page.comments.map((comment) =>
							comment.id === id ? { ...comment, published: true } : comment
						),
					})),
				};

				queryClient.setQueryData<CommentsInfiniteData>(queryKey, newData);
			});

			return { previousData };
		},
		onError: revertOptimisticUpdate(queryClient),
	});

	const updateCommentMutation = createMutation({
		mutationFn: async () => {
			const res = await fetch(route('PUT /api/comments/[comment_id]', { comment_id: id }), {
				method: 'PUT',
				body: JSON.stringify({ content: contentVal }),
			});
			if (!res.ok) throw new Error();
			return res.status;
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ['comments'], exact: false });

			const previousData = queryClient.getQueriesData<CommentsInfiniteData>({
				queryKey: ['comments'],
				exact: false,
			});

			previousData.forEach(([queryKey, oldData]) => {
				if (!oldData) return;

				const newData: CommentsInfiniteData = {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						comments: page.comments.map((comment) =>
							comment.id === id ? { ...comment, content: contentVal } : comment
						),
					})),
				};

				queryClient.setQueryData<CommentsInfiniteData>(queryKey, newData);
			});

			editing = false;
			return { previousData };
		},
		onError: revertOptimisticUpdate(queryClient),
	});

	const deleteCommentMutation = createMutation({
		mutationFn: async () => {
			const res = await fetch(route('DELETE /api/comments/[comment_id]', { comment_id: id }), {
				method: 'DELETE',
			});
			if (!res.ok) throw new Error();
			return res.status;
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ['comments'], exact: false });

			const previousData = queryClient.getQueriesData<CommentsInfiniteData>({
				queryKey: ['comments'],
				exact: false,
			});

			previousData.forEach(([queryKey, oldData]) => {
				if (!oldData) return;

				const newData: CommentsInfiniteData = {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						comments: page.comments.filter((comment) => comment.id !== id),
					})),
				};

				queryClient.setQueryData<CommentsInfiniteData>(queryKey, newData);
			});

			return { previousData };
		},
		onError: revertOptimisticUpdate(queryClient),
	});
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
					{#if !published}
						<div class="badge badge-info badge-sm rounded-2xl">Awaiting Approval</div>
					{/if}
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
						{#if permissions.approve}
							<li>
								<button onclick={() => $approveCommentMutation.mutate()}>
									<SquareCheckBigIcon /> Approve
								</button>
							</li>
						{/if}
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
			<div class="flex grow flex-col gap-3">
				<textarea class="textarea w-full" name="content" bind:value={contentVal}></textarea>
				<div class="flex justify-end gap-2">
					<button class="btn" onclick={() => (editing = false)}>Cancel</button>
					<button class="btn" onclick={() => $updateCommentMutation.mutate()}>Submit</button>
				</div>
			</div>
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
				<button class="btn" type="button" onclick={() => $deleteCommentMutation.mutate()}>
					Delete
				</button>
			</div>
		</div>
	</dialog>
{/if}
