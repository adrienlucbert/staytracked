<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { pages, type Page } from '$lib/pages.svelte';

	type MenuItem = Page;

	const mainMenuItems: MenuItem[] = $derived([
		pages().home,
		pages().gettingStarted,
		pages().myLink,
		pages().manageAccess,
		pages().account
	]);

	const footerItems: MenuItem[] = $derived([pages().signout]);
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Menu>
			{#each mainMenuItems as item (item.title)}
				{#if item?.isVisible !== false}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={item.isActive}
							size="lg"
							class="peer/menu-button flex h-12 w-full items-center gap-2 overflow-hidden rounded-none border-0 p-2 px-2.5 text-left text-sm ring-sidebar-ring transition-[width,height,padding] outline-none group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 group-data-[collapsible='icon']:!size-12 group-data-[collapsible='icon']:!px-2.5 group-data-[collapsible=icon]:!p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active='true']:border-r data-[active='true']:border-r-[rebeccapurple] data-[active='true']:bg-[rebeccapurple]/35 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0"
						>
							{#snippet child({ props })}
								<a href={item.url} {...props}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/if}
			{/each}
		</Sidebar.Menu>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			{#each footerItems as item (item.title)}
				{#if item?.isVisible !== false}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={item.isActive}
							size="lg"
							class="peer/menu-button flex h-12 w-full items-center gap-2 overflow-hidden rounded-none border-0 p-2 px-2.5 text-left text-sm ring-sidebar-ring transition-[width,height,padding] outline-none group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 group-data-[collapsible='icon']:!size-12 group-data-[collapsible='icon']:!px-2.5 group-data-[collapsible=icon]:!p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active='true']:border-r data-[active='true']:border-r-[rebeccapurple] data-[active='true']:bg-[rebeccapurple]/35 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0"
						>
							{#snippet child({ props })}
								<a href={item.url} {...props}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/if}
			{/each}
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
