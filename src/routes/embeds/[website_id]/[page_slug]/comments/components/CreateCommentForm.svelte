<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { fragment, graphql, type IsPageClosed } from '$houdini';

	import Textarea from '$lib/client/components/Textarea.svelte';
	import ViewerAvatar from '$lib/client/components/ViewerAvatar.svelte';
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { m } from '$lib/paraglide/messages';
	import { contentSchema } from '$lib/validation-schemas';

	import { is_page_closed } from './fragments';

	interface Props {
		page: IsPageClosed;
	}
	let { page: page_ }: Props = $props();
	let page = $derived(fragment(page_, is_page_closed));

	let viewer = getViewerContext();

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
		id: 'create_comment_superform',
		validators: valibot(contentSchema),
		async onUpdate({ form }) {
			if (form.valid) {
				await CreateComment.mutate({
					input: { pageId: $page.id, content: form.data.content },
				});
			}
		},
	});
	let { isTainted, tainted } = superform;
</script>

<div class="flex w-full gap-4">
	<ViewerAvatar />
	<form method="post" use:superform.enhance class="flex w-full flex-col items-end gap-2">
		<Textarea
			{superform}
			field="content"
			placeholder={$page.closed ? m.page_closed_message() : undefined}
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
