import type { LayoutServerLoad } from './$types';
import { getTrackingLinkForUser, type PublicTrackingLinkWithUser } from "$lib/server/link/trackingLink";
import { type UUID } from "crypto";
import { getUserByIdentifier } from "$lib/server/auth/user";
import { getFollower } from '$lib/server/followers/followers';
import type { Followers } from '$lib/server/db/schema';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	let link: PublicTrackingLinkWithUser | undefined
	let follow: Followers | undefined

	try {
		let user = await getUserByIdentifier(params.identifier)
		if (!user.isIncognito) {
			const { uuid, ...rest } = await getTrackingLinkForUser(user.uuid as UUID)
			link = rest

			if (link && locals.user && link.userUUID !== locals.user.uuid) {
				follow = await getFollower(link.userUUID as UUID, locals.user.uuid as UUID)
			}
		}
	} catch { }

	return { trackingLink: link, follow }
};
