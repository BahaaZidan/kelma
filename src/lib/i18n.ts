export const supportedLanguages = ['ar', 'en'] as const;

export function inferDir(lang: (typeof supportedLanguages)[number]): 'rtl' | 'ltr' {
	if (lang === 'ar') return 'rtl';
	return 'ltr';
}
