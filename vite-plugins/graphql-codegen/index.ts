/* eslint-disable no-console */
import { generate, loadContext, type CodegenContext } from '@graphql-codegen/cli';
import type { Types } from '@graphql-codegen/plugin-helpers';
import { normalizePath, type Plugin } from 'vite';

export async function graphqlCodegen(): Promise<Plugin> {
	const codegenContext = await loadContext();

	return {
		name: 'graphqlCodegen',
		async buildStart() {
			try {
				await generate(codegenContext);
			} catch (error) {
				console.error('GraphQL Codegen Error: ', { error });
			}
		},
		configureServer(server) {
			const matchCache = createMatchCache(codegenContext);

			async function checkFile(filePath: string) {
				if (matchCache.has(filePath)) {
					try {
						await generate(codegenContext);
					} catch {
						// GraphQL Codegen handles logging useful errors
						console.error('Generation failed in file watcher');
					}

					return;
				}

				if (isCodegenConfig(filePath, codegenContext)) {
					server.restart();
					return;
				}
			}

			async function initializeWatcher() {
				try {
					await matchCache.init();
					server.watcher.add(matchCache.entries());
				} catch (error) {
					console.error('Match cache initialization failed', error);
				}

				server.watcher.on('add', async (filePath) => {
					if (isGeneratedFile(filePath, codegenContext)) {
						return;
					}

					try {
						await matchCache.refresh();
					} catch (error) {
						console.error('Match cache refresh failed', error);
					}

					await checkFile(filePath);
				});

				server.watcher.on('change', async (filePath) => {
					await checkFile(filePath);
				});
			}

			initializeWatcher();
		},
	};
}

function createMatchCache(context: CodegenContext) {
	const cache = new Set<string>();

	const refresh = async () => {
		const matchers = [] as Promise<string[]>[];
		matchers.push(getDocumentPaths(context));
		matchers.push(getSchemaPaths(context));

		const results = await Promise.all(matchers);

		const entries = results.flat().map(normalizePath);

		cache.clear();

		for (const entry of entries) {
			cache.add(entry);
		}
	};

	return {
		init: refresh,
		refresh,
		has: (filePath: string) => cache.has(normalizePath(filePath)),
		entries: () => Array.from(cache),
	};
}

async function getDocumentPaths(context: CodegenContext): Promise<string[]> {
	const config = context.getConfig();

	const sourceDocuments = Object.values(config.generates).map((output) =>
		Array.isArray(output) ? undefined : output.documents
	);

	if (config.documents) {
		sourceDocuments.unshift(config.documents);
	}

	const normalized = sourceDocuments.filter((item) => item !== undefined).flat();

	if (!normalized.length) return [];

	const documents = await context.loadDocuments(normalized);

	if (!documents.length) return [];

	return documents
		.map(({ location = '' }) => location)
		.filter(Boolean)
		.map(normalizePath);
}

async function getSchemaPaths(context: CodegenContext): Promise<string[]> {
	const config = context.getConfig();

	const sourceSchemas = Object.values(config.generates).map((output) =>
		Array.isArray(output) ? undefined : output.schema
	);

	if (config.schema) {
		sourceSchemas.unshift(config.schema);
	}

	const normalized = sourceSchemas
		.filter((item): item is NonNullable<typeof item> => !!item)
		.flat();

	if (!normalized.length) return [];

	const schemas = await context.loadSchema(
		// loadSchema supports array of string, but typings are wrong
		normalized as unknown as Types.Schema
	);

	return (schemas.extensions.sources as { name: string }[])
		.map(({ name = '' }) => name)
		.filter(Boolean)
		.map(normalizePath);
}

function getGeneratesPaths(context: CodegenContext): string[] {
	const config = context.getConfig();

	return Object.keys(config.generates).map(normalizePath);
}

function isCodegenConfig(filePath: string, context: CodegenContext) {
	if (!context.filepath) return false;

	return normalizePath(filePath) === normalizePath(context.filepath);
}

function isGeneratedFile(filePath: string, context: CodegenContext) {
	const generatesPaths = getGeneratesPaths(context);

	const normalizedFilePath = normalizePath(filePath);

	return generatesPaths.some((path) => normalizedFilePath.includes(path));
}
