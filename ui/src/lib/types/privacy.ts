export enum PrivacyMode {
	PUBLIC = 'public',
	ON_DEMAND = 'on_demand',
	INCOGNITO = 'incognito',
}

export enum ActivityDisclosure {
	SHARED = 'shared',
	PENDING = 'pending',
	SILENT = 'silent',
}

export const disclosureDecisions = ['share', 'silent'] as const
export type DisclosureDecision = (typeof disclosureDecisions)[number]

export function disclosureForPrivacyMode(mode: PrivacyMode): ActivityDisclosure {
	switch (mode) {
		case PrivacyMode.PUBLIC: return ActivityDisclosure.SHARED
		case PrivacyMode.ON_DEMAND: return ActivityDisclosure.PENDING
		case PrivacyMode.INCOGNITO: return ActivityDisclosure.SILENT
	}
}
