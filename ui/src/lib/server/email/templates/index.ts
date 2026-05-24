import type { Component, ComponentProps } from "svelte";
import { m } from '$lib/paraglide/messages.js';
import type { Locale } from "$lib/paraglide/runtime";

export type EmailTemplate<T extends Component<{ locale?: Locale } & ComponentProps<T>, any, any>> = {
	subject: (locale?: Locale) => string;
	template: T;
};

import { default as RecoverPasswordTemplate } from "./recoverPassword.svelte";
export const RecoverPassword: () => EmailTemplate<typeof RecoverPasswordTemplate> = () => ({
	subject: (locale) => m.mail_reset_password_subject({}, { locale }),
	template: RecoverPasswordTemplate,
})

import { default as AskVerifyEmailTemplate } from "./askVerifyEmail.svelte";
export const AskVerifyEmail: () => EmailTemplate<typeof AskVerifyEmailTemplate> = () => ({
	subject: (locale) => m.mail_verify_email_subject({}, { locale }),
	template: AskVerifyEmailTemplate,
})

import { default as NewFollowRequestTemplate } from "./newFollowRequest.svelte";
export const NewFollowRequest: (username: string) => EmailTemplate<typeof NewFollowRequestTemplate> = (username) => ({
	subject: (locale) => m.mail_new_follow_request_subject({ username }, { locale }),
	template: NewFollowRequestTemplate,
});

import { default as NewActivityTemplate } from "./newActivity.svelte";
export const NewActivity: ((username: string) => EmailTemplate<typeof NewActivityTemplate>) = (username: string) => ({
	subject: (locale) => m.mail_new_activity_subject({ username }, { locale }),
	template: NewActivityTemplate,
})

import { default as SelfNewActivityTemplate } from "./selfNewActivity.svelte";
export const SelfNewActivity: (() => EmailTemplate<typeof SelfNewActivityTemplate>) = () => ({
	subject: (locale) => m.mail_self_new_activity_subject({}, { locale }),
	template: SelfNewActivityTemplate,
})
