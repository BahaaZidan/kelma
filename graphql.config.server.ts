import type { CodegenConfig } from '@graphql-codegen/cli';
import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import type { TypeScriptResolversPluginConfig } from '@graphql-codegen/typescript-resolvers';
import type { IGraphQLConfig } from 'graphql-config';

const config: IGraphQLConfig = {
	schema: ['src/lib/schema.graphql'],
	extensions: {
		codegen: {
			generates: {
				'./src/lib/server/graphql/resolvers.types.ts': {
					plugins: [
						{
							add: {
								content: '/* eslint-disable */',
							},
						},
						'typescript',
						'typescript-resolvers',
					],
					config: {
						enumsAsTypes: true,
						maybeValue: 'T | null | undefined',
						useTypeImports: true,
						contextType: '$lib/server/graphql/context#Context',
						scalars: {
							ID: 'string',
							DateTime: 'Date',
							URL: 'URL',
						},
						mappers: {
							Website: '$lib/server/db/schema#WebsiteSelectModel',
							Page: '$lib/server/db/schema#PageSelectModel',
							Comment: '$lib/server/db/schema#CommentSelectModel',
							User: '$lib/server/db/schema#UserSelectModel',
							Reply: '$lib/server/db/schema#ReplySelectModel',
						},
					} satisfies TypeScriptPluginConfig & TypeScriptResolversPluginConfig,
				},
			},
		} satisfies CodegenConfig,
	},
};

export default config;
