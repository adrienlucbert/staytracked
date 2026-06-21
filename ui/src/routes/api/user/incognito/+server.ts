import type { RequestHandler } from './$types';
import type { UUID } from 'crypto';
import { error, json } from '@sveltejs/kit';
import { setUserIsIncognito } from '$lib/server/auth/user';
import { StatusCodes } from 'http-status-codes';
import { m } from '$lib/paraglide/messages.js';

export const PUT: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		error(StatusCodes.UNAUTHORIZED, m.user_not_logged_in());
	}

	const body = await request.json()
	const locale = body.is_incognito ?? error(StatusCodes.BAD_REQUEST, { message: m.missing_field_in_body({ field: 'is_incognito' }) })

	try {
		await setUserIsIncognito(locals.user.uuid as UUID, locale)
		return json({ success: true })
	} catch (err) {
		error(StatusCodes.INTERNAL_SERVER_ERROR, m.failed_to_set_is_incognito());
	}
};
