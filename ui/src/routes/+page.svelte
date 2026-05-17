<script>
	import { Button } from '$lib/components/ui/button';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import Share2Icon from '@lucide/svelte/icons/share-2';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import { FullPage, NarrowSection } from '$lib/components/ui/layout';
	import { pages } from '$lib/pages.svelte';
	import { m } from '$lib/paraglide/messages.js';
</script>

<NarrowSection>
	<FullPage class="grid place-items-center">
		<div class="text-center">
			<h1 class="px-2 py-8 text-4xl font-bold md:text-6xl" style="line-height: 1.2;">
				<span class="title-highlight">
					<span class="text-primary">{m.home_page_one()}</span>
					{m.home_page_tracking_link()}
				</span>
				{m.home_page_share_notify_ride()}
				<span class="title-highlight"> {m.home_page_worry_free()} </span>
				🚴
			</h1>
			<div class="mt-6 text-sm md:mt-10 md:text-lg">
				{@html m.home_page_subtitle()}
			</div>
			<div class="mt-6 flex justify-center gap-4 md:mt-4">
				<Button href={pages().gettingStarted.url}>{pages().gettingStarted.title}</Button>
				<Button variant="outline" href="#how-it-works">{m.app_footer_how_it_works()}</Button>
			</div>
		</div>
	</FullPage>
	<div id="how-it-works" class="my-14 scroll-m-20 text-justify">
		<h1>{m.app_footer_how_it_works()}</h1>
		<ul>
			<li>
				<h3>
					<QrCodeIcon class="mr-4 inline size-6 align-middle" />
					{m.hiw_create_your_link_title()}
				</h3>
				<p>
					{m.hiw_create_your_link_text()}
				</p>
			</li>
			<li>
				<h3>
					<SmartphoneIcon class="mr-4 inline size-6 align-middle" />
					{m.hiw_set_in_device_app_title()}
				</h3>
				<p>
					{@html m.hiw_set_in_device_app_text()}
				</p>
			</li>
			<li>
				<h3>
					<MapPinIcon class="mr-4 inline size-6 align-middle" />
					{m.hiw_we_handle_the_link_title()}
				</h3>
				<p>{m.hiw_we_handle_the_link_text()}</p>
			</li>
			<li>
				<h3>
					<Share2Icon class="mr-4 inline size-6 align-middle" />
					{m.hiw_share_once_done_forever_title()}
				</h3>
				<p>
					{m.hiw_share_once_done_forever_text()}
				</p>
			</li>
		</ul>
		<div class="mt-12 flex justify-center gap-4">
			<Button size="lg" href={pages().gettingStarted.url}>{m.hiw_lets_get_started()}</Button>
		</div>
	</div>
</NarrowSection>
