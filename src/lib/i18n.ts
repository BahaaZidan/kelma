import { type Locale } from '$lib/paraglide/runtime';

export function inferDir(lang: Locale): 'rtl' | 'ltr' {
	if (lang === 'ar') return 'rtl';
	return 'ltr';
}
