import {
	ar,
	bn,
	de,
	enUS,
	es,
	faIR,
	fr,
	hi,
	id,
	ja,
	ko,
	pt,
	ru,
	ta,
	te,
	tr,
	vi,
	zhCN,
	zhHK,
	zhTW,
	type Locale as DateLocale,
} from 'date-fns/locale';

import { getLocale, type Locale } from '$lib/paraglide/runtime';

export const LANGS: Record<
	Locale,
	{ label: string; native_label: string; dir: 'rtl' | 'ltr'; code: string }
> = {
	am: { label: 'Amharic', native_label: 'አማርኛ', dir: 'ltr', code: 'am' },
	ar: { label: 'Arabic', native_label: 'العربية', dir: 'rtl', code: 'ar' },
	bn: { label: 'Bengali', native_label: 'বাংলা', dir: 'ltr', code: 'bn' },
	de: { label: 'German', native_label: 'Deutsch', dir: 'ltr', code: 'de' },
	en: { label: 'English', native_label: 'English', dir: 'ltr', code: 'en' },
	es: { label: 'Spanish', native_label: 'Español', dir: 'ltr', code: 'es' },
	'fa-AF': { label: 'Dari', native_label: 'دری', dir: 'rtl', code: 'fa-AF' },
	fa: { label: 'Persian', native_label: 'فارسی', dir: 'rtl', code: 'fa' },
	fr: { label: 'French', native_label: 'Français', dir: 'ltr', code: 'fr' },
	hi: { label: 'Hindi', native_label: 'हिन्दी', dir: 'ltr', code: 'hi' },
	id: { label: 'Indonesian', native_label: 'Bahasa Indonesia', dir: 'ltr', code: 'id' },
	ja: { label: 'Japanese', native_label: '日本語', dir: 'ltr', code: 'ja' },
	ko: { label: 'Korean', native_label: '한국어', dir: 'ltr', code: 'ko' },
	mr: { label: 'Marathi', native_label: 'मराठी', dir: 'ltr', code: 'mr' },
	pt: { label: 'Portuguese', native_label: 'Português', dir: 'ltr', code: 'pt' },
	ru: { label: 'Russian', native_label: 'Русский', dir: 'ltr', code: 'ru' },
	sw: { label: 'Swahili', native_label: 'Kiswahili', dir: 'ltr', code: 'sw' },
	ta: { label: 'Tamil', native_label: 'தமிழ்', dir: 'ltr', code: 'ta' },
	te: { label: 'Telugu', native_label: 'తెలుగు', dir: 'ltr', code: 'te' },
	tr: { label: 'Turkish', native_label: 'Türkçe', dir: 'ltr', code: 'tr' },
	ur: { label: 'Urdu', native_label: 'اُردُو', dir: 'rtl', code: 'ur' },
	vi: { label: 'Vietnamese', native_label: 'Tiếng Việt', dir: 'ltr', code: 'vi' },
	yue: { label: 'Cantonese', native_label: '粵語', dir: 'ltr', code: 'yue' },
	'zh-Hans': { label: 'Simplified Chinese', native_label: '简体中文', dir: 'ltr', code: 'zh-Hans' },
	'zh-Hant': {
		label: 'Traditional Chinese',
		native_label: '繁體中文',
		dir: 'ltr',
		code: 'zh-Hant',
	},
};

export function getDir() {
	const locale = getLocale();
	return LANGS[locale].dir;
}

export const dateLocaleMap: Record<Locale, Pick<DateLocale, 'formatDistance'>> = {
	ar,
	en: enUS,
	// TODO: missing
	'fa-AF': faIR,
	fa: faIR,
	// TODO: probably missed up
	'zh-Hans': zhCN,
	'zh-Hant': zhHK,
	yue: zhTW,
	// TODO: missing
	am: enUS,
	bn,
	de,
	es,
	fr,
	hi,
	id,
	ja,
	ko,
	// TODO: missing
	mr: enUS,
	pt,
	ru,
	// TODO: missing
	sw: enUS,
	ta,
	te,
	tr,
	// TODO: missing
	ur: enUS,
	vi,
} as const;
