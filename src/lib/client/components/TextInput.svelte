<script lang="ts" generics="T extends Record<string, unknown>">
	import type { Snippet } from 'svelte';
	import type { HTMLInputTypeAttribute } from 'svelte/elements';
	import {
		formFieldProxy,
		type FormPathArrays,
		type FormPathLeaves,
		type SuperForm,
	} from 'sveltekit-superforms';

	import InputFieldError from './InputFieldError.svelte';
	import RemoveInputButton from './RemoveInputButton.svelte';

	let {
		superform,
		field,
		label,
		type = 'text',
		remover,
		join,
	}: {
		superform: SuperForm<T>;
		field: FormPathLeaves<T>;
		label?: string;
		type?: HTMLInputTypeAttribute;
		join?: Snippet;
		remover?: {
			field: FormPathArrays<T>;
			index: number;
		};
	} = $props();

	const { value, errors, constraints } = formFieldProxy(superform, field);

	const isJoined = !!remover || !!join;
</script>

<div class="flex flex-col">
	<div class={{ join: isJoined }}>
		<label class={['floating-label w-xs', { 'join-item': isJoined }]}>
			<input
				placeholder={label}
				class={['input', { 'input-error': !!$errors }]}
				{type}
				name={field}
				bind:value={$value}
				aria-invalid={!!$errors}
				{...$constraints}
			/>
			<span>{label}</span>
		</label>
		{#if join}
			{@render join()}
		{:else if remover}
			<RemoveInputButton
				{superform}
				field={remover.field}
				index={remover.index}
				class="join-item rounded-r-full"
			/>
		{/if}
	</div>
	<InputFieldError errors={$errors} />
</div>
