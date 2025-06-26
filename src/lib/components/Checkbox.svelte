<script
	lang="ts"
	generics="T extends Record<string, unknown>, F extends FormPathLeaves<T, boolean>"
>
	import type { Snippet } from 'svelte';
	import { formFieldProxy, type FormPathLeaves, type SuperForm } from 'sveltekit-superforms';

	import InputFieldError from './InputFieldError.svelte';

	let {
		superform,
		field,
		label,
		join,
	}: {
		superform: SuperForm<T>;
		field: F;
		label?: string;
		join?: Snippet;
	} = $props();

	const { value, errors, constraints } = formFieldProxy(superform, field);

	const isJoined = !!join;
</script>

<div class="flex flex-col">
	<div class={{ join: isJoined }}>
		<label class="floating-label w-xs">
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					name={field}
					bind:checked={$value as boolean}
					class={['checkbox', { 'checkbox-error': !!$errors }]}
					aria-invalid={$errors ? 'true' : undefined}
					{...$constraints}
				/>
				{#if label}
					<span>{label}</span>
				{/if}
			</div>
		</label>
		{#if join}
			{@render join()}
		{/if}
	</div>
	<InputFieldError errors={$errors} />
</div>
