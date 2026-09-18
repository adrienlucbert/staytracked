import { relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth/users';
import { enumToPgEnum } from '../utils';
import { ActivityDisclosure } from '../../../types/privacy';

export const activityDisclosure = pgEnum('activity_disclosure', enumToPgEnum(ActivityDisclosure))

export const trackingLinks = pgTable('tracking_links', {
	uuid: uuid('uuid').primaryKey().unique().defaultRandom(),
	userUUID: uuid('user_uuid').unique().references(() => users.uuid, { onDelete: 'cascade' }),
	link: text('link'),
	isPublic: boolean('is_public').default(true),
	disclosure: activityDisclosure('disclosure').notNull().default(ActivityDisclosure.SHARED),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const trackingLinksRelations = relations(trackingLinks, ({ one }) => ({
	user: one(users, {
		fields: [trackingLinks.userUUID],
		references: [users.uuid],
	})
}))

export type TrackingLinks = typeof trackingLinks.$inferSelect;
