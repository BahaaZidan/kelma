import { Base64 } from 'js-base64';

export function toGlobalId(type: string, id: string | number): string {
	return Base64.encode(`${type}:${id}`);
}

export function fromGlobalId(globalId: string): { type: string; id: string } {
	const [type, id] = Base64.decode(globalId).split(':');
	return { type, id };
}
