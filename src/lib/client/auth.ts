import { createAuthClient } from 'better-auth/svelte';

const authClient = createAuthClient();

class SessionTokenBase {
	private key = 'auth-token';

	public set value(v: string) {
		localStorage.setItem(this.key, v);
	}

	public get value(): string {
		return localStorage.getItem(this.key) || '';
	}
}

export const SessionToken = new SessionTokenBase();

export const fetchWithAuth: typeof fetch = (input, init = {}) => {
	const headers = new Headers(init.headers || {});
	headers.set('Authorization', `Bearer ${SessionToken.value}`);

	const modifiedInit: RequestInit = {
		...init,
		headers,
	};

	return fetch(input, modifiedInit);
};

export async function signOut() {
	await authClient.signOut({
		fetchOptions: {
			headers: {
				Authorization: `Bearer ${SessionToken.value}`,
			},
		},
	});
	SessionToken.value = '';
	window.location.reload();
}

export async function githubSignIn(callbackURL?: string) {
	await authClient.signIn.social({ provider: 'github', callbackURL });
}
export async function googleSignIn(callbackURL?: string) {
	await authClient.signIn.social({ provider: 'google', callbackURL });
}
