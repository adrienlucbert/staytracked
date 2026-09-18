import type { RequestHandler, RouteParams } from './$types';
import { error, isHttpError, json, redirect } from '@sveltejs/kit';
import type { UUID } from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { m } from '$lib/paraglide/messages.js';
import { resolveTrackingLinkDisclosure } from '$lib/server/link/trackingLink';
import { notifyFollowersOfNewActivity } from '$lib/server/notifications/activity';
import { ActivityDisclosure, type DisclosureDecision } from '$lib/types/privacy';

const disclosurePerDecision: Record<DisclosureDecision, ActivityDisclosure.SHARED | ActivityDisclosure.SILENT> = {
	'share': ActivityDisclosure.SHARED,
	'silent': ActivityDisclosure.SILENT,
}

async function resolveDisclosure(locals: App.Locals, params: RouteParams): Promise<ActivityDisclosure> {
	if (!locals.user) {
		error(StatusCodes.UNAUTHORIZED, m.user_not_logged_in());
	}

	const disclosure = disclosurePerDecision[params.decision as DisclosureDecision]

	let trackingLink
	try {
		trackingLink = await resolveTrackingLinkDisclosure(locals.user.uuid as UUID, disclosure)
	} catch (err) {
		error(StatusCodes.INTERNAL_SERVER_ERROR, m.failed_to_set_activity_disclosure());
	}

	if (!trackingLink) {
		error(StatusCodes.CONFLICT, m.no_activity_awaiting_decision());
	}

	if (disclosure === ActivityDisclosure.SHARED) {
		try {
			await notifyFollowersOfNewActivity(locals.user)
		} catch (e) { console.error(e) }
	}

	return disclosure
}

export const PUT: RequestHandler = async ({ locals, params }) => {
	const disclosure = await resolveDisclosure(locals, params)
	return json({ success: true, disclosure })
};

export const GET: RequestHandler = async ({ request, locals, params, url }) => {
	if (request.headers.get('Sec-Fetch-Mode') !== 'navigate') {
		error(StatusCodes.METHOD_NOT_ALLOWED)
	}

	try {
		await resolveDisclosure(locals, params)
	} catch (e) {
		if (isHttpError(e) && e.status === StatusCodes.UNAUTHORIZED) {
			redirect(StatusCodes.MOVED_TEMPORARILY, `/auth?follow=${encodeURIComponent(url.toString())}`)
		}
		if (!isHttpError(e) || e.status !== StatusCodes.CONFLICT) {
			throw e
		}
	}

	redirect(StatusCodes.SEE_OTHER, '/share-activity')
};
