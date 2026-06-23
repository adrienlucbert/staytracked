import { env } from '$env/dynamic/public';
import { APP_NAME } from "$env/static/private";
import { getAthleteLink } from '$lib/link';
import type { Users } from "$lib/server/db/schema";
import { send } from "$lib/server/email/sender";
import { NewActivity, NewFollowRequest, SelfNewActivity } from "$lib/server/email/templates";
import { Notification } from '$lib/types/notifications';
import type { Notifier } from "./notifier";

export const EmailNotifier = {
	[Notification.FOLLOW_REQUEST]: async (target: Users, follower: Users): Promise<void> => {
		if (!target.email) {
			return
		}

		await send(NewFollowRequest(follower.name), {
			username: follower.name,
			approveURL: `${env.PUBLIC_URL ?? 'http://localhost'}/api/followers/${follower.uuid}/approve`,
			denyURL: `${env.PUBLIC_URL ?? 'http://localhost'}/api/followers/${follower.uuid}/ban`,
			manageAccessURL: `${env.PUBLIC_URL ?? 'http://localhost'}/manage-access`,
			appName: APP_NAME
		}, target.email, target.preferredLocale)
	},

	[Notification.NEW_LIVETRACK]: async (target: Users, athlete: Users): Promise<void> => {
		if (!target.email) {
			return
		}

		await send(NewActivity(athlete.name), {
			username: athlete.name,
			athleteURL: getAthleteLink(athlete.name).toString(),
			accountURL: `${env.PUBLIC_URL ?? 'http://localhost'}/account`,
		}, target.email, target.preferredLocale)
	},

	[Notification.SELF_NEW_LIVETRACK]: async (user: Users): Promise<void> => {
		if (!user.email) {
			return
		}

		await send(SelfNewActivity(), {
			athleteURL: getAthleteLink(user.name).toString(),
			accountURL: `${env.PUBLIC_URL ?? 'http://localhost'}/account`,
			isIncognito: user.isIncognito ?? false,
			incognitoToggleUrl: `${env.PUBLIC_URL ?? 'http://localhost'}/my-link`,
		}, user.email, user.preferredLocale)
	},
} satisfies Notifier
