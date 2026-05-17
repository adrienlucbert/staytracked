<script lang="ts">
	import { setLocale, getLocale, type Locale } from '$lib/paraglide/runtime';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import LanguagesIcon from '@lucide/svelte/icons/languages';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { page } from '$app/state';
	import { pages } from '$lib/pages.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import type { Snippet } from 'svelte';

	let { data, actions }: { data: any; actions: (() => ReturnType<Snippet>)[] } = $props();

	let locale: Locale = $state(getLocale());
	$effect(() => {
		setLocale(locale);

		if (data.session) {
			fetch('/api/user/locale', {
				method: 'PUT',
				body: JSON.stringify({ locale })
			}).catch(console.error);
		}
	});
</script>

<div
	class="sticky top-0 z-50 flex h-[var(--header-height)] w-full shrink-0 items-center gap-2 border-b bg-white px-2 dark:bg-neutral-800"
>
	{#if page.data.hideSidebar !== true}
		<Sidebar.Trigger class="h-10 w-10"></Sidebar.Trigger>
		<Separator orientation="vertical" />
	{/if}
	<div class="flex w-full justify-center">
		<div class="container flex items-center">
			<div class="flex-1">
				<a class="px-4 text-xl font-semibold" href={pages().home.url}>
					{data.appName}
				</a>
			</div>
			<div class="flex-none">
				<ul class="inline-flex flex-row flex-wrap space-x-1 p-2 text-lg font-bold">
					{#if data.session}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button variant="ghost" size="icon">
									<CircleUserRound />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<a href={pages().account.url}>
									<DropdownMenu.Item>{pages().account.title}</DropdownMenu.Item>
								</a>
								<a href={pages().myLink.url}>
									<DropdownMenu.Item>{pages().myLink.title}</DropdownMenu.Item>
								</a>
								<a href="/auth/signout">
									<DropdownMenu.Item>{m.app_header_sign_out()}</DropdownMenu.Item>
								</a>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{:else}
						<Button variant="ghost" size="icon" href="/auth">
							<CircleUserRound />
						</Button>
					{/if}

					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="ghost" size="icon">
									<LanguagesIcon />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.RadioGroup bind:value={locale}>
								<DropdownMenu.RadioItem value="fr">
									<span>🇫🇷</span>
									Français
								</DropdownMenu.RadioItem>
								<DropdownMenu.RadioItem value="en">
									<span>🇬🇧</span>
									English
								</DropdownMenu.RadioItem>
							</DropdownMenu.RadioGroup>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<Button onclick={toggleMode} variant="ghost" size="icon">
						<SunIcon class="scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90" />
						<MoonIcon
							class="absolute scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
						/>
						<span class="sr-only">{m.app_header_toggle_theme()}</span>
					</Button>

					{#each actions as action}
						{@render action()}
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>
