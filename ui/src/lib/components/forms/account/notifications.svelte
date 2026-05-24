<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Toggle } from '$lib/components/ui/toggle';
	import BellIcon from '@lucide/svelte/icons/bell';
	import MailIcon from '@lucide/svelte/icons/mail';
	import type { PreferencePerNotification, Users } from '$lib/server/db/schema';
	import { Notification } from '$lib/types/notifications';
	import { m } from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	let { user }: { user: Users } = $props();

	const rows: Record<Notification, { title: string }> = {
		[Notification.FOLLOW_REQUEST]: {
			title: m.notifications_follow_request_title()
		},
		[Notification.NEW_LIVETRACK]: {
			title: m.notifications_new_activity_title()
		},
		[Notification.SELF_NEW_LIVETRACK]: {
			title: m.notifications_self_new_activity_title()
		}
	} as const;

	let preferences = $state(user.notificationPreferences);

	let loading = $state(
		Object.fromEntries(Object.values(Notification).map((v) => [v, { email: false, push: false }]))
	);

	async function updatePreference(
		notification: Notification,
		channel: keyof PreferencePerNotification[Notification],
		enabled: boolean
	) {
		loading[notification][channel] = true;

		preferences[notification][channel] = !enabled;

		const res = await fetch('/api/user/notifications/preferences', {
			method: 'PUT',
			body: JSON.stringify({ notification, channel, enabled })
		});
		if (res.ok) {
			preferences[notification][channel] = enabled;
		} else {
			toast.error((await res.json()).message);
		}
		loading[notification][channel] = false;
	}
</script>

{#snippet notificationSettings(notification: Notification, title: string)}
	<tr>
		<td>{title}</td>
		<td class="min-w-20 text-right">
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Toggle
							disabled={loading[notification]['email']}
							bind:pressed={preferences[notification].email}
							onPressedChange={(pressed) => updatePreference(notification, 'email', pressed)}
							aria-label={m.notifications_email_label()}
							size="sm"
						>
							<MailIcon />
						</Toggle>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>{m.notifications_email_label()}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Toggle
							disabled={loading[notification]['push']}
							bind:pressed={preferences[notification].push}
							onPressedChange={(pressed) => updatePreference(notification, 'push', pressed)}
							aria-label={m.notifications_webpush_label()}
							size="sm"
						>
							<BellIcon />
						</Toggle>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>{m.notifications_webpush_label()}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</td>
	</tr>
{/snippet}

<table class="w-full border-separate border-spacing-y-1">
	<tbody>
		{#each Object.entries(rows) as [notification, config]}
			{@render notificationSettings(notification as Notification, config.title)}
		{/each}
	</tbody>
</table>
