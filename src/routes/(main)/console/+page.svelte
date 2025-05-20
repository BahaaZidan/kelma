<script lang="ts">
	import { PlusIcon, XIcon } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';

	import Input from '$lib/components/Input.svelte';

	import type { PageProps } from './$types';

	let dialog: HTMLDialogElement;

	let { data }: PageProps = $props();
	const superform = superForm(data.form, {
		onUpdated({ form }) {
			if (form.valid) dialog.close();
		},
	});
</script>

<div class="flex flex-col">
	<button class="btn btn-primary max-w-48" onclick={() => dialog.showModal()}>
		Create Website <PlusIcon size={16} />
	</button>
	<dialog bind:this={dialog} class="modal">
		<div class="modal-box">
			<div class="flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold">Create New Website</h3>
					<form method="dialog">
						<button class="btn btn-circle btn-ghost"><XIcon /></button>
					</form>
				</div>

				<form
					id="c-w-f"
					method="post"
					use:superform.enhance
					class="flex flex-col items-center gap-3"
				>
					<Input {superform} field="name" label="Name" />
					<Input {superform} field="domain" label="Domain" />
				</form>
			</div>

			<div class="modal-action">
				<button class="btn btn-primary" type="submit" form="c-w-f">Submit</button>
			</div>
		</div>
	</dialog>

	<div class="divider"></div>
	<h2 class="text-xl font-bold">Websites you own</h2>
	<p class="text-secondary">
		You are the owner of these websites. Your subscription applies to all of them.
	</p>
	<ul class="menu bg-base-200 rounded-box w-full">
		{#each data.websites as website (website.id)}
			<li>
				<a class="flex flex-col items-start">
					<div class="font-bold">{website.name}</div>
					<div class="text-secondary">
						ID: <div class="badge badge-neutral">{website.id}</div>
					</div>
				</a>
			</li>
		{/each}
	</ul>
</div>
