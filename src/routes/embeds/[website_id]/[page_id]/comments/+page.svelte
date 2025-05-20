<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex flex-col">
	<textarea class="textarea" placeholder="Comment"></textarea>
	<div class="flex flex-col gap-2">
		{#each data.comments as comment (comment.id)}
			<div>{comment.content}</div>
		{/each}
	</div>
	<div>
		Powered by <b>gebna.tools</b>
	</div>
</div>
