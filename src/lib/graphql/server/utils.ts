export function toGlobalId(type: string, id: string | number): string {
	return Buffer.from(`${type}:${id}`).toString('base64');
}

export function fromGlobalId(globalId: string): { type: string; id: string } {
	const [type, id] = Buffer.from(globalId, 'base64').toString('utf8').split(':');
	return { type, id };
}
