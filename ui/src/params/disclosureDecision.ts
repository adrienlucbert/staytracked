import { disclosureDecisions } from '$lib/types/privacy';

export function match(param: string) {
	return (disclosureDecisions as readonly string[]).includes(param);
}
