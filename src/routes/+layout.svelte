<script lang="ts">
	import '../app.css';

	import { Toasts } from '$lib/client/toasts.svelte';
	import { setViewerContext } from '$lib/client/viewer.svelte';

	import type { LayoutProps } from './$houdini';

	let { children, data }: LayoutProps = $props();
	let { ViewerQuery } = data;
	let viewer = $derived($ViewerQuery.data?.viewer);
	setViewerContext(() => viewer);
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
