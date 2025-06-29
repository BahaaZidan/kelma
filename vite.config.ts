import path from 'path';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import houdini from 'houdini/vite';
import { defineConfig } from 'vite';
import { kitRoutes } from 'vite-plugin-kit-routes';
import { watchAndRun } from 'vite-plugin-watch-and-run';

export default defineConfig({
	plugins: [
		houdini(),
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url'],
		}),
		kitRoutes({
			generated_file_path: 'src/lib/__generated__/routes.ts',
		}),
		watchAndRun([
			{
				name: 'graphql:resolvers:gen',
				watch: [
					path.resolve('src/lib/graphql/schema.graphql'),
					path.resolve('graphql.config.server.ts'),
				],
				run: 'pnpm graphql:resolvers:gen',
				delay: 10,
				logs: ['streamError'],
			},
			{
				name: 'cf:gen',
				watch: [path.resolve('wrangler.jsonc')],
				run: 'pnpm cf:gen',
				delay: 10,
				logs: ['streamError'],
			},
		]),
	],
});
