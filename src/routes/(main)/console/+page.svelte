<script lang="ts">
	import BanknoteArrowUpIcon from '@lucide/svelte/icons/banknote-arrow-up';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import themeObject from 'daisyui/theme/object';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	import { env } from '$env/dynamic/public';
	import { graphql } from '$houdini';

	import Avatar from '$lib/client/components/Avatar.svelte';
	import TextArrayInput from '$lib/client/components/TextArrayInput.svelte';
	import TextInput from '$lib/client/components/TextInput.svelte';
	import { LANGS } from '$lib/i18n';
	import { type Locale } from '$lib/paraglide/runtime';

	import type { PageProps } from './$houdini';
	import BaseInfoForm from './BaseInfoForm.svelte';
	import { baseInfoSchema } from './schemas';

	let { data }: PageProps = $props();

	let query = data.ConsoleQuery;
	let viewer = $derived($query.data?.viewer);

	let selectedWebsiteId = $derived(viewer?.websites[0]?.id);

	let createWebsiteDialog: HTMLDialogElement;
	const superform = superForm(defaults(valibot(baseInfoSchema)), {
		SPA: true,
		validators: valibot(baseInfoSchema),
		async onUpdate({ form }) {
			if (form.valid) {
				const result = await CreateWebsite.mutate({
					input: { name: form.data.name, domains: form.data.domains },
				});
				selectedWebsiteId = result.data?.createWebsite.id;
				createWebsiteDialog.close();
			}
		},
	});
	let { enhance } = superform;

	const CreateWebsite = graphql(`
		mutation CreateWebsite($input: CreateWebsiteInput!) {
			createWebsite(input: $input) {
				id
				...Console_Website_List_insert @append
			}
		}
	`);

	const topupSuperform = superForm(data.form);
	let topupDialog: HTMLDialogElement;

	const UpdateUserWebsiteBan = graphql(`
		mutation UpdateUserWebsiteBanInConsole($input: UpdateUserWebsiteBanInput!, $websiteId: ID!) {
			updateUserWebsiteBan(input: $input) {
				id
				...Console_Website_List_Banned_Users_remove @parentID(value: $websiteId)
			}
		}
	`);

	const supportedThemes = Object.keys(themeObject);

	let embed_config: {
		page_id?: string;
		container: string;
		theme: string;
		language: Locale;
	} = $state({
		page_id: 'page-slug-or-uuid',
		container: 'kelma-container',
		language: 'en',
		theme: 'business',
	});
</script>

<svelte:head>
	<title>Kelma | Console</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex flex-col gap-4 p-4">
	{#if viewer}
		<section class="bg-base-200 flex justify-between rounded-2xl p-6">
			<div class="stat">
				<div class="stat-figure text-secondary">
					<EyeIcon />
				</div>
				<div class="stat-title">Page views left</div>
				<div class="stat-value">{viewer.pageViewsLeft}</div>
				<div class="stat-desc">Embed loads left across all your websites.</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-secondary">
					<DollarSignIcon />
				</div>
				<div class="stat-title">Balance</div>
				<div class="stat-value">{viewer.balance}</div>
				<div class="stat-desc">
					<button class="btn btn-primary btn-sm" onclick={() => topupDialog.showModal()}>
						<BanknoteArrowUpIcon /> Top up
					</button>
				</div>
			</div>
		</section>
		{#if !viewer.websites.length}
			<div role="alert" class="alert alert-info">
				<CircleAlertIcon />
				<span>
					<button
						class="btn btn-link p-0 align-baseline"
						onclick={() => createWebsiteDialog.showModal()}
					>
						Create a website
					</button>
					to get started.
				</span>
			</div>
		{:else}
			<section class="bg-base-200 flex flex-col gap-4 rounded-2xl p-6">
				<h2>Select a website and copy this code block to get started</h2>
				<div class="flex gap-4">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Website</legend>
						<select class="select" bind:value={selectedWebsiteId}>
							<option disabled selected>Website ID</option>
							{#each viewer.websites as website (website.id)}
								<option value={website.id}>{website.name}</option>
							{/each}
						</select>
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Page ID</legend>
						<input type="text" class="input" bind:value={embed_config.page_id} />
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Container ID</legend>
						<input type="text" class="input" bind:value={embed_config.container} />
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Language</legend>
						<select class="select" bind:value={embed_config.language}>
							<option disabled selected>Language</option>
							{#each Object.values(LANGS) as locale (locale)}
								<option value={locale.code}>{locale.native_label}</option>
							{/each}
						</select>
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Theme</legend>
						<select class="select" bind:value={embed_config.theme}>
							<option disabled selected>Theme</option>
							{#each supportedThemes as theme (theme)}
								<option>{theme}</option>
							{/each}
						</select>
					</fieldset>
				</div>
				<div class="mockup-code w-full">
					<pre
						data-prefix="1"><code>&lt;script src="{env.PUBLIC_BASE_URL}/scripts/comments-embed.js"&gt;&lt;/script&gt;</code></pre>
					<pre data-prefix="2"><code>&lt;script defer&gt;</code></pre>
					<pre data-prefix="3"><code>{`	if (window.embedCommentIframe) {`}</code></pre>
					<pre data-prefix="4"><code>{`		window.embedCommentIframe({`}</code></pre>
					<pre data-prefix="5"><code>			container: "{embed_config.container}",</code></pre>
					<pre data-prefix="6"><code>			website_id: "{selectedWebsiteId}",</code></pre>
					<pre data-prefix="7"><code>			page_id: "{embed_config.page_id}",</code></pre>
					<pre data-prefix="8"><code>			language: "{embed_config.language}",</code></pre>
					<pre data-prefix="9"><code>			theme: "{embed_config.theme}",</code></pre>
					<pre data-prefix="10"><code>		&#125;&#41;&#59;</code></pre>
					<pre data-prefix="11"><code>	&#125;</code></pre>
					<pre data-prefix="12"><code>&lt;/script&gt;</code></pre>
				</div>
			</section>
			<section class="bg-base-200 rounded-2xl p-6">
				<h2 class="mb-4">Website settings</h2>
				<div class="tabs tabs-lift">
					{#each viewer.websites as website (website.id)}
						<input
							type="radio"
							name={website.id}
							class="tab"
							aria-label={website.name}
							checked={website.id === selectedWebsiteId}
							onclick={() => (selectedWebsiteId = website.id)}
						/>
						<div class="tab-content p-6">
							<BaseInfoForm data={website} />
							{#if website.bannedUsers.length}
								<div class="divider">Banned Users</div>
								<div class="rounded-box border-base-content/5 bg-base-100 overflow-x-auto border">
									<table class="table">
										<thead>
											<tr>
												<th></th>
												<th>Name</th>
												<th>Email</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											{#each website.bannedUsers as bannedUser (bannedUser.id)}
												<tr class="hover:bg-base-300">
													<td>
														<Avatar
															src={bannedUser.image}
															alt={bannedUser.name}
															fallback={bannedUser.name}
															class="size-10"
														/>
													</td>
													<td>{bannedUser.name}</td>
													<td>{bannedUser.email}</td>
													<td>
														<button
															class="btn btn-sm btn-primary"
															disabled={$UpdateUserWebsiteBan.fetching}
															onclick={() => {
																UpdateUserWebsiteBan.mutate({
																	websiteId: website.id,
																	input: {
																		banned: false,
																		userId: bannedUser.id,
																		websiteId: website.id,
																	},
																});
															}}
														>
															Unban
															{#if $UpdateUserWebsiteBan.fetching}
																<span class="loading loading-spinner loading-sm"></span>
															{/if}
														</button>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}
						</div>
					{/each}
					<button class="tab" onclick={() => createWebsiteDialog.showModal()}><PlusIcon /></button>
				</div>
			</section>
		{/if}
	{/if}
</div>

<dialog bind:this={createWebsiteDialog} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Create Website</h3>

		<form method="post" use:enhance class="flex flex-col gap-1" id="create_website_form">
			<TextInput {superform} field="name" label="Name" disabled={$CreateWebsite.fetching} />
			<TextArrayInput
				{superform}
				field="domains"
				label="Domains"
				disabled={$CreateWebsite.fetching}
			/>
		</form>

		<div class="modal-action">
			<form method="dialog">
				<button class="btn" disabled={$CreateWebsite.fetching}>Close</button>
			</form>
			<button
				class="btn btn-primary"
				type="submit"
				form="create_website_form"
				disabled={$CreateWebsite.fetching}
			>
				Submit
				{#if $CreateWebsite.fetching}
					<span class="loading loading-spinner loading-sm"></span>
				{/if}
			</button>
		</div>
	</div>
</dialog>

<dialog bind:this={topupDialog} class="modal">
	<div class="modal-box">
		<h3 class="mb-4 text-lg font-bold">Topup</h3>

		<form method="post" use:topupSuperform.enhance class="flex flex-col gap-1" id="topup_form">
			<TextInput superform={topupSuperform} field="amount" type="number" label="Amount">
				{#snippet prepend()}
					<DollarSignIcon size={14} />
				{/snippet}
			</TextInput>
		</form>

		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Close</button>
			</form>
			<button class="btn btn-primary" type="submit" form="topup_form">Submit</button>
		</div>
	</div>
</dialog>
