import type { RequestHandler } from './$types';
import type { UUID } from 'crypto';
import { error, json } from '@sveltejs/kit';
import { setUserPrivacyMode } from '$lib/server/auth/user';
import { StatusCodes } from 'http-status-codes';
import { m } from '$lib/paraglide/messages.js';
import { PrivacyMode } from '$lib/types/privacy';

export const PUT: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		error(StatusCodes.UNAUTHORIZED, m.user_not_logged_in());
	}

	const body = await request.json()
	const privacyMode = body.privacy_mode
	if (!privacyMode) {
		error(StatusCodes.BAD_REQUEST, { message: m.missing_field_in_body({ field: 'privacy_mode' }) })
	}
	if (!Object.values(PrivacyMode).includes(privacyMode)) {
		error(StatusCodes.BAD_REQUEST, { message: m.invalid_field_in_body({ field: 'privacy_mode' }) })
	}

	try {
		await setUserPrivacyMode(locals.user.uuid as UUID, privacyMode)
		return json({ success: true })
	} catch (err) {
		error(StatusCodes.INTERNAL_SERVER_ERROR, m.failed_to_set_privacy_mode());
	}
};
