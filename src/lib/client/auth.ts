import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient();

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

export async function signOut(sendBearer?: boolean) {
	await authClient.signOut(
		sendBearer
			? {
					fetchOptions: {
						headers: {
							Authorization: `Bearer ${SessionToken.value}`,
						},
					},
				}
			: undefined
	);
	SessionToken.value = '';
	window.location.reload();
}
