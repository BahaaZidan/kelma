<script lang="ts">
	import '../app.css';

	import { Toasts } from '$lib/client/toasts.svelte';

	let { children } = $props();
</script>

<div class="toast toast-end">
	{#each Toasts.values as toast (toast.message)}
		<div
			class={[
				'alert',
				{
					'alert-success': toast.type === 'success',
					'alert-error': toast.type === 'error',
					'alert-info': toast.type === 'info',
				},
			]}
		>
			<span>{toast.message}</span>
		</div>
	{/each}
</div>

{@render children()}
