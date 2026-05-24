<script lang="ts">
	import { Button, Container, Heading, Paragraph } from '@uraniadev/emailer';
	import { m } from '$lib/paraglide/messages.js';
	import type { Locale } from '$lib/paraglide/runtime';

	interface Props {
		locale?: Locale;
		athleteURL: string;
		accountURL: string;
	}
	const { locale, athleteURL, accountURL }: Props = $props();
</script>

<Container>
	<Heading class="text-center">{m.mail_self_new_activity_title({}, { locale })}</Heading>
	<Button
		class="m-auto my-4 max-w-max rounded-lg bg-neutral-800 px-6 py-4 !text-white"
		href={athleteURL}
	>
		{m.mail_new_activity_button({}, { locale })}
	</Button>
	<Container class="mx-auto mt-8 max-w-lg">
		<Paragraph class="text-center text-sm">
			{@html m.mail_self_new_activity_p1(
				{ link: accountURL, label: m.pages_account({}, { locale }) },
				{ locale }
			)}
		</Paragraph>
		<Paragraph class="text-center text-sm">
			{m.mail_trouble_clicking_button(
				{ button: m.mail_self_new_activity_button({}, { locale }) },
				{ locale }
			)}
			<a style="overflow-wrap: break-word;" href={athleteURL}>
				{athleteURL}
			</a>
		</Paragraph>
	</Container>
</Container>
