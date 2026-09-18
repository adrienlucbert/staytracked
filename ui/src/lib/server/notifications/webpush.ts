import { env } from "$env/dynamic/public";
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '$env/static/private';
import webpush, { type PushSubscription } from 'web-push';
import { webpushSubscriptions } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import type { UUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

webpush.setVapidDetails(env.PUBLIC_URL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export type NotificationAction = { action: string, title: string, icon?: string }

export type NotificationPayload = { title: string, actions?: NotificationAction[] } & NotificationOptions

export async function sendNotification(subscription: PushSubscription, payload: NotificationPayload): Promise<void> {
	try {
		await webpush.sendNotification(subscription, JSON.stringify(payload));
	} catch (e: any) {
		if (e.statusCode === StatusCodes.GONE) { // Unsubscribed or expired
			await deleteWebpushSubscription(subscription)
		} else {
			console.error(e)
		}
	}
}

export async function notifyUser(userUUID: UUID, payload: NotificationPayload): Promise<void> {
	const subscriptions = await db().query.webpushSubscriptions
		.findMany({
			where: eq(webpushSubscriptions.userUUID, userUUID)
		})
	const jobs = subscriptions.map(({ subscription }) => sendNotification(subscription, payload))
	await Promise.all(jobs)
}

export async function createWebpushSubscription(userUUID: UUID, subscription: PushSubscription): Promise<void> {
	await db()
		.insert(webpushSubscriptions)
		.values({
			userUUID,
			subscription: subscription
		}).onConflictDoNothing()
}

export async function deleteWebpushSubscription(subscription: PushSubscription): Promise<void> {
	await db()
		.delete(webpushSubscriptions)
		.where(sql`${webpushSubscriptions.subscription}->>'endpoint' = ${subscription.endpoint}`)
}
