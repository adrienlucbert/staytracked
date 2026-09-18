import { db } from '$lib/server/db';
import { trackingLinks, users, type TrackingLinks } from '$lib/server/db/schema';
import { type UUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { m } from '$lib/paraglide/messages.js';
import { ActivityDisclosure, disclosureForPrivacyMode, PrivacyMode } from '$lib/types/privacy';

export type TrackingLinkWithUser = TrackingLinks & { user: { uuid: string, name: string, privacyMode: PrivacyMode } }
export type PublicTrackingLinkWithUser = Omit<TrackingLinks, 'uuid'> & { user: { uuid: string, name: string } }

export async function updateTrackingLink(linkUUID: UUID, link: string): Promise<TrackingLinkWithUser> {
	const trackingLink = await db().query.trackingLinks.findFirst({
		with: {
			user: { columns: { uuid: true, name: true, privacyMode: true } }
		},
		where: eq(trackingLinks.uuid, linkUUID),
	})

	if (!trackingLink || !trackingLink.user) {
		return Promise.reject(m.invalid_livetrack_session())
	}

	const disclosure = disclosureForPrivacyMode(trackingLink.user.privacyMode as PrivacyMode)

	const updatedRows = await db()
		.update(trackingLinks)
		.set({
			link: link,
			disclosure: disclosure,
			updatedAt: new Date(),
		})
		.where(
			eq(trackingLinks.uuid, linkUUID)
		)
		.returning()

	if (updatedRows.length === 0) {
		return Promise.reject(m.invalid_livetrack_session())
	}

	return { ...updatedRows[0], user: trackingLink.user as TrackingLinkWithUser['user'] }
}

export async function setTrackingLinkVisibility(userUUID: UUID, isPublic: boolean): Promise<void> {
	await db().update(trackingLinks)
		.set({ isPublic })
		.where(eq(trackingLinks.userUUID, userUUID))
}

export async function resolveTrackingLinkDisclosure(userUUID: UUID, disclosure: ActivityDisclosure.SHARED | ActivityDisclosure.SILENT): Promise<TrackingLinks | undefined> {
	const updatedRows = await db().update(trackingLinks)
		.set({ disclosure })
		.where(and(
			eq(trackingLinks.userUUID, userUUID),
			eq(trackingLinks.disclosure, ActivityDisclosure.PENDING),
		))
		.returning()

	return updatedRows[0]
}

export async function getTrackingLinkForUser(userUUID: UUID): Promise<TrackingLinkWithUser> {
	const trackingLink = await db().query.trackingLinks.findFirst({
		with: {
			user: { columns: { uuid: true, name: true, privacyMode: true } }
		},
		where: eq(trackingLinks.userUUID, userUUID),
	})

	if (!trackingLink || !trackingLink.user) {
		return Promise.reject(m.invalid_livetrack_session())
	}

	return trackingLink as TrackingLinkWithUser
}
