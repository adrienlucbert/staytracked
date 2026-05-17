<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { SvelteURL } from 'svelte/reactivity';
	import { page } from '$app/state';
	import LinkSetupAlert from '$lib/components/link-setup-alert.svelte';
	import LivetrackIframe from '$lib/components/livetrack-iframe.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { pages } from '$lib/pages.svelte.js';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import LockKeyHoleIcon from '@lucide/svelte/icons/lock-keyhole';
	import LinkIcon from '@lucide/svelte/icons/link';
	import FollowersTable from './followers-table.svelte';
	import VisitsCharts from './visits-charts.svelte';
	import { getAthleteLink } from '$lib/link';
	import { InvitePeopleForm } from '$lib/components/forms/invitePeople';
	import { m } from '$lib/paraglide/messages.js';
	import Sidebar from '$lib/components/sidebars/sidebar.svelte';

	let { data } = $props();
	let { user, link, flags } = data;
	let trackingLink = $state(link);
	let linkURL = $derived(user && getAthleteLink(user.name));

	const sidebarItems = $derived([
		{
			anchor: '#manage-access',
			label: pages().manageAccess.title
		},
		{
			anchor: '#preview',
			label: m.ml_section_preview_title()
		}
	]);
	const url = new SvelteURL(page.url);
	let active = $derived(url.hash || '#manage-access');

	let updatingLinkVisibility = $state(false);
	async function updateLinkVisibility(isPublic: boolean) {
		updatingLinkVisibility = true;

		try {
			const res = await fetch('/api/link/visibility', {
				method: 'PUT',
				body: JSON.stringify({ is_public: isPublic })
			});
			if (res.ok && trackingLink) {
				trackingLink.isPublic = isPublic;
			} else {
				const { message } = await res.json().catch(() => {
					throw m.unexpected_server_error({ code: res.status });
				});
				throw message;
			}
		} catch (error) {
			toast.error(m.an_error_occurred(), {
				description: String(error),
				duration: 10000
			});
		} finally {
			updatingLinkVisibility = false;
		}
	}
</script>

<div class="flex h-full w-full flex-col md:flex-row">
	<Sidebar items={sidebarItems} {url} {active} />
	<Separator class="mx-0 hidden md:block" orientation="vertical" />
	<div class="flex w-full flex-col">
		{#key active}
			{#if active === '#preview'}
				{#if trackingLink?.link}
					<LivetrackIframe class="w-full flex-grow" link={trackingLink} />
				{:else}
					<div
						class="mx-auto flex w-full max-w-2xl flex-col content-start gap-4 p-4 py-5 pb-9 text-justify"
					>
						<div class="p-2">
							<p class="mt-6 text-center text-xl text-muted-foreground">
								{m.no_livetrack_link_setup_yet()}
							</p>
							<div class="mt-6 flex justify-center gap-4">
								<Button size="lg" href={pages().gettingStarted.url}
									>{pages().gettingStarted.title}</Button
								>
							</div>
							{#if trackingLink}
								<LinkSetupAlert
									link={trackingLink}
									onupdate={(v) => {
										if (v) {
											toast.success(m.link_setup_youre_all_set(), {
												description: m.link_setup_we_received_notice()
											});
											trackingLink = v;
										}
									}}
								/>
							{/if}
						</div>
					</div>
				{/if}
			{/if}

			{#if active === '#manage-access'}
				<div
					class="mx-auto flex w-full max-w-2xl flex-col content-start gap-4 p-4 py-5 pb-9 text-justify"
				>
					<div class="p-2">
						{#if trackingLink && trackingLink.link}
							<h3>{m.ma_general_access()}</h3>

							<div class="mt-6">
								<div class="mb-4 flex gap-2 align-middle">
									<div class="flex items-center">
										{#if trackingLink.isPublic}
											<GlobeIcon class="flex items-center align-middle" />
										{:else}
											<LockKeyHoleIcon class="flex items-center align-middle" />
										{/if}
									</div>
									<div class="flex flex-col">
										<span class="col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight">
											<Select.Root
												disabled={updatingLinkVisibility}
												type="single"
												bind:value={
													() => (trackingLink?.isPublic ? 'public' : 'private'),
													async (v) => await updateLinkVisibility(v === 'public')
												}
											>
												<Select.Trigger class="cursor-pointer" aria-label="Edit" variant="ghost">
													{trackingLink.isPublic ? m.ma_anyone_with_the_link() : m.ma_restricted()}
												</Select.Trigger>
												<Select.Content>
													<Select.Item value={'public'}>{m.ma_anyone_with_the_link()}</Select.Item>
													<Select.Item value={'private'}>{m.ma_restricted()}</Select.Item>
												</Select.Content>
											</Select.Root>
										</span>
										<span
											class="col-start-2 grid justify-items-start gap-1 pl-2 text-sm text-muted-foreground [&_p]:leading-relaxed"
										>
											{#if trackingLink.isPublic}
												{m.ma_anyone_with_the_link_description()}
											{:else}
												{m.ma_restricted_description()}
											{/if}
										</span>
									</div>
								</div>

								<div class="flex items-center gap-2">
									<Label for="link" class="sr-only">Link</Label>
									<Input id="link" value={linkURL?.href} readonly class="h-8" />
									<Button
										class="shadow-none"
										onclick={() => {
											navigator.clipboard.writeText(linkURL?.href || '');
											toast.success(m.link_copied(), { duration: 3000 });
										}}
									>
										<LinkIcon />
										{m.copy_link()}
									</Button>
								</div>
							</div>

							<h3>{m.ma_people_with_access_title()}</h3>

							<div class="mt-6 mb-4 flex flex-col gap-4 md:flex-row">
								<p class="grow text-sm text-muted-foreground">
									{@html m.ma_people_with_access_text()}
								</p>
								<InvitePeopleForm action="?/invitePeople" />
							</div>
							<div class="mt-2">
								<FollowersTable showLastSeen={flags.ENABLE_VISITS_STATISTICS} />
							</div>

							{#if flags.ENABLE_VISITS_STATISTICS}
								<h3>{m.ma_visits_history()}</h3>
								<div class="mt-6">
									<VisitsCharts />
								</div>
							{/if}
						{:else}
							<p class="mt-6 text-center text-xl text-muted-foreground">
								{m.no_livetrack_link_setup_yet()}
							</p>
							<div class="mt-6 flex justify-center gap-4">
								<Button size="lg" href={pages().gettingStarted.url}
									>{pages().gettingStarted.title}</Button
								>
							</div>
							{#if trackingLink}
								<LinkSetupAlert
									link={trackingLink}
									onupdate={(v) => {
										if (v) {
											toast.success(m.link_setup_youre_all_set(), {
												description: m.link_setup_we_received_notice()
											});
											trackingLink = v;
										}
									}}
								/>
							{/if}
						{/if}
					</div>
				</div>
			{/if}
		{/key}
	</div>
</div>
