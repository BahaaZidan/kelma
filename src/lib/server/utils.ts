import type { RequestEvent } from '@sveltejs/kit';

export function isDomainTrusted(request: RequestEvent['request'], trustedDomains: string[]) {
	// TODO: this is probably wrong
	if (request.referrer === 'about:client') return true;
	const referer = request.headers.get('Referer');
	if (!referer) return false;

	const domain = new URL(referer).hostname;
	return trustedDomains.includes(domain);
}
