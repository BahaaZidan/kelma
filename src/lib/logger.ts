/* eslint-disable no-console */

export function logger(message: string, meta?: { userId: string }) {
	console.log(message, JSON.stringify(meta));
}
