/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
	runtimeDir: '.houdini',
	schemaPath: 'src/lib/schema.graphql',
	plugins: {
		'houdini-svelte': {},
	},
	scalars: {
		DateTime: {
			type: 'string',
		},
		URL: {
			type: 'string',
		},
		USCurrency: {
			type: 'string',
		},
	},
	exclude: ['src/lib/paraglide/**/*', 'src/worker-configuration.d.ts'],
	features: {
		imperativeCache: true,
	},
};

export default config;
