<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { SvelteURL } from 'svelte/reactivity';
	import { page } from '$app/state';
	import Youtube from 'svelte-youtube-embed';
	import { generateVCard } from '$lib/vcard';
	import { QRCode } from '$lib/components/ui/qrcode';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Alert from '$lib/components/ui/alert';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import SquareCheckBigIcon from '@lucide/svelte/icons/square-check-big';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import Share2Icon from '@lucide/svelte/icons/share-2';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import LockIcon from '@lucide/svelte/icons/lock';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import LinkIcon from '@lucide/svelte/icons/link';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { env } from '$env/dynamic/public';
	import LinkSetupAlert from '$lib/components/link-setup-alert.svelte';
	import Sidebar from '$lib/components/sidebars/sidebar.svelte';
	import { getAthleteLink } from '$lib/link.js';
	import { pages } from '$lib/pages.svelte';
	import { toast } from 'svelte-sonner';
	import { m } from '$lib/paraglide/messages.js';

	let { data } = $props();
	let { user, link } = data;

	const sidebarItems = $derived([
		{
			anchor: '#setup-tracking',
			label: m.gs_section_setup_tracking_title()
		},
		{
			anchor: '#share-tracking',
			label: m.gs_section_share_tracking_title()
		},
		{
			anchor: '#follow-someone',
			label: m.gs_section_follow_someone_title()
		}
	]);
	const url = new SvelteURL(page.url);
	let active = $derived(url.hash || '#follow-someone');

	let linkURL = $derived(user && getAthleteLink(user.name));
	let email = $derived(link && `persistent-livetrack-${link.uuid}@${env.PUBLIC_SMTP_PROXY_HOSTNAME}`);

	let vcard = $derived(
		link &&
			generateVCard({
				firstName: data.appName,
				lastName: 'Webhook',
				uid: link.uuid,
				email: email ?? undefined,
				...(linkURL ? { url: linkURL.href } : {})
			})
	);
	const vcardBlobUrl = $derived(
		vcard && URL.createObjectURL(new Blob([vcard], { type: 'text/vcard' }))
	);
</script>

<div class="flex h-full w-full flex-col md:flex-row">
	<Sidebar items={sidebarItems} {active} {url} />
	<Separator class="mx-0 hidden md:block" orientation="vertical" />
	<div class="flex w-full flex-col">
		{#key active}
			<div
				class="mx-auto flex w-full max-w-2xl flex-col content-start gap-4 p-4 py-5 pb-9 text-justify"
			>
				{#if active === '#setup-tracking'}
					<h3 class="mt-0">{m.gs_section_setup_tracking_title()}</h3>
					<p class="text-sm text-muted-foreground">{m.gs_follow_those_steps()}</p>

					<ul class="mt-2 flex flex-col gap-8 [&_h4]:mt-0">
						<li>
							<h4>
								<QrCodeIcon class="mr-2 inline size-4 align-middle" />
								{m.gs_create_a_tracking_recipient_title()}
							</h4>
							<p>{m.gs_create_a_tracking_recipient_text()}</p>
							<div class="mt-4 flex flex-col items-center gap-2">
								{#if vcard}
									<QRCode data={vcard} class="max-w-60" />
									<Button href={vcardBlobUrl} download="contact.vcf" variant="link">
										{m.gs_download_vcard()}
									</Button>
								{/if}
							</div>
							<p class="mt-2">{m.gs_scan_or_download_contact()}</p>
						</li>

						<li>
							<h4>
								<SettingsIcon class="mr-2 inline size-4 align-middle" />
								{m.gs_set_it_in_your_app_title()}
							</h4>
							<p>{m.gs_set_it_in_your_app_text()}</p>

							<Tabs.Root class="mt-4">
								<Tabs.List class="min-h-12 w-full rounded-b-none">
									<Tabs.Trigger value="garmin" class="rounded-r-none rounded-b-none">
										<svg
											class="mr-2 inline size-4"
											viewBox="0 0 48 48"
											xmlns="http://www.w3.org/2000/svg"
											fill="currentColor"
										>
											<path
												d="M45,15.38a22.15,22.15,0,0,0-8.4-10A22.29,22.29,0,0,0,9.8,7.78,21.74,21.74,0,0,0,3,20.88h7.4A14.72,14.72,0,0,1,20.7,9.78c7.1-1.9,12.6.7,16.1,5.6Z"
											/>
											<path
												d="M45,32.58a22,22,0,0,1-39.4,2.2A19.48,19.48,0,0,1,3,27h7.4a14.66,14.66,0,0,0,26.3,5.5Z"
											/>
										</svg>
										Garmin
									</Tabs.Trigger>
									<Tabs.Trigger value="coros" class="rounded-l-none rounded-b-none">
										<svg
											class="mr-2 inline size-4"
											viewBox="0 0 48 48"
											xmlns="http://www.w3.org/2000/svg"
											fill="currentColor"
										>
											<path
												d="M35.9145,34.5254c-0.0043,0.1208,-0.2265,0.261,-0.3731,0.3473,-3.988,2.2992,-7.9782,4.5963,-11.9684,6.8912,-0.9922,0.5716,-1.9886,1.1302,-2.9657,1.719,-0.302,0.1833,-0.5198,0.1769,-0.8261,0,-5.3318,-3.0822,-10.6721,-6.1514,-16.0104,-9.2227v-18.1327c0.8304,-0.5069,1.6565,-1.0159,2.5451,-1.5573,0.1273,1.0935,0.248,2.1202,0.3667,3.1447,0.2653,2.2863,0.5284,4.5725,0.7937,6.8567,0.1876,1.6349,0.371,3.2698,0.5824,4.9004,0.0367,0.1984,0.151,0.371,0.3192,0.481,4.4194,2.5602,8.8496,5.101,13.269,7.659,0.2524,0.1424,0.44,0.0992,0.6751,0,4.372,-1.8592,8.7461,-3.7163,13.1223,-5.569,0.1359,-0.0561,0.2739,-0.1035,0.4875,-0.1876,0,0.9404,0.0151,1.8053,-0.0173,2.6702Z"
											/>
											<path
												d="M42.0443,12.5772l-2.3596,-1.0224c-3.7465,-1.622,-7.4886,-3.2482,-11.2308,-4.8767,-0.2653,-0.1143,-0.4702,-0.0949,-0.7204,0.0518,-4.3612,2.5365,-8.7267,5.0665,-13.0965,7.5857,-0.2933,0.1725,-0.4184,0.3667,-0.4573,0.7118,-0.2739,2.3618,-0.5824,4.7171,-0.8714,7.0745,-0.2869,2.3445,-0.5737,4.6869,-0.8584,7.0314,-0.0173,0.1488,-0.0475,0.2955,-0.0798,0.5133,-0.7829,-0.4508,-1.5292,-0.8563,-2.241,-1.3114,-0.1251,-0.0798,-0.1596,-0.3753,-0.1596,-0.5716,-0.0086,-3.3129,-0.0108,-6.6237,-0.0043,-9.9345,0.0043,-2.4588,0.028,-4.9133,0.0259,-7.37,0,-0.3257,0.1294,-0.481,0.3925,-0.632,5.1592,-2.9829,10.3163,-5.9702,15.4712,-8.9618,0.1531,-0.0884,0.2933,-0.2049,0.44,-0.3063h0.0927c1.2078,0.7096,2.4114,1.4257,3.6235,2.1288,3.8931,2.2539,7.7884,4.4971,11.6772,6.7531,0.1402,0.082,0.3343,0.2416,0.3386,0.3688,0.0302,0.9102,0.0173,1.8182,0.0173,2.7673Z"
											/>
											<path
												d="M44.2313,36.7945c0,0.2588,-0.0798,0.4055,-0.3084,0.5371,-5.0061,2.8794,-10.0078,5.7674,-15.0074,8.6619,-0.289,0.1682,-0.509,0.1725,-0.7937,0.0108,-0.7096,-0.4055,-1.4343,-0.7808,-2.2129,-1.2014l1.7686,-1.3178c3.3798,-2.5084,6.7574,-5.0169,10.1459,-7.5188,0.2869,-0.2092,0.399,-0.4314,0.399,-0.7916,-0.0151,-4.9888,-0.0194,-9.9798,-0.0151,-14.9708,0,-0.371,-0.1035,-0.6104,-0.4076,-0.839,-3.822,-2.8622,-7.6288,-5.7416,-11.4378,-8.6188,-0.0971,-0.0712,-0.1855,-0.151,-0.3063,-0.2524,0.7722,-0.4465,1.499,-0.8886,2.2539,-1.2855,0.1229,-0.0669,0.3731,0.0151,0.522,0.1014,3.9988,2.31,7.9955,4.6243,11.99,6.9408,1.0288,0.5953,2.0533,1.1971,3.0886,1.7837,0.2265,0.1273,0.3149,0.2718,0.3149,0.5371h-0.0022c-0.0043,6.0759,-0.0022,12.1496,0.0086,18.2233Z"
											/>
										</svg>
										Coros
									</Tabs.Trigger>
								</Tabs.List>

								<Tabs.Content value="garmin">
									<p class="mt-4">{@html m.gs_set_it_in_garmin_connect_text()}</p>
									<p>{m.gs_heres_a_video()}</p>
									<div class="mt-2">
										<Youtube id="DzfFG0gdhF4" animations={false} />
									</div>
									<Alert.Root class="mt-6">
										<CircleAlertIcon />
										<Alert.Title class="line-clamp-none tracking-normal">
											{m.gs_turn_on_auto_start_title()}
										</Alert.Title>
										<Alert.Description>
											{@html m.gs_turn_on_auto_start_text()}
										</Alert.Description>
									</Alert.Root>
								</Tabs.Content>

								<Tabs.Content value="coros">
									<p class="mt-4">{@html m.gs_set_it_in_coros_app_text()}</p>
									<Alert.Root class="mt-6">
										<CircleAlertIcon />
										<Alert.Title class="line-clamp-none tracking-normal">
											{m.gs_email_field_empty_title()}
										</Alert.Title>
										<Alert.Description>
											{m.gs_email_field_empty_text()}
											<div class="my-4 flex w-full items-center gap-2">
												<Label for="email-address" class="sr-only">Email address</Label>
												<Input id="email-address" value={email} readonly class="h-8" />
												<Button
													variant="card-outline"
													class="shadow-none"
													onclick={() => {
														navigator.clipboard.writeText(email ?? '');
														toast.success(m.email_copied(), { duration: 3000 });
													}}
												>
													{m.copy_email()}
												</Button>
											</div>
										</Alert.Description>
									</Alert.Root>
									<p class="mt-4">{@html m.gs_enable_safety_alerts()}</p>
								</Tabs.Content>
							</Tabs.Root>
						</li>

						<li>
							<h4>
								<SquareCheckBigIcon class="mr-2 inline size-4 align-middle" />
								{m.gs_try_it_out_title()}
							</h4>
							{#if link}
								<LinkSetupAlert {link} />
							{/if}
						</li>

						<li>
							<h4>
								<Share2Icon class="mr-2 inline size-4 align-middle" />
								{m.hiw_share_once_done_forever_title()}
							</h4>
							<p>{m.hiw_share_once_done_forever_text()}</p>
							<div class="my-4 flex items-center gap-2">
								<Label for="persistent-link" class="sr-only">Link</Label>
								<Input id="persistent-link" value={linkURL?.href} readonly class="h-8" />
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
							<div class="flex justify-start gap-4">
								<Button
									variant="outline"
									onclick={() => {
										url.hash = '#share-tracking';
										window.location.hash = '#share-tracking';
									}}
								>
									{m.gs_section_share_tracking_title()}
								</Button>
							</div>
						</li>
					</ul>
				{/if}

				{#if active === '#share-tracking'}
					<h3 class="mt-0">{m.gs_section_share_tracking_title()}</h3>
					<p class="text-sm text-muted-foreground">{m.gs_share_tracking_intro()}</p>

					<ul class="mt-2 flex flex-col gap-6 [&_h4]:mt-0">
						<li>
							<h4>
								<GlobeIcon class="mr-2 inline size-4 align-middle" />
								{m.gs_invite_public_link_title()}
							</h4>
							<p>{@html m.gs_invite_public_link_text()}</p>
							{#if linkURL}
								<div class="mt-3 flex items-center gap-2">
									<Label for="share-link" class="sr-only">Link</Label>
									<Input id="share-link" value={linkURL.href} readonly class="h-8" />
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
							{/if}
						</li>
						<li>
							<h4>
								<LockIcon class="mr-2 inline size-4 align-middle" />
								{m.gs_invite_private_link_title()}
							</h4>
							<p>{@html m.gs_invite_private_link_text()}</p>
						</li>
					</ul>

					<div class="mt-4 flex gap-4">
						<Button variant="outline" href={pages().manageAccess.url}>
							{pages().manageAccess.title}
						</Button>
					</div>
				{/if}

				{#if active === '#follow-someone'}
					<h3 class="mt-0">{m.gs_section_follow_someone_title()}</h3>
					<p class="text-sm text-muted-foreground">{m.gs_follow_someone_intro()}</p>

					<ul class="mt-2 flex flex-col gap-6 [&_h4]:mt-0">
						<li>
							<h4>
								<LinkIcon class="mr-2 inline size-4 align-middle" />
								{m.gs_follow_someone_via_link_title()}
							</h4>
							<p>{@html m.gs_follow_someone_via_link_text()}</p>
						</li>
						<li>
							<h4>
								<UserPlusIcon class="mr-2 inline size-4 align-middle" />
								{m.gs_follow_someone_via_invite_title()}
							</h4>
							<p>{m.gs_follow_someone_via_invite_text()}</p>
						</li>
					</ul>
				{/if}
			</div>
		{/key}
	</div>
</div>
