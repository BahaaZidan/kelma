<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { graphql } from '$houdini';

	import Textarea from '$lib/client/components/Textarea.svelte';
	import { m } from '$lib/paraglide/messages.js';

	import { commentContentSchema } from './schemas';

	interface Props {
		disabled?: boolean;
		pageId: string;
	}
	let { pageId, disabled }: Props = $props();

	const CreateComment = graphql(`
		mutation CreateComment($input: CreateCommentInput!) {
			createComment(input: $input) {
				...Embed_Comments_insert @prepend
			}
		}
	`);

	const superform = superForm(defaults(valibot(commentContentSchema)), {
		SPA: true,
		id: 'create_comment_superform',
		validators: valibot(commentContentSchema),
		async onUpdate({ form }) {
			if (form.valid) {
				await CreateComment.mutate({
					input: { pageId, content: form.data.content },
				});
			}
		},
	});
</script>

<form method="post" use:superform.enhance class="flex w-full flex-col items-end gap-2">
	<Textarea {superform} field="content" placeholder={m.comment()} {disabled} />
	<button class="btn btn-primary" type="submit" {disabled}>
		{m.submit()}
	</button>
</form>
