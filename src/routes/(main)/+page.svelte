<script lang="ts">
	import { PAGEVIEW_COST_IN_CENTS } from '$lib/constants';

	let price_slider_val = $state(100_000);
</script>

<section class="flex flex-col gap-2">
	<h1 class="text-2xl font-bold">Fair Pricing</h1>
	<p>You are charged per pageview.</p>
	<p>No tiers, no plans, no hidden fees, and no monthly subscriptions.</p>
	<div class="bg-base-200 flex flex-col gap-2 rounded-2xl p-4">
		<p class="text-xl">
			For <span class="font-bold">{price_slider_val.toLocaleString()}</span>
			pageviews
		</p>
		<input
			type="range"
			bind:value={price_slider_val}
			min={10_000}
			max={1_000_000}
			step={10_000}
			class="range range-secondary"
		/>
		<p class="text-xl">
			You pay <span class="font-bold">
				${(price_slider_val * PAGEVIEW_COST_IN_CENTS) / 100}
			</span>
		</p>
	</div>
</section>
