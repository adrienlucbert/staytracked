import { db } from '$lib/server/db';
import { trackingLinks, users, type TrackingLinks } from '$lib/server/db/schema';
import { type UUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { m } from '$lib/paraglide/messages.js';

export type TrackingLinkWithUser = TrackingLinks & { user: { uuid: string, name: string, isIncognito: boolean } }
export type PublicTrackingLinkWithUser = Omit<TrackingLinks, 'uuid'> & { user: { uuid: string, name: string } }

export async function updateTrackingLink(linkUUID: UUID, link: string): Promise<TrackingLinkWithUser> {
	const updatedRows = await db()
		.update(trackingLinks)
		.set({
			link: link,
			updatedAt: new Date(),
		})
		.where(
			eq(trackingLinks.uuid, linkUUID)
		)
		.returning()

	if (updatedRows.length === 0) {
		return Promise.reject(m.invalid_livetrack_session())
	}

	const trackingLink = updatedRows[0]
	const user = await db()
		.query.users.findFirst({
			columns: {
				uuid: true,
				name: true,
				isIncognito: true,
			},
			where: eq(users.uuid, trackingLink.userUUID as UUID),
		})
	if (!user) {
		return Promise.reject(m.invalid_livetrack_session())
	}

	return { ...trackingLink, user: user }
}

export async function setTrackingLinkVisibility(userUUID: UUID, isPublic: boolean): Promise<void> {
	await db().update(trackingLinks)
		.set({ isPublic })
		.where(eq(trackingLinks.userUUID, userUUID))
}

export async function getTrackingLinkForUser(userUUID: UUID): Promise<TrackingLinkWithUser> {
	const trackingLink = await db().query.trackingLinks.findFirst({
		with: {
			user: { columns: { uuid: true, name: true } }
		},
		where: eq(trackingLinks.userUUID, userUUID),
	})

	if (!trackingLink || !trackingLink.user) {
		return Promise.reject(m.invalid_livetrack_session())
	}

	return trackingLink as TrackingLinkWithUser
}
