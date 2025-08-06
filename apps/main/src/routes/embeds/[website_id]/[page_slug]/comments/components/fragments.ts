import { graphql } from '$houdini';

export const is_page_closed = graphql(`
	fragment IsPageClosed on Page {
		id
		closed
	}
`);

export const website_owner = graphql(`
	fragment WebsiteOwner on Website {
		id
		owner {
			id
		}
	}
`);
