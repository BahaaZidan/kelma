<script lang="ts" generics="T extends Record<string, unknown>, F extends FormPathArrays<T>">
	import {
		arrayProxy,
		type FormPathArrays,
		type FormPathType,
		type SuperForm,
	} from 'sveltekit-superforms';

	interface Props {
		superform: SuperForm<T>;
		field: F;
		text: string;
		initialValue: () => FormPathType<T, F> extends (infer U)[] ? U : never;
	}

	let { superform, field, text, initialValue }: Props = $props();

	const { values } = arrayProxy(superform, field);
</script>

<button
	class="btn btn-secondary max-w-xs"
	type="button"
	onclick={() => {
		$values = $values.concat(initialValue());
	}}
>
	{text}
</button>
