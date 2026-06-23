<script lang="ts">
	import LivetrackIframe from '$lib/components/livetrack-iframe.svelte';
	import { Button } from '$lib/components/ui/button';
	import { FullPage, NarrowSection } from '$lib/components/ui/layout';
	import { pages } from '$lib/pages.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let { data } = $props();
</script>

{#if data?.trackingLink?.link}
	<LivetrackIframe class="w-full flex-grow" link={data.trackingLink} />
{:else}
	<NarrowSection>
		<FullPage class="grid place-items-center">
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
		</FullPage>
	</NarrowSection>
{/if}
