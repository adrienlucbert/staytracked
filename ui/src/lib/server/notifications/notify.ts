import { Notification } from "$lib/types/notifications";
import { userCanReceiveEmail } from '$lib/server/email/helpers';
import { EmailNotifier, WebPushNotifier, type Notifier } from "./notifiers";

type NotifyOptions = {
	force?: boolean
}

export async function notify<K extends Notification>(notification: K, ...args: Parameters<Notifier[K]>) {
	return notifyWithOptions(notification, {}, ...args)
}

export async function notifyWithOptions<K extends Notification>(notification: K, options: NotifyOptions, ...args: Parameters<Notifier[K]>) {
	const [user, ..._] = args
	const preference = user.notificationPreferences?.[notification];
	if (!preference && !options.force) {
		return
	}
	if ((preference?.email === true || options.force) && userCanReceiveEmail(user)) {
		EmailNotifier[notification].call(null, ...args)
	}
	if (preference?.push === true || options.force) {
		WebPushNotifier[notification].call(null, ...args)
	}
}
