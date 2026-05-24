import type { Users } from "$lib/server/db/schema";
import { Notification } from "$lib/types/notifications";

type Satisfies<Constraint, Target extends Constraint> = Target;

export type Notifier = Satisfies<{
	[K in Notification]: (target: Users, ...args: any[]) => Promise<void>;
}, {
	[Notification.FOLLOW_REQUEST]: (target: Users, follower: Users) => Promise<void>
	[Notification.NEW_LIVETRACK]: (target: Users, athlete: Users) => Promise<void>
	[Notification.SELF_NEW_LIVETRACK]: (target: Users) => Promise<void>
}>
