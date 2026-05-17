<script lang="ts">
	import Sidebar from '$lib/components/sidebars/sidebar.svelte';
	import FollowingTable from './following-table.svelte';
	import {
		EditUserForm,
		ChangePasswordForm,
		DeleteAccountForm,
		NotificationsForm,
		SetupWebPushForm
	} from '$lib/components/forms/account';
	import { Separator } from '$lib/components/ui/separator';
	import { SvelteURL } from 'svelte/reactivity';
	import { VerifyEmailForm } from '$lib/components/forms/account';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	let { data } = $props();
	let { user, flags, vapid_public_key, appName } = data;

	const sidebarItems = $derived([
		{
			anchor: '#profile',
			label: m.user_profile_title()
		},
		{
			anchor: '#following',
			label: m.following_title()
		},
		{
			anchor: '#notifications',
			label: m.notifications_title()
		}
	]);
	const url = new SvelteURL(page.url);
	let active = $derived(url.hash || '#profile');
</script>

<div class="flex h-full w-full flex-col md:flex-row">
	<Sidebar items={sidebarItems} {url} {active} />
	<Separator class="mx-0 hidden md:block" orientation="vertical" />
	<div class="flex w-full flex-col">
		{#key active}
			<div
				class="mx-auto flex w-full max-w-2xl flex-col content-start gap-4 p-4 py-5 pb-9 [&_p]:m-0"
			>
				{#if active === '#profile'}
					<h3 class="mt-0">{m.user_profile_title()}</h3>
					{#if user}
						{#if flags.ENABLE_VERIFY_EMAIL}
							<VerifyEmailForm {user} />
						{/if}
						<EditUserForm action="?/editUser" userWithTraits={user} />
						{#if user.passwordTrait}
							<h3 class="mt-4">{m.change_password_title()}</h3>
							<ChangePasswordForm action="?/changePassword" />
						{/if}
						<h3 class="mt-4">{m.delete_account_title()}</h3>
						<DeleteAccountForm action="?/deleteAccount" />
					{/if}
				{/if}

				{#if active === '#following'}
					<h3 class="mt-0">{m.following_title()}</h3>
					<p class="text-sm text-muted-foreground">
						{@html m.following_text()}
					</p>
					<div class="mt-2">
						<FollowingTable />
					</div>
				{/if}

				{#if active === '#notifications'}
					<h3 class="mt-0">{m.notifications_title()}</h3>
					<p class="text-justify text-sm text-muted-foreground">
						{m.notifications_text()}
					</p>
					<SetupWebPushForm pubkey={vapid_public_key} {appName} />
					{#if user}
						<NotificationsForm {user} />
					{/if}
				{/if}
			</div>
		{/key}
	</div>
</div>
