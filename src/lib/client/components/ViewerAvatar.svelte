<script lang="ts">
	import { getViewerContext } from '$lib/client/viewer.svelte';
	import { m } from '$lib/paraglide/messages';

	import Avatar from './Avatar.svelte';

	let viewer = getViewerContext();
</script>

{#if viewer}
	<Avatar
		src={viewer.image}
		alt="{viewer.name} {m.profile_picture()}"
		class="mt-1 size-9"
		fallback={viewer.name}
	/>
{:else}
	<Avatar src="/default_avatar.jpg" class="mt-1 size-9" />
{/if}
