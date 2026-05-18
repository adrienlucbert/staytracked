<script>
	import { m } from '$lib/paraglide/messages.js';
</script>

<footer
	class="grid w-full grid-flow-row place-content-center place-items-start gap-x-48 gap-y-8 border-t bg-white p-10 text-base sm:grid-flow-col sm:gap-y-10 lg:gap-x-64 xl:gap-x-96 dark:bg-neutral-800"
>
	<nav class="grid place-items-start gap-2">
		<span class="mb-2 font-bold uppercase opacity-80">{m.app_footer_explore()}</span>
		<a class="mb-1 underline-offset-4 hover:underline" href="/#how-it-works">
			{m.app_footer_how_it_works()}
		</a>
		<a
			class="mb-1 underline-offset-4 hover:underline"
			href="https://github.com/adrienlucbert/staytracked#self-hosting"
			target="_blank"
		>
			{m.app_footer_self_host()}
		</a>
		<a
			class="mb-1 underline-offset-4 hover:underline"
			href="https://github.com/adrienlucbert/staytracked/"
			target="_blank"
		>
			Github
		</a>
	</nav>
	<aside class="grid place-items-start gap-2">
		<span class="mb-2 font-bold uppercase opacity-80">{m.app_footer_notice()}</span>
		<span class="max-w-[260px]">
			{@html m.app_footer_notice_text()}
		</span>
	</aside>
</footer>
