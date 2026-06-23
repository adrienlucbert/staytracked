import { db } from '$lib/server/db';
import { eq, getTableColumns } from "drizzle-orm";
import type { UUID } from 'crypto';
import { hashPassword } from '$lib/server/auth/password';
import { users, type Users, githubTraits, googleTraits, passwordTraits, type GithubTraits, type GoogleTraits, type PasswordTraits, type Traits, trackingLinks } from '$lib/server/db/schema';
import { m } from '$lib/paraglide/messages.js';
import { getLocale, type Locale } from '$lib/paraglide/runtime';

export enum AuthMethod {
	Password = 'password',
	Github = 'github',
	Google = 'google',
}

function slugifyUsername(username: string): string {
	return username
		.split('@')[0]
		.toLowerCase()
		.normalize("NFD")
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.substring(0, 50);
}

// Returns the slugified username if it is not already taken in the users table.
// If it is taken, append a unique suffix to it.
async function getAvailableUsernameSlug(username: string): Promise<string> {
	let slug = slugifyUsername(username)
	const usernameAvailable = await isUsernameAvailable(slug)
	if (!usernameAvailable) {
		const suffix = crypto.randomUUID().split("-")[0]
		slug = `${slug}-${suffix}`
	}
	return slug
}

export async function createUser(method: AuthMethod.Password, email: string, password: string): Promise<Users>;
export async function createUser(method: AuthMethod.Github, email: string | undefined, isEmailVerified: boolean | undefined, userId: number, username: string): Promise<Users>;
export async function createUser(method: AuthMethod.Google, email: string | undefined, isEmailVerified: boolean | undefined, userId: string, username: string): Promise<Users>;
export async function createUser(method: AuthMethod, ...args: any): Promise<Users> {
	const userUUID = crypto.randomUUID()
	try {
		return await db().transaction(async (tx) => {
			switch (method) {
				case AuthMethod.Password: {
					const [email, password]: [email: string, password: string] = args
					const slug = await getAvailableUsernameSlug(email)
					const user = (await tx.insert(users).values({
						uuid: userUUID,
						name: slug,
						email: email,
						isEmailVerified: false,
						preferredLocale: getLocale(),
					}).returning())[0]
					await tx.insert(passwordTraits).values({
						userUUID: userUUID,
						passwordHash: await hashPassword(password),
					})
					await tx.insert(trackingLinks).values({
						userUUID: userUUID,
					})
					return user
				}
				case AuthMethod.Github: {
					const [email, isEmailVerified, userId, username]: [email: string, isEmailVerified: boolean, userId: number, username: string] = args
					const slug = await getAvailableUsernameSlug(username)
					const user = (await tx.insert(users).values({
						uuid: userUUID,
						name: slug,
						email: email,
						isEmailVerified: email && isEmailVerified || false,
						preferredLocale: getLocale(),
					}).returning())[0]
					await tx.insert(githubTraits).values({
						userUUID: userUUID,
						userId: userId,
						username: username,
					})
					await tx.insert(trackingLinks).values({
						userUUID: userUUID,
					})
					return user
				}
				case AuthMethod.Google: {
					const [email, isEmailVerified, userId, username]: [email: string, isEmailVerified: boolean, userId: string, username: string] = args
					const slug = await getAvailableUsernameSlug(username)
					const user = (await tx.insert(users).values({
						uuid: userUUID,
						name: slug,
						email: email,
						isEmailVerified: email && isEmailVerified || false,
						preferredLocale: getLocale(),
					}).returning())[0]
					await tx.insert(googleTraits).values({
						userUUID: userUUID,
						userId: userId,
						username: username,
					})
					await tx.insert(trackingLinks).values({
						userUUID: userUUID,
					})
					return user
				}
			}
		})
	} catch (err: any) {
		if (err.code === '23505') { // unique constraint
			throw m.user_with_email_already_exists()
		}
		throw err
	}
}

export async function getUserByName(name: string): Promise<Users | undefined> {
	return await db().query.users.findFirst({
		where: eq(users.name, name)
	})
}

export async function getUserByUUID(userUUID: UUID): Promise<Users | undefined> {
	return await db().query.users.findFirst({
		where: eq(users.uuid, userUUID)
	})
}

export async function getUserByIdentifier(identifier: string): Promise<Users> {
	let user: Users | undefined
	if (/^[0-9A-Fa-f]{8}(-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/.test(identifier)) {
		user = await getUserByUUID(identifier as UUID)
	} else {
		user = await getUserByName(identifier)
	}
	if (!user) {
		throw m.invalid_athlete_identifier()
	}
	return user
}

export async function getUserByNameOrUUID(identifier: string): Promise<Users | undefined> {
	let userUUID = identifier
	if (!/^[0-9A-Fa-f]{8}(-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/.test(identifier)) {
		const user = await getUserByName(identifier)
		if (!user) {
			throw m.invalid_athlete_identifier()
		}
		userUUID = user.uuid
	}
	return getUserByUUID(userUUID as UUID)
}

export async function getUser(method: AuthMethod.Password, email: string): Promise<Users & { traits: PasswordTraits } | undefined>;
export async function getUser(method: AuthMethod.Github, userid: number): Promise<Users & { traits: GithubTraits } | undefined>;
export async function getUser(method: AuthMethod.Google, userid: string): Promise<Users & { traits: GoogleTraits } | undefined>;
export async function getUser(method: AuthMethod, ...args: any): Promise<Users & { traits: Traits } | undefined> {
	switch (method) {
		case AuthMethod.Password: {
			const [email]: [email: string] = args
			return (await db().select({
				...getTableColumns(users),
				traits: passwordTraits
			})
				.from(passwordTraits)
				.innerJoin(users, eq(users.uuid, passwordTraits.userUUID))
				.where(eq(users.email, email))
				.limit(1))[0]
		}
		case AuthMethod.Github: {
			const [userid]: [userid: number] = args
			return (await db().select({
				...getTableColumns(users),
				traits: githubTraits
			})
				.from(githubTraits)
				.innerJoin(users, eq(users.uuid, githubTraits.userUUID))
				.where(eq(githubTraits.userId, userid))
				.limit(1))[0]
		}
		case AuthMethod.Google: {
			const [userid]: [userid: string] = args
			return (await db().select({
				...getTableColumns(users),
				traits: googleTraits
			})
				.from(googleTraits)
				.innerJoin(users, eq(users.uuid, googleTraits.userUUID))
				.where(eq(googleTraits.userId, userid))
				.limit(1))[0]
		}
	}
}

export async function setUserEmailVerified(userUUID: UUID): Promise<void> {
	await db().update(users)
		.set({ isEmailVerified: true })
		.where(eq(users.uuid, userUUID))
}

export async function setUserPreferredLocale(userUUID: UUID, locale: Locale): Promise<void> {
	await db().update(users)
		.set({ preferredLocale: locale })
		.where(eq(users.uuid, userUUID))
}

export async function setUserIsIncognito(userUUID: UUID, isIncognito: boolean): Promise<void> {
	await db().update(users)
		.set({ isIncognito })
		.where(eq(users.uuid, userUUID))
}

export async function updateUserPassword(userUUID: UUID, password: string): Promise<void> {
	await db().update(passwordTraits)
		.set({ passwordHash: await hashPassword(password) })
		.where(eq(passwordTraits.userUUID, userUUID))
}

async function isUsernameAvailable(username: string): Promise<boolean> {
	return (await db().query.users.findFirst({ where: eq(users.name, username) })) === undefined
}

export async function validateSlug(slug: string): Promise<void> {
	const slugified = slugifyUsername(slug)
	if (slugifyUsername(slug) !== slug) {
		throw m.invalid_username_slug({ slug: slugified })
	}
	const usernameAvailable = await isUsernameAvailable(slug)
	if (!usernameAvailable) {
		throw m.username_slug_already_taken()
	}
}

export async function updateUserName(userUUID: UUID, username: string): Promise<void> {
	await db().update(users)
		.set({ name: username })
		.where(eq(users.uuid, userUUID))
}

export async function updateUserEmail(userUUID: UUID, email: string): Promise<void> {
	await db().update(users)
		.set({ email: email, isEmailVerified: false })
		.where(eq(users.uuid, userUUID))
}

export async function deleteUser(userUUID: UUID): Promise<void> {
	await db()
		.delete(users)
		.where(eq(users.uuid, userUUID))
}
