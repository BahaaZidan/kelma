/* eslint-disable no-console */

export function logger(message: string | object, meta?: { userId: string }) {
	console.log(
		typeof message === 'string' ? message : JSON.stringify(message),
		JSON.stringify(meta)
	);
}
