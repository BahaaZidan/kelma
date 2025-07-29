import type { RequestEvent } from '@sveltejs/kit';

import { logger } from '$lib/logger';

export function isDomainTrusted(request: RequestEvent['request'], trustedDomains: string[]) {
	logger(`isDomainTrusted | ${request.referrer} | ${request.headers.get('Referer')}`);
	// TODO: this is probably wrong
	if (request.referrer === 'about:client') return true;
	const referer = request.headers.get('Referer');
	if (!referer) return true;

	const domain = new URL(referer).hostname;
	const result = trustedDomains.includes(domain);

	logger(`isDomainTrusted | ${JSON.stringify({ domain, result })}`);

	return result;
}
