import { page } from "$app/state";
import type { Component } from "svelte";
import HomeIcon from '@lucide/svelte/icons/house';
import UsersIcon from '@lucide/svelte/icons/users';
import RocketIcon from '@lucide/svelte/icons/rocket';
import CircleUserRoundIcon from '@lucide/svelte/icons/circle-user-round';
import LogOutIcon from '@lucide/svelte/icons/log-out';
import LinkIcon from '@lucide/svelte/icons/link';
import { m } from '$lib/paraglide/messages.js';

export type Page = {
	title: string;
	url: string;
	icon: Component;
	isVisible?: boolean;
	isActive?: boolean;
};

const _pages = {
	'home': {
		title: m.pages_home(),
		url: '/',
		icon: HomeIcon,
	},
	'gettingStarted': {
		title: m.pages_getting_started(),
		url: '/getting-started',
		icon: RocketIcon,
	},
	'myLink': {
		title: m.pages_my_link(),
		url: `/my-link`,
		icon: LinkIcon,
	},
	'manageAccess': {
		title: m.pages_manage_access(),
		url: '/my-link#manage-access',
		icon: UsersIcon,
		isVisible: false,
	},
	'account': {
		title: m.pages_account(),
		url: '/account',
		icon: CircleUserRoundIcon,
	},
	'signout': {
		title: m.pages_signout(),
		url: '/auth/signout',
		icon: LogOutIcon,
	}
} satisfies Record<string, Omit<Page, 'isActive'>>

export type PageName = keyof typeof _pages;

export function pages(url?: URL): Record<PageName, Page> {
	const pageUrl = url || page.url
	return Object.fromEntries(
		Object.entries(_pages).map(([key, value]) => {
			return [
				key, {
					...value,
					isActive: value.url === '/' ? pageUrl.pathname === '/'
						: pageUrl.pathname.startsWith(value.url.split('#')[0])
				}
			];
		})
	) as Record<PageName, Page>
}

export function currentPage(url?: URL): Page | undefined {
	return Object.values(pages(url))
		.find((page) => page.isActive)
}
