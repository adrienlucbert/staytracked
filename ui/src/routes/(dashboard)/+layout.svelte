<script lang="ts">
	import { GrowContainer } from '$lib/components/ui/layout';
	import { Separator } from '$lib/components/ui/separator';
	import { currentPage } from '$lib/pages.svelte';

	let { children } = $props();
	let cp = $derived(currentPage());
</script>

<GrowContainer>
	{#if cp}
		<h1 class="scroll-m-20 p-6 text-2xl font-semibold tracking-tight">
			<cp.icon class="center mr-4 inline size-6 align-middle" />
			{cp.title}
		</h1>
		<Separator orientation="horizontal" />
	{/if}
	<GrowContainer>
		{@render children?.()}
	</GrowContainer>
</GrowContainer>
