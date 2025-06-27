/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
	runtimeDir: '.houdini',
	schemaPath: 'src/lib/graphql/schema.graphql',
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
	},
	exclude: ['src/lib/paraglide/**/*'],
};

export default config;
