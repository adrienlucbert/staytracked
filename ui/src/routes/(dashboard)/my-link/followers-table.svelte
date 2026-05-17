<script lang="ts">
	import { type FollowerStats } from '$lib/server/followers/followers';
	import type { UUID } from 'crypto';
	import { toast } from 'svelte-sonner';
	import { FollowersDataTable } from '$lib/components/tables/followers';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { m } from '$lib/paraglide/messages.js';

	let { showLastSeen }: { showLastSeen: boolean } = $props();

	async function fetchFollowersStats(): Promise<FollowerStats[]> {
		return fetch('/api/followers').then((r) => r.json());
	}
	let followersStatsPromise = $state(fetchFollowersStats());

	async function refreshFollowersStats(): Promise<FollowerStats[]> {
		const stats = await fetchFollowersStats();
		followersStatsPromise = Promise.resolve(stats);
		return stats;
	}

	async function updateFollowerStatus(
		followerUserUUID: UUID,
		action: 'deny' | 'approve' | 'ban'
	): Promise<void> {
		try {
			const url = `/api/followers/${followerUserUUID}/${action}`;
			const res = await fetch(url, { method: 'PUT' });
			if (res.ok) {
				await refreshFollowersStats();
			} else {
				const { message } = await res.json().catch(() => {
					throw m.unexpected_server_error({ code: res.status });
				});
				throw message;
			}
		} catch (error) {
			toast.error(m.an_error_occurred(), {
				description: String(error),
				duration: 10000
			});
		}
	}

	const approveFollower = async (followerUserUUID: UUID) =>
		updateFollowerStatus(followerUserUUID, 'approve');

	const denyFollower = async (followerUserUUID: UUID) =>
		updateFollowerStatus(followerUserUUID, 'deny');

	const banFollower = async (followerUserUUID: UUID) =>
		updateFollowerStatus(followerUserUUID, 'ban');
</script>

{#await followersStatsPromise}
	<Skeleton class="h-20 w-full" />
{:then stats}
	{#if stats}
		<FollowersDataTable
			followersStats={stats}
			{showLastSeen}
			{approveFollower}
			{denyFollower}
			{banFollower}
		/>
	{:else}
		{m.followers_issue_loading()}
	{/if}
{:catch error}
	{error.message}
{/await}
