<script lang="ts">
	import type { SimpleIcon } from 'simple-icons';

	let {
		icon,
		size = 24,
		color = 'currentColor',
	}: { icon: SimpleIcon; size?: number; color?: string } = $props();
</script>

<svg role="img" fill={color ?? `#${icon.hex}`} width={size} height={size} viewBox="0 0 24 24">
	<title>{icon.title}</title>
	<path d={icon.path} />
</svg>
