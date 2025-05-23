<script lang="ts">
	import { EllipsisVerticalIcon, MessageCircleIcon, Trash2Icon } from '@lucide/svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<input class="input" placeholder="Search" />
<div class="divider"></div>
<div class="overflow-x-auto">
	<table class="table">
		<thead>
			<tr>
				<th></th>
				<th>Id</th>
				<th>Name</th>
				<th>Link</th>
				<th>Comments</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each data.pages as page, index (page.id)}
				<tr class="hover:bg-base-300">
					<td>
						<details class={['dropdown', { 'dropdown-right': index === data.pages.length - 1 }]}>
							<summary class="btn btn-sm btn-circle btn-ghost">
								<EllipsisVerticalIcon size={16} />
							</summary>
							<ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
								<li><button><Trash2Icon size={18} /> Delete</button></li>
							</ul>
						</details>
					</td>
					<td>{page.slug}</td>
					<td>{page.name}</td>
					<td><a href={page.url} class="link">{page.url}</a></td>
					<td>
						<button class="btn" disabled={!page.commentsCount}>
							<MessageCircleIcon />
							{page.commentsCount}
						</button>
					</td>
					<td>
						<label class="label mb-2 w-full justify-between">
							Closed
							<input type="checkbox" checked={true} class="toggle" />
						</label>
						<label class="label w-full justify-between">
							Pre-moderation
							<input type="checkbox" checked={false} class="toggle" />
						</label>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
