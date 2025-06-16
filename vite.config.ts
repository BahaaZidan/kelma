import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { kitRoutes } from 'vite-plugin-kit-routes';

import { graphqlCodegen } from './vite-plugins/graphql-codegen';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		kitRoutes({ generated_file_path: 'src/lib/__generated__/routes.ts' }),
		graphqlCodegen(),
	],
});
