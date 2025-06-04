<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	import { Toasts } from '$lib/client/toasts.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';
	import Input from '$lib/components/Input.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const superform = superForm(data.form, {
		resetForm: false,
		onUpdated({ form }) {
			if (form.valid) {
				Toasts.add({ type: 'success', message: form.message });
			}
		},
	});
</script>

<form class="flex flex-col gap-4" use:superform.enhance method="post">
	<Input {superform} field="name" label="Website name" />
	<CheckBox {superform} field="preModeration" label="Pre-moderation" />

	<button class="btn" type="submit">Submit</button>
</form>
