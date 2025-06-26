<script lang="ts">
	import { PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { graphql } from '$houdini';

	import TextArrayInput from '$lib/components/TextArrayInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

	import BaseInfoForm from './BaseInfoForm.svelte';
	import { baseInfoSchema } from './schemas';

	let query = graphql(`
		query ConsoleViewerQuery {
			viewer {
				id
				name
				image
				websites @list(name: "Console_Website_List") {
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

	let selectedWebsiteId = $derived(viewer?.websites[0].id);

	let createWebsiteDialog: HTMLDialogElement;
	const superform = superForm(defaults(valibot(baseInfoSchema)), {
		SPA: true,
		validators: valibot(baseInfoSchema),
		async onUpdate({ form }) {
			if (form.valid) {
				const lolo = await CreateWebsite.mutate({
					input: { name: form.data.name, domains: form.data.domains },
				});
				selectedWebsiteId = lolo.data?.createWebsite.id;
				createWebsiteDialog.close();
			}
		},
	});
	let { enhance } = superform;

	const CreateWebsite = graphql(`
		mutation CreateWebsite($input: CreateWebsiteInput!) {
			createWebsite(input: $input) {
				id
				...Console_Website_List_insert @append
			}
		}
	`);
</script>

{#if viewer}
	<div class="tabs tabs-lift p-4">
		{#each viewer.websites as website (website.id)}
			<input
				type="radio"
				name={website.id}
				class="tab"
				aria-label={website.name}
				checked={website.id === selectedWebsiteId}
				onclick={() => (selectedWebsiteId = website.id)}
			/>
			<div class="tab-content bg-base-100 border-base-300 p-6">
				<BaseInfoForm data={website} />
			</div>
		{/each}
		<button class="tab" onclick={() => createWebsiteDialog.showModal()}><PlusIcon /></button>
	</div>
{/if}

<dialog bind:this={createWebsiteDialog} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Create Website</h3>

		<form method="post" use:enhance class="flex flex-col gap-1" id="create_website_form">
			<TextInput {superform} field="name" label="Name" />
			<TextArrayInput {superform} field="domains" label="Domains" />
		</form>

		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Close</button>
			</form>
			<button
				class="btn btn-primary"
				type="submit"
				form="create_website_form"
				disabled={$CreateWebsite.fetching}
			>
				Submit
			</button>
		</div>
	</div>
</dialog>
