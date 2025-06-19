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
			type: 'Date',
		},
		URL: {
			type: 'URL',
		},
	},
};

export default config;
