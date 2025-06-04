<script lang="ts">
	import { ArrowLeftIcon } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';

	import { route } from '$lib/__generated__/routes';
	import { Toasts } from '$lib/client/toasts.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';

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

<div class="flex w-full flex-col gap-4 px-5">
	<a class="btn" href={route('/console/[website_id]/pages', { website_id: data.websiteId })}>
		<ArrowLeftIcon /> Back to pages
	</a>
	<form method="post" use:superform.enhance class="flex flex-col gap-2">
		<CheckBox {superform} field="closed" label="Closed" />
		<CheckBox {superform} field="preModeration" label="Pre-moderation" />

		<button class="btn" type="submit">Submit</button>
	</form>
</div>
