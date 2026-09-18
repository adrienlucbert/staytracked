import { error } from '@sveltejs/kit'
import type { RequestEvent } from './$types'
import { updateTrackingLink } from '$lib/server/link/trackingLink'
import type { UUID } from 'crypto'
import { broadcast } from '$lib/server/sse'
import { m } from '$lib/paraglide/messages.js';
import { env as privEnv } from '$env/dynamic/private';
import { notifyNewActivity } from '$lib/server/notifications/activity'
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

			await notifyNewActivity(updatedTrackingLink)
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
