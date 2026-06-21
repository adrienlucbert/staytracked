import { relations, sql } from 'drizzle-orm'
import { boolean, check, jsonb, pgEnum, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { githubTraits, googleTraits, passwordTraits, type GithubTraits, type GoogleTraits, type PasswordTraits } from './traits';
import { webpushSubscriptions } from '../notifications/webpush';
import { enumToPgEnum } from '../../utils';
import { Notification } from '../../../../types/notifications';

export const notification = pgEnum('notification', enumToPgEnum(Notification))

export type PreferencePerNotification = Record<Notification, { email: boolean, push: boolean }>

const defaultPreferencePerNotification = Object.fromEntries(
	Object.values(Notification).map((v) => [v, { email: true, push: true }])
) as PreferencePerNotification

export const users = pgTable('users', {
	uuid: uuid('uuid').primaryKey().defaultRandom().unique(),
	name: text('name').notNull().unique(),
	email: text('email'),
	isEmailVerified: boolean('is_email_verified').notNull().default(false),
	preferredLocale: text('preferred_locale').default('en'),
	isIncognito: boolean('is_incognito').default(false),
	notificationPreferences: jsonb('notification_preferences').$type<PreferencePerNotification>().notNull().default(defaultPreferencePerNotification),
}, (table) => ({
	nameFormatCheck: check(
		"name_format_check",
		sql`${table.name} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`
	),
	emailUniqueIndex: uniqueIndex('email_unique_index')
		.on(sql`lower(${table.email})`)
		.where(sql`${table.email} IS NOT NULL`),
	emailVerifiedRequiresEmail: check(
		'email_verified_requires_email',
		sql`${table.email} IS NOT NULL OR ${table.isEmailVerified} = false`
	)
}));

export const usersRelations = relations(users, ({ one }) => ({
	passwordTrait: one(passwordTraits, {
		fields: [users.uuid],
		references: [passwordTraits.userUUID],
	}),
	githubTrait: one(githubTraits, {
		fields: [users.uuid],
		references: [githubTraits.userUUID],
	}),
	googleTrait: one(googleTraits, {
		fields: [users.uuid],
		references: [googleTraits.userUUID],
	}),
	webpushSubscriptions: one(webpushSubscriptions, {
		fields: [users.uuid],
		references: [webpushSubscriptions.userUUID],
	}),
}))

export type Users = typeof users.$inferSelect;

export type PublicUserWithTraits = Users & {
	passwordTrait: Omit<PasswordTraits, 'passwordHash'> | null,
	githubTrait: GithubTraits | null,
	googleTrait: GoogleTraits | null,
}

