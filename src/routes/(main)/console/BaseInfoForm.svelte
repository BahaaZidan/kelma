<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { fragment, graphql, type BaseInfoFormComponent } from '$houdini';

	import TextArrayInput from '$lib/client/components/TextArrayInput.svelte';
	import TextInput from '$lib/client/components/TextInput.svelte';
	import { Toasts } from '$lib/client/toasts.svelte';

	import { baseInfoSchema } from './schemas';

	type Props = {
		data: BaseInfoFormComponent;
	};
	let { data }: Props = $props();

	let website = $derived(
		fragment(
			data,
			graphql(`
				fragment BaseInfoFormComponent on Website {
					id
					name
					domains
				}
			`)
		)
	);

	const superform = superForm(defaults($website, valibot(baseInfoSchema)), {
		SPA: true,
		validators: valibot(baseInfoSchema),
		id: $website.id,
		async onUpdate({ form }) {
			if (form.valid) {
				await UpdateWebsiteBasicInfo.mutate({
					input: {
						id: $website.id,
						name: form.data.name,
						domains: form.data.domains,
					},
				});
			}
		},
		resetForm: false,
	});
	let { enhance } = superform;

	const UpdateWebsiteBasicInfo = graphql(`
		mutation UpdateWebsiteBasicInfo($input: UpdateWebsiteInput!) {
			updateWebsite(input: $input) {
				id
				name
				domains
			}
		}
	`);
</script>

<form method="post" use:enhance class="flex flex-col gap-3">
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Website ID</legend>
		<div class="join">
			<input class="input join-item" type="text" value={$website.id} disabled />
			<button
				class="btn join-item rounded-r-full"
				onclick={() => {
					navigator.clipboard.writeText($website.id);
					Toasts.add({ type: 'info', message: 'Website ID copied!' });
				}}
			>
				<CopyIcon size={18} />
			</button>
		</div>
	</fieldset>
	<TextInput {superform} field="name" label="Name" />
	<TextArrayInput {superform} field="domains" label="Domains" />
	<button class="btn" type="submit" disabled={$UpdateWebsiteBasicInfo.fetching}>Submit</button>
</form>
