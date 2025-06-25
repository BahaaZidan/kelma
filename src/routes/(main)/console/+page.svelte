<script lang="ts">
	import { PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	import { graphql } from '$houdini';

	import BaseInfoForm from './BaseInfoForm.svelte';

	let query = graphql(`
		query ConsoleViewerQuery {
			viewer {
				id
				name
				image
				websites {
					id
					name
					domains
					...BaseInfoFormComponent
				}
			}
		}
	`);
	onMount(async () => {
		await query.fetch();
	});
	let viewer = $derived($query.data?.viewer);
</script>

{#if viewer}
	<div class="tabs tabs-lift p-4">
		{#each viewer.websites as website (website.id)}
			<input type="radio" name={website.id} class="tab" aria-label={website.name} checked />
			<div class="tab-content bg-base-100 border-base-300 p-6">
				<BaseInfoForm data={website} />
			</div>
		{/each}
		<button class="tab"><PlusIcon /></button>
	</div>
{/if}
