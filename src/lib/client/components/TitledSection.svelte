<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children, id }: { title: string; children: Snippet; id?: string } = $props();
</script>

<section
	class="bg-secondary-content flex flex-col overflow-hidden rounded-xl text-sm *:px-5 *:py-3"
	{id}
>
	<h2 class="bg-base-100 rounded-t-xl">{title}</h2>
	{@render children()}
</section>
