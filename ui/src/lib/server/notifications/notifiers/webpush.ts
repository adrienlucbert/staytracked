import type { TrackingLinks, Users } from "$lib/server/db/schema";
import type { UUID } from "crypto";
import { notifyUser } from "../webpush";
import type { Notifier } from "./notifier";
import { m } from "$lib/paraglide/messages";
import { getLocale, isLocale } from "$lib/paraglide/runtime";
import { env } from '$env/dynamic/public';
import { disclosureEndpoint, getAthleteLink, shareActivityLink } from "$lib/link";
import { Notification } from "$lib/types/notifications";
import { ActivityDisclosure } from "$lib/types/privacy";

const ICON = "https://img.icons8.com/color/96/cycling-road--v1.png"

export const WebPushNotifier = {
	[Notification.FOLLOW_REQUEST]: async (target: Users, follower: Users): Promise<void> => {
		const locale = isLocale(target.preferredLocale) ? target.preferredLocale : getLocale()
		notifyUser(target.uuid as UUID, {
			title: m.notif_new_follow_request_title({ username: follower.name }, { locale }),
			body: m.notif_new_follow_request_body({}, { locale }),
			icon: ICON,
			badge: ICON,
			data: {
				open: `${env.PUBLIC_URL ?? 'http://localhost'}/manage-access`
			}
		})
	},

	[Notification.NEW_LIVETRACK]: async (target: Users, athlete: Users): Promise<void> => {
		const locale = isLocale(target.preferredLocale) ? target.preferredLocale : getLocale()
		notifyUser(target.uuid as UUID, {
			title: m.notif_new_activity_title({ username: athlete.name }, { locale }),
			icon: ICON,
			badge: ICON,
			data: {
				open: getAthleteLink(athlete.name).toString()
			}
		})
	},

	[Notification.SELF_NEW_LIVETRACK]: async (target: Users, trackingLink: TrackingLinks): Promise<void> => {
		const locale = isLocale(target.preferredLocale) ? target.preferredLocale : getLocale()

		if (trackingLink.disclosure === ActivityDisclosure.PENDING) {
			notifyUser(target.uuid as UUID, {
				title: m.notif_self_new_activity_pending_title({}, { locale }),
				body: m.notif_self_new_activity_pending_body({}, { locale }),
				icon: ICON,
				badge: ICON,
				requireInteraction: true,
				tag: `activity-disclosure-${trackingLink.uuid}`,
				actions: [
					{ action: 'share', title: m.notif_action_share_activity({}, { locale }) },
					{ action: 'silent', title: m.notif_action_keep_activity_silent({}, { locale }) },
				],
				data: {
					open: shareActivityLink().toString(),
					disclosureEndpoint: disclosureEndpoint(),
					confirmations: {
						share: m.notif_activity_shared_title({}, { locale }),
						silent: m.notif_activity_silenced_title({}, { locale }),
					},
				}
			})
			return
		}

		notifyUser(target.uuid as UUID, {
			title: trackingLink.disclosure === ActivityDisclosure.SILENT
				? m.notif_self_new_activity_silent_title({}, { locale })
				: m.notif_self_new_activity_title({}, { locale }),
			icon: ICON,
			badge: ICON,
			data: {
				open: getAthleteLink(target.name).toString()
			}
		})
	},
} satisfies Notifier
