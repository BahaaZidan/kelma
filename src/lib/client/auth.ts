import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient();

export async function signOut() {
	await authClient.signOut();
	window.location.reload();
}
