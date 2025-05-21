<script lang="ts">
	import { formatDistance } from 'date-fns';

	type Props = {
		author?: {
			image?: string | null;
			name: string;
		} | null;
		createdAt: Date;
		content: string;
	};

	let { author, createdAt, content }: Props = $props();
</script>

{#if author}
	<div class="flex items-start gap-4">
		<img src={author.image} alt="{author.name} profile picture" class="mt-1 size-10 rounded-full" />
		<div class="flex flex-col">
			<span>
				<b>{author.name}</b>
				<span class="text-secondary text-sm">
					{formatDistance(createdAt, new Date(), { addSuffix: true })}
				</span>
			</span>
			<span class="whitespace-pre-wrap">{content}</span>
		</div>
	</div>
{/if}
