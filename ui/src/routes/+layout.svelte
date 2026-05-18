<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/sidebars/app-sidebar.svelte';
	import AppHeader from '$lib/components/app-header.svelte';
	import AppFooter from '$lib/components/app-footer.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import { navigating } from '$app/state';
	import { expoOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { FullPage, GrowContainer } from '$lib/components/ui/layout';
	import { onMount, setContext, type Snippet } from 'svelte';
	import { type HeaderContext } from '$lib/types/contexts/header.js';
	import { ensureNotificationSubscription } from '$lib/webpush.svelte';

	let { data, children } = $props();

	let headerActions = $state<{ [name: string]: () => ReturnType<Snippet> }>({});

	setContext<HeaderContext>('header', {
		addAction: (name: string, action: () => ReturnType<Snippet>) => {
			headerActions[name] = action;
		},
		deleteAction: (name: string) => {
			delete headerActions[name];
		}
	});

	onMount(() => {
		ensureNotificationSubscription(data.vapidPublicKey);
	});
</script>

<svelte:head>
	<title>{page.data.seo ? page.data.seo.title : data.appName}</title>
	<meta name="description" content={page.data.seo?.description || 'StayTracked'} />
</svelte:head>

<Toaster />
<ModeWatcher />

<Sidebar.Provider>
	{#if page.data.hideSidebar !== true}
		<AppSidebar />
	{/if}

	<FullPage class="flex flex-col">
		<AppHeader {data} actions={Object.values(headerActions)} />

		<GrowContainer class="px-4 md:px-0">
			{@render children?.()}
		</GrowContainer>

		{#if page.data.hideFooter !== true}
			<AppFooter />
		{/if}
	</FullPage>
</Sidebar.Provider>

{#if navigating?.to}
	<!--
		Loading animation for next page since svelte doesn't show any indicator.
		 - delay 100ms because most page loads are instant, and we don't want to flash
		 - long 12s duration because we don't actually know how long it will take
		 - exponential easing so fast loads (>100ms and <1s) still see enough progress,
			 while slow networks see it moving for a full 12 seconds
	-->
	<div
		class="fixed top-0 right-0 left-0 z-50 h-1 w-full bg-primary"
		in:slide={{ delay: 100, duration: 12000, axis: 'x', easing: expoOut }}
	></div>
{/if}
