<script lang="ts">
	let { errors = [] }: { errors?: string[] } = $props();
</script>

{#each errors as error (error)}
	<div class="text-error text-xs">
		{error}
	</div>
{/each}
