<script lang="ts">
	import type { SvelteURL } from 'svelte/reactivity';
	import * as Select from '$lib/components/ui/select/index.js';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { Button } from '$lib/components/ui/button';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	export type SidebarItem = {
		anchor: string;
		label: string;
	};

	let {
		items,
		active,
		url
	}: {
		items: SidebarItem[];
		active: string;
		url: SvelteURL;
	} = $props();

	const isMobile = new IsMobile();
</script>

<div class="flex max-h-max w-full flex-col md:max-w-[15rem] lg:max-w-xs">
	{#if isMobile.current}
		<div class="flex w-full flex-col gap-2 p-2">
			<Select.Root
				type="single"
				bind:value={active}
				onValueChange={(v) => {
					url.hash = `${v}`;
					window.location.hash = `${v}`;
				}}
			>
				<div class="flex w-full items-center p-4">
					<Select.Trigger class="w-full font-semibold">
						{items.find((i) => active === i.anchor)?.label}
					</Select.Trigger>
					<Select.Content>
						{#each items as item (item.anchor)}
							<Select.Item value={item.anchor}>{item.label}</Select.Item>
						{/each}
					</Select.Content>
				</div>
			</Select.Root>
		</div>
		<Separator />
	{:else}
		<div class="flex w-full flex-col gap-2 p-2">
			{#each items as item (item.anchor)}
				<div class="h-max w-full">
					<Button
						onclick={() => {
							url.hash = `${item.anchor}`;
							window.location.hash = `${item.anchor}`;
						}}
						variant={active === item.anchor ? 'default' : 'ghost'}
						class="w-full cursor-pointer justify-start"
					>
						{item.label}
					</Button>
				</div>
			{/each}
		</div>
	{/if}
</div>
