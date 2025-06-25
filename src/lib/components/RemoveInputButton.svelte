<script lang="ts" generics="T extends Record<string, unknown>, F extends FormPathArrays<T>">
	import { XIcon } from '@lucide/svelte';
	import type { ClassValue } from 'svelte/elements';
	import { arrayProxy, type FormPathArrays, type SuperForm } from 'sveltekit-superforms';

	interface Props {
		superform: SuperForm<T>;
		field: F;
		index: number;
		class?: ClassValue;
	}

	let { superform, field, index, class: class_ }: Props = $props();

	const { values } = arrayProxy(superform, field);

	function removeItem() {
		$values = $values.filter((_, i) => i !== index);
	}
</script>

<button class={['btn', class_]} type="button" onclick={removeItem}>
	<XIcon />
</button>
