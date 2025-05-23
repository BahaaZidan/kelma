<script lang="ts">
	import { page } from '$app/state';
</script>

{#snippet Messages(big: string, small: string)}
	<p class="mt-6 text-2xl font-semibold md:text-3xl">
		{big}
	</p>
	<p class="text-base-content mt-4 mb-8">
		{small}
	</p>
{/snippet}

<div class="bg-base-200 flex min-h-screen items-center justify-center p-4">
	<div class="text-center">
		<h1 class="text-primary text-9xl font-bold">{page.status}</h1>
		{#if page.status < 500}
			{@render Messages('Page Not Found', "Sorry, the page you're looking for doesn't exist.")}
		{:else}
			{@render Messages('Something Went Wrong', 'Sorry, an unexpected error occured.')}
		{/if}
		<a href="/" class="btn btn-primary">Go Home</a>
	</div>
</div>
