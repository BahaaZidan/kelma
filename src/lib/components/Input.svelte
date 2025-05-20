<script lang="ts" generics="T extends Record<string, unknown>">
	import type { HTMLInputTypeAttribute } from 'svelte/elements';
	import { formFieldProxy, type FormPathLeaves, type SuperForm } from 'sveltekit-superforms';

	let {
		superform,
		field,
		label,
		type = 'text',
	}: {
		superform: SuperForm<T>;
		field: FormPathLeaves<T>;
		label?: string;
		type?: HTMLInputTypeAttribute;
	} = $props();

	const { value, errors, constraints } = formFieldProxy(superform, field);
</script>

<div class="flex w-full flex-col">
	<div>
		<label class="floating-label">
			<input
				placeholder={label}
				class={['input', { 'input-error': !!$errors }]}
				{type}
				name={field}
				bind:value={$value}
				aria-invalid={$errors ? 'true' : undefined}
				{...$constraints}
			/>
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
