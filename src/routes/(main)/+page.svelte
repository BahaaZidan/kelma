<script lang="ts">
	import MailIcon from '@lucide/svelte/icons/mail';
	import { siGithub } from 'simple-icons';

	import { env } from '$env/dynamic/public';

	import BrandIcon from '$lib/client/components/BrandIcon.svelte';
	import { PAGEVIEW_COST_IN_CENTS } from '$lib/constants';
	import { LANGS } from '$lib/i18n';
	import { route } from '$lib/routes';

	import FeatureCard from './FeatureCard.svelte';

	let price_slider_val = $state(100_000);

	const login_url = `${route('/login')}?callback_url=${env.PUBLIC_BASE_URL + route('/console')}`;
	const iconClass = 'transition-all duration-300 ease-in-out hover:text-gray-700';

	const canonicalURL = 'https://kelma.dev/';
	const title = 'Kelma';
	const description =
		'Drop-in Comment Section for Every Website. Ad-free, privacy-respecting, open-source, and insanely fast. Effortless setup with easy customization and fair usage-based pricing.';
	const imageURL = new URL('/icon.png', canonicalURL).toString();
</script>

<svelte:head>
	<link rel="canonical" href={canonicalURL} />

	<title>{title}</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalURL} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={imageURL} />

	<meta property="twitter:card" content="summary" />
	<meta property="twitter:url" content={canonicalURL} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={imageURL} />
</svelte:head>

<div class="flex min-h-screen flex-col justify-between gap-4">
	<section class="px-6 py-10 text-center">
		<h1 class="mb-4 text-4xl font-bold">Drop-in Comment Section for Every Website</h1>
		<p class="mx-auto mb-6 max-w-2xl text-lg">
			Ad-free, privacy-respecting, open-source, and insanely fast. Effortless setup with easy
			customization and fair usage-based pricing.
		</p>
		<a href={login_url} class="btn btn-primary btn-lg">Try it for free</a>
	</section>

	<section class="bg-base-200 rounded-box px-6 py-10">
		<div class="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
			<FeatureCard title="🚫 Ad-Free & Private">
				We collect minimal telemetry and never sell user data. No ads, ever.
			</FeatureCard>
			<FeatureCard title="🌐 Open Source">
				Fully transparent. Auditable by anyone. Hosted or self-hosted — your choice.
			</FeatureCard>
			<FeatureCard title="⚡ Impossibly Snappy">
				Comments load instantly. Interactions feel fast and smooth.
			</FeatureCard>
			<FeatureCard title="💸 Fair Pricing">
				Pay only for what you use. No tiers, no plans, no hidden fees, and no monthly subscriptions.
			</FeatureCard>
			<FeatureCard title="🎨 Easily Customizable">
				Pick from 35 themes. Integrates seamlessly with your design.
			</FeatureCard>
			<FeatureCard title="🌍 Multi-language">
				Support for 25 languages including <div
					class="tooltip tooltip-secondary"
					data-tip="Standard Arabic"
				>
					Arabic
				</div>
				,
				<div
					class="tooltip tooltip-secondary"
					data-tip="Cantonese, Simplified Chinese, and Traditional Chinese"
				>
					Chinese
				</div>
				,
				<div class="tooltip tooltip-secondary" data-tip="Neutral Spanish">Spanish</div>
				, Hindi, and
				<div
					class="tooltip tooltip-secondary"
					data-tip={Object.values(LANGS)
						.filter((l) => !['ar', 'es', 'hi', 'yue', 'zh-Hans', 'zh-Hant'].includes(l.code))
						.map((l) => l.label)
						.join(', ')}
				>
					many more
				</div>
				.
			</FeatureCard>
		</div>
	</section>

	<section id="get-started" class="px-6 py-6 text-center">
		<h2 class="mb-4 text-3xl font-bold">Get 10,000 Free Page Views</h2>
		<p class="mb-6">No credit card required. Start engaging your audience today.</p>
		<a href={login_url} class="btn btn-accent btn-lg">Create Free Account</a>
	</section>

	<section class="bg-base-200 rounded-box flex flex-col items-center gap-2 p-6">
		<label class="text-xl" for="price_range">
			For <span class="font-bold">{price_slider_val.toLocaleString()}</span>
			pageviews
		</label>
		<input
			id="price_range"
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
	</section>

	<footer class="bg-base-300 text-base-content flex justify-between rounded-t-lg p-5">
		<p>
			Built with 🤍 and <a class="link link-hover" href="https://gebna.gg/">🧀</a>
		</p>
		<div class="flex gap-3">
			<a
				href="mailto:gebnatorky@gmail.com"
				aria-label="Email"
				data-umami-event="Follow"
				data-umami-event-target="Email"
			>
				<MailIcon class={iconClass} />
			</a>
			<a
				href="https://github.com/BahaaZidan/kelma"
				target="_blank"
				rel="nofollow"
				aria-label="GitHub"
				data-umami-event="Follow"
				data-umami-event-target="GitHub"
			>
				<BrandIcon icon={siGithub} class={iconClass} />
			</a>
		</div>
	</footer>
</div>
