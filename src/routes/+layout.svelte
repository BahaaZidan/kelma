<script lang="ts">
	import { Toasts } from '$lib/client/toasts.svelte';

	import '../app.css';

	let { children } = $props();
</script>

<div class="toast toast-end">
	{#each Toasts.values as toast (toast.message)}
		<div
			class={[
				'alert',
				{ 'alert-success': toast.type === 'success', 'alert-error': toast.type === 'error' },
			]}
		>
			<span>{toast.message}</span>
		</div>
	{/each}
</div>

{@render children()}
