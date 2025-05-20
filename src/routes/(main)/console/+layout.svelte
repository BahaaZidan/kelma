<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<div class="flex gap-4 p-6">
	<div class="flex flex-col gap-4">
		<ul class="menu bg-base-200 rounded-box w-56">
			<li><a>Home</a></li>
			<li><a>Billing</a></li>
		</ul>
		{#if data.websites.length > 0}
			<ul class="menu bg-base-200 rounded-box w-56">
				<li><a>{data.websites[0].name}</a></li>
				<li><a>Overview</a></li>
				<li><a>Comments</a></li>
				<li><a>Pages</a></li>
				<li><a>Users</a></li>
				<li><a>Newsletter</a></li>
				<div class="divider"></div>
				<li><a>Tools</a></li>
				<li><a>Settings</a></li>
				<div class="divider"></div>
				<li><a>Install</a></li>
			</ul>
		{/if}
	</div>
	<div class="grow">
		{@render children()}
	</div>
</div>
