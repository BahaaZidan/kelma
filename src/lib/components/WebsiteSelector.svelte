<script lang="ts">
	import { route } from '$lib/__generated__/routes';

	type Props = {
		websites: {
			id: number;
			ownerId: string;
			name: string;
			domains: string[];
		}[];
	};

	let { websites }: Props = $props();
</script>

<div>
	<h2 class="text-lg font-bold">Websites you own</h2>
	<p class="text-secondary text-sm">Your subscription applies to all of them.</p>
</div>
<ul class="menu bg-base-200 rounded-box w-full">
	{#each websites as website (website.id)}
		<li>
			<a
				class="flex flex-col items-start"
				href={route('/console/[website_id]', { website_id: website.id })}
			>
				<div class="text-lg font-bold">{website.name}</div>
				<div class="text-secondary">
					ID: <div class="badge badge-neutral">{website.id}</div>
				</div>
			</a>
		</li>
	{/each}
</ul>
