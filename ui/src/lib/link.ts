import { env } from '$env/dynamic/public';
import type { DisclosureDecision } from '$lib/types/privacy';

function baseURL(): string {
	return env.PUBLIC_URL ?? 'http://localhost'
}

export function getAthleteLink(username: string): URL {
	return new URL(`${env.PUBLIC_URL}/athlete/${username}`)
}

export function shareActivityLink(): URL {
	return new URL(`${baseURL()}/share-activity`)
}

export function disclosureEndpoint(): string {
	return `${baseURL()}/api/link/disclosure`
}

export function disclosureLink(decision: DisclosureDecision): URL {
	return new URL(`${disclosureEndpoint()}/${decision}`)
}
