import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient();

export async function signOut() {
	await authClient.signOut();
	window.location.reload();
}

export async function githubSignIn(callbackURL?: string) {
	await authClient.signIn.social({ provider: 'github', callbackURL });
}
export async function googleSignIn(callbackURL?: string) {
	await authClient.signIn.social({ provider: 'google', callbackURL });
}
