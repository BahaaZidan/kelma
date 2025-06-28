import type { RequestEvent } from '@sveltejs/kit';
import { createSchema, createYoga } from 'graphql-yoga';

import { createLoaders } from '$lib/graphql/server/context';
import { getDB } from '$lib/server/db';

import { resolvers } from './resolvers';

const schemaFiles = import.meta.glob('$lib/graphql/schema.graphql', {
	query: '?raw',
	import: 'default',
	eager: true,
});
const typeDefs = [Object.values(schemaFiles)[0] as string];

export const requestHandler = createYoga<RequestEvent>({
	schema: createSchema({ typeDefs, resolvers }),
	graphqlEndpoint: '/api/graphql',
	fetchAPI: { Response },
	context: (event) => {
		const db = getDB(event.platform?.env.DB);

		return { ...event, db, loaders: createLoaders(db) };
	},
	graphiql: {
		title: 'gebna.tools API',
	},
});
