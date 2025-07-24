import type { IGraphQLConfig } from 'graphql-config';

const config: IGraphQLConfig = {
	schema: ['src/lib/schema.graphql', '.houdini/graphql/schema.graphql'],
	documents: ['**/*.gql', '**/*.ts', '**/*.svelte', './.houdini/graphql/documents.gql'],
};

export default config;
