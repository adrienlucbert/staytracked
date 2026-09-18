import type { TrackingLinks, Users } from "$lib/server/db/schema";
import { getUserByUUID } from "$lib/server/auth/user";
import { m } from "$lib/paraglide/messages.js";
import { listFollowers } from "$lib/server/followers/followers";
import { FollowStatus } from "$lib/types/followers";
import { Notification } from "$lib/types/notifications";
import { ActivityDisclosure } from "$lib/types/privacy";
import type { TrackingLinkWithUser } from "$lib/server/link/trackingLink";
import type { UUID } from "crypto";
import { notify, notifyWithOptions } from "./notify";

export async function notifyFollowersOfNewActivity(athlete: Users): Promise<void> {
	const followers = await listFollowers(athlete.uuid as UUID)

	const sendJobs: Promise<void>[] = []
	for (const follow of followers) {
		if (follow.status !== FollowStatus.APPROVED || !follow.enabledNotifications) {
			continue
		}
		sendJobs.push(notify(Notification.NEW_LIVETRACK, follow.followerUser, athlete))
	}
	await Promise.all(sendJobs)
}

export async function notifyNewActivity(trackingLink: TrackingLinkWithUser): Promise<void> {
	const user = await getUserByUUID(trackingLink.userUUID as UUID)
	if (!user) {
		throw m.invalid_user_uuid()
	}

	const isPending = trackingLink.disclosure === ActivityDisclosure.PENDING
	const sendJobs: Promise<void>[] = [
		notifyWithOptions(Notification.SELF_NEW_LIVETRACK, { force: isPending }, user, trackingLink as TrackingLinks)
	]

	if (trackingLink.disclosure === ActivityDisclosure.SHARED) {
		sendJobs.push(notifyFollowersOfNewActivity(user))
	}

	await Promise.all(sendJobs)
}
