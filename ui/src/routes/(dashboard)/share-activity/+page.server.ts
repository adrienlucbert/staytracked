import type { PageServerLoad } from './$types';
import type { UUID } from 'crypto';
import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';
import { getTrackingLinkForUser } from '$lib/server/link/trackingLink';
import { ActivityDisclosure } from '$lib/types/privacy';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user || !locals.session) {
		redirect(StatusCodes.MOVED_TEMPORARILY, `/auth?follow=${encodeURIComponent(url.toString())}`)
	}

	try {
		const trackingLink = await getTrackingLinkForUser(locals.user.uuid as UUID)
		return {
			disclosure: trackingLink.disclosure as ActivityDisclosure,
			hasActivity: !!trackingLink.link,
			updatedAt: trackingLink.updatedAt,
		}
	} catch {
		return { disclosure: undefined, hasActivity: false, updatedAt: undefined }
	}
};
