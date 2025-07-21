import type { RequestEvent } from '@sveltejs/kit';

export function isDomainTrusted(request: RequestEvent['request'], trustedDomains: string[]) {
	const referer = request.headers.get('Referer');
	if (!referer) return false;

	const domain = new URL(referer).hostname;
	return trustedDomains.includes(domain);
}
