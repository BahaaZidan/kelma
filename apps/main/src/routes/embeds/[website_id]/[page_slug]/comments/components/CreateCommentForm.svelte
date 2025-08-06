<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { fragment, graphql, type IsPageClosed } from '$houdini';

	import { fetchWithAuth } from '$lib/client/auth';
	import Avatar from '$lib/client/components/Avatar.svelte';
	import Textarea from '$lib/client/components/Textarea.svelte';
	import { m } from '$lib/paraglide/messages';
	import { contentSchema } from '$lib/validation-schemas';

	import { is_page_closed } from './fragments';

	interface Props {
		page: IsPageClosed;
		parentId?: string;
		onSuccess?: () => unknown;
		viewer?: {
			id: string;
			name: string;
			image?: string | null;
		} | null;
	}
	let { page: page_, parentId, onSuccess, viewer }: Props = $props();
	let page = $derived(fragment(page_, is_page_closed));

	const CreateReply = graphql(`
		mutation CreateReply($input: CreateCommentInput!, $parentId: ID!) {
			createComment(input: $input) {
				...Comment_Replies_insert @prepend @parentID(value: $parentId)
			}
		}
	`);
	const CreateComment = graphql(`
		mutation CreateComment($input: CreateCommentInput!) {
			createComment(input: $input) {
				...Embed_Comments_insert @prepend
			}
		}
	`);

	let disabled = $derived(!viewer || $page.closed || $CreateComment.fetching);

	const superform = superForm(defaults(valibot(contentSchema)), {
		SPA: true,
		id: `create_comment_superform_${parentId || ''}`,
		validators: valibot(contentSchema),
		async onUpdate({ form }) {
			if (!form.valid) return;
			if (!parentId) {
				await CreateComment.mutate(
					{
						input: { pageId: $page.id, content: form.data.content },
					},
					{ fetch: fetchWithAuth }
				);
			} else {
				await CreateReply.mutate(
					{
						parentId,
						input: { pageId: $page.id, content: form.data.content, parentId },
					},
					{ fetch: fetchWithAuth }
				);
			}

			onSuccess?.();
		},
	});
	let { isTainted, tainted } = superform;
</script>

<div class="flex w-full gap-4">
	{#if viewer}
		<Avatar
			src={viewer.image}
			alt="{viewer.name} {m.profile_picture()}"
			class="mt-1 size-9"
			fallback={viewer.name}
		/>
	{:else}
		<Avatar src="/default_avatar.jpg" class="mt-1 size-9" />
	{/if}

	<form method="post" use:superform.enhance class="flex w-full flex-col items-end gap-2">
		<Textarea
			{superform}
			field="content"
			placeholder={$page.closed ? m.page_closed_message() : m.write_a_comment()}
			{disabled}
		/>
		<button
			class={['btn btn-primary btn-sm', { invisible: !isTainted($tainted) }]}
			type="submit"
			{disabled}
		>
			{m.submit()}
			{#if $CreateComment.fetching}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
		</button>
	</form>
</div>
