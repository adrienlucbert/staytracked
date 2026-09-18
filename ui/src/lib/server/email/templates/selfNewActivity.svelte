<script lang="ts">
	import { Button, Container, Heading, Paragraph } from '@uraniadev/emailer';
	import { m } from '$lib/paraglide/messages.js';
	import type { Locale } from '$lib/paraglide/runtime';
	import { ActivityDisclosure } from '$lib/types/privacy';

	interface Props {
		locale?: Locale;
		athleteURL: string;
		accountURL: string;
		disclosure: ActivityDisclosure;
		shareURL: string;
		silentURL: string;
		privacyModeURL: string;
	}
	const { locale, athleteURL, accountURL, disclosure, shareURL, silentURL, privacyModeURL }: Props =
		$props();
	const isPending = disclosure === ActivityDisclosure.PENDING;
	const isSilent = disclosure === ActivityDisclosure.SILENT;
</script>

<Container>
	<Heading class="text-center">
		{isPending
			? m.mail_self_new_activity_pending_title({}, { locale })
			: m.mail_self_new_activity_title({}, { locale })}
	</Heading>
	{#if isPending}
		<Paragraph class="mx-auto mt-4 max-w-lg text-center text-sm">
			{m.mail_self_new_activity_pending_p1({}, { locale })}
		</Paragraph>
		<Button
			class="m-auto my-4 max-w-max rounded-lg bg-neutral-800 px-6 py-4 !text-white"
			href={shareURL}
		>
			{m.mail_self_new_activity_share_button({}, { locale })}
		</Button>
		<Button
			class="m-auto my-4 max-w-max rounded-lg border border-neutral-300 px-6 py-4"
			href={silentURL}
		>
			{m.mail_self_new_activity_silent_button({}, { locale })}
		</Button>
	{:else}
		<Button
			class="m-auto my-4 max-w-max rounded-lg bg-neutral-800 px-6 py-4 !text-white"
			href={athleteURL}
		>
			{m.mail_new_activity_button({}, { locale })}
		</Button>
	{/if}
	<Container class="mx-auto mt-8 max-w-lg">
		{#if isSilent}
			<Paragraph class="text-center text-sm">
				{@html m.mail_self_new_activity_p1(
					{ link: privacyModeURL, label: m.pages_my_link({}, { locale }) },
					{ locale }
				)}
			</Paragraph>
		{/if}
		<Paragraph class="text-center text-sm">
			{@html m.mail_self_new_activity_p2(
				{ link: accountURL, label: m.pages_account({}, { locale }) },
				{ locale }
			)}
		</Paragraph>
		<Paragraph class="text-center text-sm">
			{m.mail_trouble_clicking_button(
				{
					button: isPending
						? m.mail_self_new_activity_share_button({}, { locale })
						: m.mail_self_new_activity_button({}, { locale })
				},
				{ locale }
			)}
			<a style="overflow-wrap: break-word;" href={isPending ? shareURL : athleteURL}>
				{isPending ? shareURL : athleteURL}
			</a>
		</Paragraph>
	</Container>
</Container>
