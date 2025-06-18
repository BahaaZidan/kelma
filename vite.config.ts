import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { kitRoutes } from 'vite-plugin-kit-routes';
import { watchAndRun } from 'vite-plugin-watch-and-run';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		kitRoutes({ generated_file_path: 'src/lib/__generated__/routes.ts' }),
		watchAndRun([
			{
				name: 'graphql:gen',
				watch: [path.resolve('src/lib/graphql/schema.graphql'), path.resolve('graphql.config.ts')],
				run: 'pnpm graphql:gen',
				delay: 10,
				logs: ['streamError'],
			},
		]),
	],
});
