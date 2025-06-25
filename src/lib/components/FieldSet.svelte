<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	let {
		children,
		legend,
		class: class_,
	}: { children: Snippet; legend: Snippet; class?: ClassValue } = $props();
</script>

<fieldset class={['fieldset bg-base-200 border-base-300 rounded-box border p-4', class_]}>
	<legend class="fieldset-legend w-full">
		{@render legend()}
	</legend>

	{@render children()}
</fieldset>
