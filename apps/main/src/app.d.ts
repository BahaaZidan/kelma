// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Session as Session_ } from '$lib/server/auth';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			session: Session_ | null;
		}
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
