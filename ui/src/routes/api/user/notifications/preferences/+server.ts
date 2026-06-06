import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { m } from '$lib/paraglide/messages.js';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';

export const PUT: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		error(StatusCodes.UNAUTHORIZED, m.user_not_logged_in());
	}

	const body = await request.json()
	const notification = body.notification ?? error(StatusCodes.BAD_REQUEST, { message: m.missing_field_in_body({ field: 'notification' }) })
	const channel = body.channel ?? error(StatusCodes.BAD_REQUEST, { message: m.missing_field_in_body({ field: 'channel' }) })
	const enabled = body.enabled ?? error(StatusCodes.BAD_REQUEST, { message: m.missing_field_in_body({ field: 'enabled' }) })

	try {
		await db()
			.update(users)
			.set({
				notificationPreferences: sql`jsonb_set(
            jsonb_set(
                ${users.notificationPreferences},
                ${sql.raw(`'{${notification}}'`)},
                COALESCE(${users.notificationPreferences} -> ${notification}, '{"push": false, "email": false}'),
                true
            ),
            ${sql.raw(`'{${notification},${channel}}'`)},
            ${sql.raw(`'${String(enabled)}'`)},
            true
        )`
			})
			.where(eq(users.uuid, locals.user.uuid))
	} catch (message) {
		throw error(StatusCodes.INTERNAL_SERVER_ERROR, { message: String(message) })
	}

	return json({ success: true })
};
