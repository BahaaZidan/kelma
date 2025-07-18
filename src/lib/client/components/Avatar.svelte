<script lang="ts">
	import type { ClassValue, HTMLImgAttributes } from 'svelte/elements';

	type Props = {
		class: ClassValue;
		fallback: string;
	} & Pick<HTMLImgAttributes, 'src' | 'alt'>;

	let { src, alt, class: class_, fallback }: Props = $props();
	let error = $state(false);
	const fallbackBackgroundColors = [
		'bg-accent',
		'bg-primary',
		'bg-error',
		'bg-neutral',
		'bg-secondary',
		'bg-success',
	] as const;
</script>

{#if !error}
	<img {src} {alt} onerror={() => (error = true)} class={['rounded-full', class_]} />
{:else}
	<div
		class={[
			'flex items-center justify-center rounded-full text-xl',
			{
				[fallbackBackgroundColors[Math.floor(Math.random() * fallbackBackgroundColors.length)]]:
					true,
			},
			class_,
		]}
	>
		{fallback[0].toUpperCase()}
	</div>
{/if}
