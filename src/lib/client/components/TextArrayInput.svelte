<script lang="ts" generics="T extends Record<string, unknown>, F extends FormPathArrays<T, string>">
	import { arrayProxy, type FormPathArrays, type SuperForm } from 'sveltekit-superforms';

	import AddInputButton from './AddInputButton.svelte';
	import FieldSet from './FieldSet.svelte';
	import InputFieldError from './InputFieldError.svelte';
	import TextInput from './TextInput.svelte';

	interface Props {
		superform: SuperForm<T>;
		field: F;
		label: string;
		addInputText?: string;
		disabled?: boolean;
	}

	let { superform, field, label, addInputText, disabled }: Props = $props();

	const { values, errors } = arrayProxy(superform, field);
</script>

<FieldSet>
	{#snippet legend()}
		{label}
	{/snippet}
	<div class="flex flex-col gap-2">
		{#each $values as _, index (index)}
			{/* @ts-expect-error TODO: fix type errors */ null}
			<TextInput {superform} field="{field}[{index}]" remover={{ field, index }} {disabled} />
		{/each}
		<AddInputButton
			{superform}
			{field}
			initialValue={() => '' as never}
			text={addInputText ?? 'Add'}
			{disabled}
		/>
		<InputFieldError errors={$errors} />
	</div>
</FieldSet>
