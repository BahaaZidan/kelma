<script lang="ts" generics="T extends Record<string, unknown>">
	import { formFieldProxy, type FormPathLeaves, type SuperForm } from 'sveltekit-superforms';

	import AutoSizeTextarea from './AutoSizeTextarea.svelte';
	import InputFieldError from './InputFieldError.svelte';

	interface Props {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, string>;
		placeholder?: string;
		disabled?: boolean;
	}
	let { superform, field, placeholder, disabled }: Props = $props();
	const { value, errors, constraints } = formFieldProxy(superform, field);
</script>

<div class="flex w-full flex-col">
	<AutoSizeTextarea
		bind:value={$value as string}
		name={field}
		aria-invalid={!!$errors}
		class={['textarea w-full', { 'textarea-error': !!$errors }]}
		{disabled}
		{placeholder}
		{...$constraints}
	/>
	<InputFieldError errors={$errors} />
</div>
