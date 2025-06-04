<script lang="ts" generics="T extends Record<string, unknown>">
	import { formFieldProxy, type FormPathLeaves, type SuperForm } from 'sveltekit-superforms';

	let {
		superform,
		field,
		label,
	}: {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, boolean>;
		label?: string;
	} = $props();

	const { value, errors } = formFieldProxy(superform, field);
</script>

<div class="flex w-full flex-col">
	<label class="label">
		<input
			type="checkbox"
			class="checkbox"
			name={field}
			bind:checked={$value as boolean}
			aria-invalid={$errors ? 'true' : undefined}
		/>
		{label}
	</label>
	{#if $errors}
		{#each $errors as error (error)}
			<div class="text-error text-xs">
				{error}
			</div>
		{/each}
	{/if}
</div>
