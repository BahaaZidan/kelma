import { Base64 } from 'js-base64';

import type { Comment, Page, User, Website } from './resolvers.types';

type NodeImplementer = NonNullable<
	User['__typename'] | Website['__typename'] | Page['__typename'] | Comment['__typename']
>;

export function toGlobalId(type: NodeImplementer, id: string | number): string {
	return Base64.encode(`${type}:${id}`);
}

export function fromGlobalId(globalId: string): { type: string; id: string } {
	const [type, id] = Base64.decode(globalId).split(':');
	return { type, id };
}
