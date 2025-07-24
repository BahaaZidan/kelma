<script lang="ts">
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
		dataType: 'json',
		async onUpdate({ form }) {
			if (form.valid) {
				const result = await UpdateWebsiteBasicInfo.mutate({
					input: {
						id: $website.id,
						name: form.data.name,
						domains: form.data.domains,
					},
				});
				Toasts.add({
					type: result.errors ? 'error' : 'success',
					message: result.errors
						? result.errors.map((e) => e.message).join(', ')
						: 'Website updated successfully!',
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
	<TextInput {superform} field="name" label="Name" />
	<TextArrayInput {superform} field="domains" label="Trusted Domains" />
	<button class="btn btn-neutral" type="submit" disabled={$UpdateWebsiteBasicInfo.fetching}>
		Submit
	</button>
</form>
