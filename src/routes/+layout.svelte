<script lang="ts">
	import '../app.css';

	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	import { browser } from '$app/environment';

	import { Toasts } from '$lib/client/toasts.svelte';

	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
			},
		},
	});
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

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
