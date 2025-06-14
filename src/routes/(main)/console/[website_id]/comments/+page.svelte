<script lang="ts">
	import { route } from '$lib/__generated__/routes';
	import { createCursorPaginatedCommentsQuery } from '$lib/client/queries';
	import CommentsList from '$lib/components/CommentsList.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const query = createCursorPaginatedCommentsQuery(
		route('GET /api/[website_id]/comments', { website_id: data.websiteId }),
		['website_comments', data.websiteId],
		data.session
	);
</script>

<CommentsList {query} />
