<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { fragment, graphql, type IsPageClosed } from '$houdini';

	import Textarea from '$lib/client/components/Textarea.svelte';
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { contentSchema } from '$lib/validation-schemas';

	import { is_page_closed } from './fragments';

	interface Props {
		page: IsPageClosed;
	}
	let { page }: Props = $props();

	let viewer = getViewerContext();
	let page_ = $derived(fragment(page, is_page_closed));

	let disabled = $derived(!viewer || $page_.closed);

	const CreateComment = graphql(`
		mutation CreateComment($input: CreateCommentInput!) {
			createComment(input: $input) {
				...Embed_Comments_insert @prepend
			}
		}
	`);

	const superform = superForm(defaults(valibot(contentSchema)), {
		SPA: true,
		id: 'create_comment_superform',
		validators: valibot(contentSchema),
		async onUpdate({ form }) {
			if (form.valid) {
				await CreateComment.mutate({
					input: { pageId: $page_.id, content: form.data.content },
				});
			}
		},
	});
</script>

<form method="post" use:superform.enhance class="flex w-full flex-col items-end gap-2">
	<Textarea
		{superform}
		field="content"
		placeholder={$page_.closed ? m.page_closed_message() : undefined}
		{disabled}
	/>
	<button class="btn btn-primary" type="submit" {disabled}>
		{m.submit()}
	</button>
</form>
