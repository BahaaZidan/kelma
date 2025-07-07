<script lang="ts">
	import { PAGEVIEW_COST_IN_CENTS } from '$lib/constants';

	let price_slider_val = $state(100_000);
</script>

<section>
	<h1 class="text-2xl font-bold">Pricing</h1>

	<p class="text-xl font-semibold">For {price_slider_val.toLocaleString()} pageviews,</p>
	<input
		type="range"
		bind:value={price_slider_val}
		min={10_000}
		max={1_000_000}
		step={10_000}
		class="range range-secondary"
	/>
	<p class="text-xl font-semibold">You pay ${(price_slider_val * PAGEVIEW_COST_IN_CENTS) / 100}</p>
</section>
