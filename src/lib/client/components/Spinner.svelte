<script lang="ts">
	interface Props {
		enabled?: boolean;
	}
	let { enabled = false }: Props = $props();
</script>

{#if enabled}
	<span class="loading loading-spinner loading-sm"></span>
{/if}
