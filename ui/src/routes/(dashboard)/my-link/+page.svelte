<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { SvelteURL } from 'svelte/reactivity';
	import * as Alert from '$lib/components/ui/alert';
	import { page } from '$app/state';
	import LinkSetupAlert from '$lib/components/link-setup-alert.svelte';
	import LivetrackIframe from '$lib/components/livetrack-iframe.svelte';
	import { NarrowSection } from '$lib/components/ui/layout';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { pages } from '$lib/pages.svelte.js';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import HatGlassesIcon from '@lucide/svelte/icons/hat-glasses';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import LockKeyHoleIcon from '@lucide/svelte/icons/lock-keyhole';
	import LinkIcon from '@lucide/svelte/icons/link';
	import FollowersTable from './followers-table.svelte';
	import VisitsCharts from './visits-charts.svelte';
	import { getAthleteLink } from '$lib/link';
	import { InvitePeopleForm } from '$lib/components/forms/invitePeople';
	import { m } from '$lib/paraglide/messages.js';
	import Sidebar from '$lib/components/sidebars/sidebar.svelte';
	import BellRingIcon from '@lucide/svelte/icons/bell-ring';
	import { ActivityDisclosure, PrivacyMode, type DisclosureDecision } from '$lib/types/privacy';

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

	let updatingPrivacyMode = $state(false);
	let privacyMode = $state((user?.privacyMode as PrivacyMode) ?? PrivacyMode.PUBLIC);
	let disclosure = $state(link?.disclosure as ActivityDisclosure | undefined);
	let isActivityHidden = $derived(disclosure !== ActivityDisclosure.SHARED);

	const privacyModeLabels: Record<PrivacyMode, () => string> = {
		[PrivacyMode.PUBLIC]: m.ma_privacy_mode_public,
		[PrivacyMode.ON_DEMAND]: m.ma_privacy_mode_on_demand,
		[PrivacyMode.INCOGNITO]: m.ma_privacy_mode_incognito
	};
	const privacyModeDescriptions: Record<PrivacyMode, () => string> = {
		[PrivacyMode.PUBLIC]: m.ma_privacy_mode_public_description,
		[PrivacyMode.ON_DEMAND]: m.ma_privacy_mode_on_demand_description,
		[PrivacyMode.INCOGNITO]: m.ma_privacy_mode_incognito_description
	};

	async function updatePrivacyMode(mode: PrivacyMode) {
		updatingPrivacyMode = true;

		try {
			const res = await fetch('/api/user/privacy-mode', {
				method: 'PUT',
				body: JSON.stringify({ privacy_mode: mode })
			});
			if (res.ok && user) {
				privacyMode = mode;
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
			updatingPrivacyMode = false;
		}
	}

	let decidingDisclosure = $state(false);
	async function decideDisclosure(decision: DisclosureDecision) {
		decidingDisclosure = true;

		try {
			const res = await fetch(`/api/link/disclosure/${decision}`, { method: 'PUT' });
			const body = await res.json().catch(() => {
				throw m.unexpected_server_error({ code: res.status });
			});
			if (!res.ok) {
				throw body.message;
			}
			disclosure = body.disclosure;
			toast.success(
				disclosure === ActivityDisclosure.SHARED ? m.sa_shared_title() : m.sa_silent_title()
			);
		} catch (error) {
			toast.error(m.an_error_occurred(), {
				description: String(error),
				duration: 10000
			});
		} finally {
			decidingDisclosure = false;
		}
	}

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

<div class="flex min-h-[calc(100dvh-var(--header-height))] w-full flex-col md:flex-row">
	<Sidebar items={sidebarItems} {url} {active} />
	<Separator class="mx-0 hidden md:block" orientation="vertical" />
	<div class="flex w-full grow flex-col">
		{#key active}
			{#if active === '#preview'}
				{#if trackingLink?.link}
					{#if !isActivityHidden}
						<LivetrackIframe class="w-full flex-grow" link={trackingLink} />
					{:else}
						<NarrowSection class="h-full">
							<div class="grid place-items-center">
								<div class="text-center">
									<h2
										class="flex flex-col items-center gap-5 border-none px-2 py-8 leading-[1.2] font-bold md:flex-row"
									>
										<span>{m.livetrack_session_not_started()}</span>
									</h2>
									<div class="flex justify-center gap-4">
										<Button size="lg" variant="outline" href="/">{m.go_back_home()}</Button>
										<Button size="lg" href={`${pages().account.url}#following`}>
											{m.see_access_requests()}
										</Button>
									</div>
								</div>
							</div>
						</NarrowSection>
					{/if}
				{:else}
					<div
						class="mx-auto flex w-full max-w-2xl flex-col content-start gap-4 p-4 py-5 pb-9 text-justify"
					>
						<div class="p-2">
							<p class="mt-6 text-center text-xl text-muted-foreground">
								{m.no_livetrack_link_setup_yet()}
							</p>
							<div class="mt-6 flex justify-center gap-4">
								<Button size="lg" href={pages().setupLink.url}>{pages().setupLink.title}</Button>
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

								<Alert.Root
									variant={privacyMode === PrivacyMode.PUBLIC ? 'default' : 'warning'}
									class="mt-6"
								>
									<HatGlassesIcon class="mb-2" />
									<Alert.Title
										class="mb-2 line-clamp-none flex justify-between gap-2 tracking-normal"
									>
										<span>{m.ma_privacy_mode_title()}</span>
										<Select.Root
											disabled={updatingPrivacyMode}
											type="single"
											bind:value={
												() => privacyMode, async (v) => await updatePrivacyMode(v as PrivacyMode)
											}
										>
											<Select.Trigger
												class="cursor-pointer"
												aria-label={m.ma_privacy_mode_title()}
												variant="ghost"
											>
												{privacyModeLabels[privacyMode]()}
											</Select.Trigger>
											<Select.Content>
												{#each Object.values(PrivacyMode) as mode (mode)}
													<Select.Item value={mode}>{privacyModeLabels[mode]()}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</Alert.Title>
									<Alert.Description class="block">
										{@html privacyModeDescriptions[privacyMode]()}
									</Alert.Description>
								</Alert.Root>

								{#if disclosure === ActivityDisclosure.PENDING}
									<Alert.Root variant="warning" class="mt-4">
										<BellRingIcon class="mb-2" />
										<Alert.Title class="mb-2 line-clamp-none tracking-normal">
											{m.sa_pending_title()}
										</Alert.Title>
										<Alert.Description class="block">
											<p class="mb-4">{m.sa_pending_description()}</p>
											<div class="flex flex-col gap-2 sm:flex-row">
												<Button
													disabled={decidingDisclosure}
													onclick={() => decideDisclosure('share')}
												>
													<BellRingIcon />
													{m.sa_share_activity()}
												</Button>
												<Button
													variant="outline"
													disabled={decidingDisclosure}
													onclick={() => decideDisclosure('silent')}
												>
													<HatGlassesIcon />
													{m.sa_keep_silent()}
												</Button>
											</div>
										</Alert.Description>
									</Alert.Root>
								{/if}
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
								<Button size="lg" href={pages().setupLink.url}>{pages().setupLink.title}</Button>
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
