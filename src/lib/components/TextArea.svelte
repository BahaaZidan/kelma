<script lang="ts" generics="T extends Record<string, unknown>">
	import { formFieldProxy, type FormPathLeaves, type SuperForm } from 'sveltekit-superforms';

	let {
		superform,
		field,
		label,
		disabled,
	}: {
		superform: SuperForm<T>;
		field: FormPathLeaves<T>;
		label?: string;
		disabled?: boolean;
	} = $props();

	const { value, errors, constraints } = formFieldProxy(superform, field);
</script>

<div class="flex flex-col">
	<div>
		<label class="floating-label w-xs">
			<textarea
				placeholder={label}
				class={['textarea', { 'textarea-error': !!$errors }]}
				name={field}
				bind:value={$value}
				aria-invalid={$errors ? 'true' : undefined}
				{disabled}
				{...$constraints}
			></textarea>
			<span>{label}</span>
		</label>
	</div>
	{#if $errors}
		{#each $errors as error (error)}
			<div class="text-error text-xs">
				{error}
			</div>
		{/each}
	{/if}
</div>
