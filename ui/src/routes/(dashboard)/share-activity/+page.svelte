<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { NarrowSection } from '$lib/components/ui/layout';
	import BellRingIcon from '@lucide/svelte/icons/bell-ring';
	import HatGlassesIcon from '@lucide/svelte/icons/hat-glasses';
	import { getAthleteLink } from '$lib/link';
	import { pages } from '$lib/pages.svelte.js';
	import { m } from '$lib/paraglide/messages.js';
	import { ActivityDisclosure, type DisclosureDecision } from '$lib/types/privacy';

	let { data } = $props();
	let { user } = data;
	let disclosure = $state(data.disclosure);
	let deciding = $state(false);
	let athleteURL = $derived(user && getAthleteLink(user.name));

	async function decide(decision: DisclosureDecision) {
		deciding = true;

		try {
			const res = await fetch(`/api/link/disclosure/${decision}`, { method: 'PUT' });
			const body = await res.json().catch(() => {
				throw m.unexpected_server_error({ code: res.status });
			});
			if (!res.ok) {
				throw body.message;
			}
			disclosure = body.disclosure;
		} catch (error) {
			toast.error(m.an_error_occurred(), {
				description: String(error),
				duration: 10000
			});
		} finally {
			deciding = false;
		}
	}
</script>

<NarrowSection class="h-full">
	<div class="grid h-full place-items-center">
		<div class="max-w-lg text-center">
			{#if !data.hasActivity}
				<h2 class="px-2 py-8 text-xl font-bold">{m.sa_no_activity_title()}</h2>
				<Button size="lg" href={pages().myLink.url}>{pages().myLink.title}</Button>
			{:else if disclosure === ActivityDisclosure.PENDING}
				<h2 class="px-2 pt-8 pb-4 text-xl font-bold">{m.sa_pending_title()}</h2>
				<p class="mb-8 text-muted-foreground">{m.sa_pending_description()}</p>
				<div class="flex flex-col justify-center gap-4 sm:flex-row">
					<Button size="lg" disabled={deciding} onclick={() => decide('share')}>
						<BellRingIcon />
						{m.sa_share_activity()}
					</Button>
					<Button size="lg" variant="outline" disabled={deciding} onclick={() => decide('silent')}>
						<HatGlassesIcon />
						{m.sa_keep_silent()}
					</Button>
				</div>
			{:else if disclosure === ActivityDisclosure.SHARED}
				<h2 class="px-2 pt-8 pb-4 text-xl font-bold">{m.sa_shared_title()}</h2>
				<p class="mb-8 text-muted-foreground">{m.sa_shared_description()}</p>
				<Button size="lg" href={athleteURL?.href}>{m.sa_view_activity()}</Button>
			{:else}
				<h2 class="px-2 pt-8 pb-4 text-xl font-bold">{m.sa_silent_title()}</h2>
				<p class="mb-8 text-muted-foreground">{m.sa_silent_description()}</p>
				<Button size="lg" variant="outline" href={pages().myLink.url}>
					{pages().myLink.title}
				</Button>
			{/if}
		</div>
	</div>
</NarrowSection>
