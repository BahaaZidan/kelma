<script lang="ts">
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { onMount } from 'svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { graphql } from '$houdini';

	import TextArrayInput from '$lib/client/components/TextArrayInput.svelte';
	import TextInput from '$lib/client/components/TextInput.svelte';
	import TitledSection from '$lib/client/components/TitledSection.svelte';
	import { Toasts } from '$lib/client/toasts.svelte';

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
				const result = await CreateWebsite.mutate({
					input: { name: form.data.name, domains: form.data.domains },
				});
				selectedWebsiteId = result.data?.createWebsite.id;
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
	{#if !viewer.websites.length}
		<div role="alert" class="alert alert-info">
			<CircleAlertIcon />
			<span>
				You need to <button
					class="btn btn-link p-0 align-baseline"
					onclick={() => createWebsiteDialog.showModal()}
				>
					create a website
				</button>
				to use console.
			</span>
		</div>
	{:else}
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
					<TitledSection title="Basic Settings">
						<div>
							Website ID: <button
								class="btn btn-xs btn-info"
								onclick={() => {
									navigator.clipboard.writeText(website.id);
									Toasts.add({ type: 'info', message: 'Website ID copied!' });
								}}
							>
								<CopyIcon size={18} />
								{website.id}
							</button>
						</div>
						<BaseInfoForm data={website} />
					</TitledSection>
				</div>
			{/each}
			<button class="tab" onclick={() => createWebsiteDialog.showModal()}><PlusIcon /></button>
		</div>
	{/if}
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
