import type { RequestEvent } from '@sveltejs/kit';
import { createSchema, createYoga } from 'graphql-yoga';

import { createLoaders } from '$lib/graphql/server/context';

import { resolvers } from './resolvers';

const schemaFiles = import.meta.glob('$lib/graphql/schema.graphql', {
	query: '?raw',
	import: 'default',
	eager: true,
});
const typeDefs = [Object.values(schemaFiles)[0] as string];

const schema = createSchema<RequestEvent>({ typeDefs, resolvers });

export const requestHandler = createYoga<RequestEvent>({
	schema,
	graphqlEndpoint: '/api/graphql',
	fetchAPI: { Response },
	context: (event) => ({ ...event, loaders: createLoaders() }),
});
