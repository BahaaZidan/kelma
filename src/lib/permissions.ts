import type { Session } from './server/auth';

export type CommentPermissions = {
	approve: boolean;
	delete: boolean;
	edit: boolean;
};

export function commentPermissions({
	comment,
	session,
}: {
	comment: { author: { id: string } | null; websiteId: number; published: boolean };
	session?: Pick<Session, 'user' | 'websitesOwnedByCurrentUser'>;
}): CommentPermissions {
	const loggedInUserId = session?.user.id;
	const websitesOwnedByLoggedInUser = session?.websitesOwnedByCurrentUser;
	const isWebsiteOwner = websitesOwnedByLoggedInUser?.includes(comment.websiteId) ?? false;

	return {
		delete: comment.author?.id === loggedInUserId || isWebsiteOwner,
		edit: comment.author?.id === loggedInUserId,
		approve: !comment.published && isWebsiteOwner,
	};
}

export type PagePermissions = {
	comment: boolean;
};

export function pagePermissions({
	page,
	session,
}: {
	page: { closed: boolean };
	session?: Session;
}): PagePermissions {
	return {
		comment: !!session?.user && !page.closed,
	};
}
