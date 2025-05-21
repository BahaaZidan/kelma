<script lang="ts" generics="T extends Record<string, unknown>">
	import type { ClassValue } from 'svelte/elements';
	import { formFieldProxy, type FormPathLeaves, type SuperForm } from 'sveltekit-superforms';

	let {
		superform,
		field,
		label,
		disabled,
		class: class_,
	}: {
		superform: SuperForm<T>;
		field: FormPathLeaves<T>;
		label?: string;
		disabled?: boolean;
		class?: ClassValue;
	} = $props();

	const { value, errors, constraints } = formFieldProxy(superform, field);
</script>

<div class="flex w-full flex-col">
	<div>
		<label class="floating-label">
			<textarea
				placeholder={label}
				class={['textarea', { 'textarea-error': !!$errors }, class_]}
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
