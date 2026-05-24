import { error } from '@sveltejs/kit'
import type { RequestEvent } from './$types'
import { updateTrackingLink } from '$lib/server/link/trackingLink'
import type { UUID } from 'crypto'
import { broadcast } from '$lib/server/sse'
import { m } from '$lib/paraglide/messages.js';
import { listFollowers } from "$lib/server/followers/followers";
import { getUserByUUID } from "$lib/server/auth/user";
import { env as privEnv } from '$env/dynamic/private';
import { FollowStatus } from "$lib/types/followers";
import { notify } from '$lib/server/notifications/notify'
import { Notification } from "$lib/types/notifications";
import { StatusCodes } from 'http-status-codes';

export async function PUT({ params, request }: RequestEvent) {
	const auth = request.headers.get("Authorization");
	if (!auth) {
		error(StatusCodes.UNAUTHORIZED, { message: m.missing_header({ header: "Authorization" }) })
	}

	if (auth !== `Basic ${btoa(privEnv.SMTP_PROXY_BASIC_AUTH)}`) {
		error(StatusCodes.UNAUTHORIZED, { message: m.invalid_header({ header: "Authorization" }) })
	}

	const body = await request.json()
	if (!body.link) {
		error(StatusCodes.BAD_REQUEST, { message: m.missing_field_in_body({ field: "link" }) })
	}

	try {
		const updatedTrackingLink = await updateTrackingLink(params.link_uuid as UUID, body.link)
		try {
			broadcast(`update-link-${params.link_uuid}`, updatedTrackingLink)

			const user = await getUserByUUID(updatedTrackingLink.userUUID as UUID)
			if (!user) {
				throw m.invalid_user_uuid()
			}
			const sendJobs: Promise<void>[] = []
			sendJobs.push(notify(Notification.SELF_NEW_LIVETRACK, user))

			const followers = await listFollowers(updatedTrackingLink.userUUID as UUID)

			for (const follow of followers) {
				if (follow.status !== FollowStatus.APPROVED || !follow.enabledNotifications) {
					continue
				}
				sendJobs.push(notify(Notification.NEW_LIVETRACK, follow.followerUser, user))
			}

			await Promise.all(sendJobs)
		} catch (e) { console.error(e) }
	} catch (e) {
		if (e === m.invalid_user_uuid()) {
			error(StatusCodes.NOT_FOUND)
		} else {
			error(StatusCodes.INTERNAL_SERVER_ERROR, { message: String(e) })
		}
	}

	return new Response()
}
