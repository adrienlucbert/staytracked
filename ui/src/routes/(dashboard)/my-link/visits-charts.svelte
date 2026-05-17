<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { PerUserVisitsChart, TotalVisitsChart } from '$lib/components/charts/visits/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { m } from '$lib/paraglide/messages.js';
	import type { VisitsWithName } from '$lib/server/visits/visits';

	async function fetchFollowersStats(): Promise<VisitsWithName[]> {
		return fetch('/api/link/visits').then((r) => r.json());
	}
	let visitsPromise = $state(fetchFollowersStats());

	let perUserView = $state(true);
</script>

{#await visitsPromise}
	<div class="my-6 flex h-80 flex-row items-end gap-4 px-6 align-baseline">
		{#each { length: 15 } as _}
			<Skeleton
				style={`height: ${(20 / 5) * Math.round(Math.random() * (5 - 1) + 1)}rem;`}
				class="w-full"
			/>
		{/each}
	</div>
{:then visits}
	{#if visits}
		<div class="mb-8 flex items-center space-x-2">
			<Switch class="cursor-pointer" id="per-user" bind:checked={perUserView} />
			<Label class="cursor-pointer" for="per-user">{m.visits_detail_per_user()}</Label>
		</div>
		<div>
			<div class="flex">
				<div class="flex flex-grow flex-col">
					{#if perUserView}
						<PerUserVisitsChart {visits} />
					{:else}
						<TotalVisitsChart {visits} />
					{/if}
				</div>
			</div>
		</div>
	{:else}
		{m.visits_issue_loading()}
	{/if}
{:catch error}
	{error.message}
{/await}
