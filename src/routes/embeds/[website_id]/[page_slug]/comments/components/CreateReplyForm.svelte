<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { cache, graphql } from '$houdini';

	import Textarea from '$lib/client/components/Textarea.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { contentSchema } from '$lib/validation-schemas';

	interface Props {
		commentId: string;
		commentRepliesCount: number;
		onCancel: () => void;
		onSuccess: () => void;
	}
	let { commentId, commentRepliesCount, onCancel, onSuccess }: Props = $props();

	const CreateReplyMutation = graphql(`
		mutation CreateReply($input: CreateReplyInput!, $commentId: ID!) {
			createReply(input: $input) {
				...Comment_Replies_insert @prepend @parentID(value: $commentId)
			}
		}
	`);

	let comment_replies_count_fragment = graphql(`
		fragment CommentRepliesCount on Comment {
			repliesCount
		}
	`);

	const superform = superForm(defaults(valibot(contentSchema)), {
		SPA: true,
		id: `create_reply_superform_${commentId}`,
		validators: valibot(contentSchema),
		async onUpdate({ form }) {
			if (form.valid) {
				const mutationResult = await CreateReplyMutation.mutate({
					commentId,
					input: { commentId, content: form.data.content },
				});
				// TODO: better error handling
				if (mutationResult.errors) return;
				const comment = cache.get('Comment', { id: commentId });
				comment.write({
					fragment: comment_replies_count_fragment,
					data: {
						repliesCount: commentRepliesCount + 1,
					},
				});
				onSuccess();
			}
		},
	});

	let disabled = $derived($CreateReplyMutation.fetching);
</script>

<form method="post" use:superform.enhance class="flex flex-col gap-2">
	<Textarea {superform} field="content" {disabled} />
	<div class="flex justify-end gap-2">
		<button type="button" class="btn btn-xs" onclick={onCancel} {disabled}>{m.cancel()}</button>
		<button type="submit" class="btn btn-xs btn-primary" {disabled}>
			{m.submit()}
			{#if $CreateReplyMutation.fetching}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
		</button>
	</div>
</form>
