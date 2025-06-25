<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { fragment, graphql, type BaseInfoFormComponent } from '$houdini';

	import TextArrayInput from '$lib/components/TextArrayInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

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
					preModeration
				}
			`)
		)
	);

	const superform = superForm(defaults($website, valibot(baseInfoSchema)), {
		SPA: true,
		validators: valibot(baseInfoSchema),
		async onUpdate({ form }) {
			if (form.valid) {
				await UpdateWebsiteBasicInfo.mutate({
					input: { id: $website.id, name: form.data.name, domains: form.data.domains },
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
				preModeration
				domains
			}
		}
	`);
</script>

<form method="post" use:enhance class="flex flex-col gap-3">
	<TextInput {superform} field="name" label="Name" />
	<TextArrayInput {superform} field="domains" label="Domains" />
	<button class="btn" type="submit" disabled={$UpdateWebsiteBasicInfo.fetching}>Submit</button>
</form>
