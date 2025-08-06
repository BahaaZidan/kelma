/* eslint-disable no-console */

export function logger(level: 'ERROR' | 'INFO', message: string | object) {
	console.log(level, typeof message === 'string' ? message : JSON.stringify(message));
}
