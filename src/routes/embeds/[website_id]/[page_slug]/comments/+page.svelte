<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';

	import { route } from '$lib/__generated__/routes';
	import { signOut } from '$lib/client/auth';
	import {
		createCursorPaginatedCommentsQuery,
		type CommentsInfiniteData,
	} from '$lib/client/queries';
	import { revertOptimisticUpdate } from '$lib/client/query';
	import CommentsList from '$lib/components/CommentsList.svelte';
	import type { CommentsBaseQueryResult } from '$lib/server/queries';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const query = createCursorPaginatedCommentsQuery(
		route('GET /api/[website_id]/[page_id]/comments', {
			website_id: data.page.websiteId,
			page_id: data.page.id,
		}),
		['embeded_comments', data.page.id],
		data.session
	);

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

	let commentValue = $state('');

	const queryClient = useQueryClient();
	const createCommentMutation = createMutation({
		mutationFn: async () => {
			const res = await fetch(
				route('POST /api/[website_id]/[page_id]/comments', {
					website_id: data.page.websiteId,
					page_id: data.page.id,
				}),
				{
					method: 'POST',
					body: JSON.stringify({ comment: commentValue }),
				}
			);
			if (!res.ok) throw new Error();

			return (await res.json())?.comment as CommentsBaseQueryResult[number];
		},
		onMutate: async () => {
			const queryKey = ['comments', 'embeded_comments', data.page.id];
			await queryClient.cancelQueries({ queryKey });

			const previousData = queryClient.getQueriesData<CommentsInfiniteData>({
				queryKey,
			});

			const tempId = new Date().getTime();

			previousData.forEach(([queryKey, oldData]) => {
				if (!oldData) return;
				const newData: CommentsInfiniteData = {
					...oldData,
					pages: oldData.pages.map((page, i) => {
						const optimisticComment: CommentsBaseQueryResult[number] = {
							id: tempId,
							content: commentValue,
							createdAt: new Date(),
							websiteId: data.page.websiteId,
							published: data.permissions.publish,
							author: {
								id: data.session!.user.id,
								image: data.session!.user.image as string,
								name: data.session!.user.name,
							},
						};
						return {
							...page,
							comments: i === 0 ? [optimisticComment, ...page.comments] : page.comments,
						};
					}),
				};
				queryClient.setQueryData<CommentsInfiniteData>(queryKey, newData);
			});

			return { previousData, tempId };
		},
		onError: revertOptimisticUpdate(queryClient),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['comments', 'embeded_comments', data.page.id],
			});
		},
	});
</script>

<div class="flex flex-col items-center gap-2">
	<div class="flex w-full items-center justify-between">
		{#if data.session}
			<div>
				Logged in as <b>{data.session.user.name}</b>
			</div>
			<button class="btn btn-ghost" onclick={signOut}>Logout</button>
		{:else}
			<span>
				You must <a
					class="link font-bold"
					target="_top"
					href="{route('/embeds/login')}?callback_url={data.searchParams.url}"
				>
					login
				</a>
				to comment
			</span>
		{/if}
	</div>
	<div class="flex w-full flex-col items-end gap-2">
		<label class="floating-label w-full">
			<textarea
				placeholder="Comment"
				class="textarea w-full"
				bind:value={commentValue}
				disabled={!data.permissions.create}
			></textarea>
			<span>Comment</span>
		</label>
		<button
			class="btn"
			onclick={() => {
				$createCommentMutation.mutateAsync().then(() => {
					commentValue = '';
				});
			}}
		>
			Submit
		</button>
	</div>
	<CommentsList {query} />
	<span class="py-6">
		Powered by <a href="https://gebna.tools/" class="link-hover font-bold">gebna.tools</a>
	</span>
</div>

<style>
	:root {
		background: transparent !important;
	}
</style>
