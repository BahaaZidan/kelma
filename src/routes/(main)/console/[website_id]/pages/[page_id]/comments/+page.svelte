<script lang="ts">
	import { ArrowLeftIcon } from '@lucide/svelte';

	import { route } from '$lib/__generated__/routes';
	import { createCursorPaginatedCommentsQuery } from '$lib/client/queries';
	import CommentsList from '$lib/components/CommentsList.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const query = createCursorPaginatedCommentsQuery(
		route('GET /api/[website_id]/[page_id]/comments', {
			website_id: data.websiteId,
			page_id: data.pageId,
		}),
		['console_page_comments', data.pageId],
		data.session
	);
</script>

<div class="flex w-full flex-col gap-4 px-5">
	<a class="btn" href={route('/console/[website_id]/pages', { website_id: data.websiteId })}>
		<ArrowLeftIcon /> Back to pages
	</a>
	<CommentsList {query} />
</div>
