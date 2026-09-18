const ICON = 'https://img.icons8.com/color/96/cycling-road--v1.png'

function supportsActions(count: number): boolean {
	return count === 0 || (typeof Notification !== 'undefined' && (Notification.maxActions ?? 0) >= count)
}

self.addEventListener('push', function (event: any) {
	const data = event.data.json();
	const { title, ...opts }: { title: string } & NotificationOptions = data;

	if (opts.actions && !supportsActions(opts.actions.length)) {
		delete opts.actions
	}

	const registration = (self as any).registration as ServiceWorkerRegistration;
	event.waitUntil(
		registration.showNotification(title, opts)
	);
} as EventListener);

type Confirmations = Record<string, string>

async function answerDisclosure(endpoint: string, decision: string, confirmations?: Confirmations): Promise<void> {
	const registration = (self as any).registration as ServiceWorkerRegistration;

	try {
		const res = await fetch(`${endpoint}/${decision}`, {
			method: 'PUT',
			credentials: 'include',
		})
		if (!res.ok) {
			throw new Error(String(res.status))
		}
		const title = confirmations?.[decision]
		if (title) {
			await registration.showNotification(title, { icon: ICON, badge: ICON })
		}
	} catch {
		await clients.openWindow(`${new URL(endpoint).origin}/share-activity`)
	}
}

self.addEventListener('notificationclick', function (event: any) {
	event.notification.close();

	const data = event.notification?.data
	if (event.action && data?.disclosureEndpoint) {
		event.waitUntil(answerDisclosure(data.disclosureEndpoint, event.action, data.confirmations));
		return
	}

	if (data?.open) {
		event.waitUntil(clients.openWindow(data.open));
	}
})
