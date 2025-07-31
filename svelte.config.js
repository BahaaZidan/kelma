import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			platformProxy: {
				configPath: 'wrangler.jsonc',
				persist: true,
			},
		}),

		alias: {
			$houdini: '.houdini/',
		},

		csp: {
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'object-src': ['none'],
				'img-src': ['self', 'data:', 'https:'],
				'style-src': ['self', 'unsafe-inline'],
				'base-uri': ['none'],
				'connect-src': ['self', 'https:', 'http:'],
				'frame-ancestors': ['*'],
			},
		},
	},
};

export default config;
