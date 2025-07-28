<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
	}
	let { title, children }: Props = $props();
</script>

<div class="card bg-base-100 shadow">
	<div class="card-body">
		<h2 class="card-title">{title}</h2>
		<div>{@render children()}</div>
	</div>
</div>
